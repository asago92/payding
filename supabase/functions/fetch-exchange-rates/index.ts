import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Frankfurter API - free, uses ECB (European Central Bank) reference rates
// ECB publishes rates once daily around 16:00 CET - these are the official mid-market rates
// Historical date queries return the ECB close rate for that specific date
const FRANKFURTER_API = 'https://api.frankfurter.app'

interface ExchangeRateResponse {
  rates: Record<string, number>
  base: string
  date: string
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, base, target, date, email } = await req.json()
    
    console.log(`Exchange rate request: action=${action}, base=${base}, target=${target}, date=${date}`)

    if (action === 'get_rate') {
      // Fetch rate for a specific date (historical) or latest
      const endpoint = date 
        ? `${FRANKFURTER_API}/${date}?from=${base}&to=${target}`
        : `${FRANKFURTER_API}/latest?from=${base}&to=${target}`
      
      console.log(`Fetching from: ${endpoint}`)
      
      const response = await fetch(endpoint)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Frankfurter API error: ${response.status} - ${errorText}`)
        throw new Error(`Exchange rate API error: ${response.status}`)
      }
      
      const data: ExchangeRateResponse = await response.json()
      console.log(`Received rate data:`, data)
      
      return new Response(
        JSON.stringify({
          rate: data.rates[target],
          base: data.base,
          target,
          date: data.date,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'check_all_payments') {
      // This action is for scheduled checks - fetch all active payments and compare rates
      // The cron job runs hourly; we check each payment's timezone to see if it's ~8 AM there
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseKey)

      // Get all active payments
      const { data: payments, error } = await supabase
        .from('payments')
        .select('*')
        .eq('is_active', true)

      if (error) {
        console.error('Error fetching payments:', error)
        throw error
      }

      console.log(`Found ${payments?.length || 0} active payments to check`)

      // Helper to check if it's approximately 8 AM in a given timezone
      const isEightAMInTimezone = (timezone: string): boolean => {
        try {
          const now = new Date()
          const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            hour: 'numeric',
            hour12: false,
          })
          const hourStr = formatter.format(now)
          const hour = parseInt(hourStr, 10)
          // Check if it's between 8:00-8:59 AM
          return hour === 8
        } catch (e) {
          console.error(`Invalid timezone ${timezone}, defaulting to UTC`)
          return false
        }
      }

      const results = []

      for (const payment of payments || []) {
        try {
          // Check if it's 8 AM in the user's timezone
          const userTimezone = payment.timezone || 'UTC'
          if (!isEightAMInTimezone(userTimezone)) {
            console.log(`Skipping payment ${payment.id}: not 8 AM in ${userTimezone}`)
            continue
          }

          console.log(`Processing payment ${payment.id}: it's 8 AM in ${userTimezone}`)

          // Get current rate
          // Get current rate
          const currentRateResponse = await fetch(
            `${FRANKFURTER_API}/latest?from=${payment.payment_currency}&to=${payment.local_currency}`
          )
          
          if (!currentRateResponse.ok) {
            console.error(`Failed to fetch current rate for payment ${payment.id}`)
            continue
          }
          
          const currentData: ExchangeRateResponse = await currentRateResponse.json()
          const currentRate = currentData.rates[payment.local_currency]

          // Get rate from payment date
          const paymentDateRateResponse = await fetch(
            `${FRANKFURTER_API}/${payment.date_received}?from=${payment.payment_currency}&to=${payment.local_currency}`
          )
          
          if (!paymentDateRateResponse.ok) {
            console.error(`Failed to fetch historical rate for payment ${payment.id}`)
            continue
          }
          
          const historicalData: ExchangeRateResponse = await paymentDateRateResponse.json()
          const rateAtReceipt = historicalData.rates[payment.local_currency]

          // Calculate percentage change: ECB close rate at date received vs current ECB mid-market rate
          // Positive = local currency strengthened (better to convert now)
          // Negative = local currency weakened (should have converted earlier)
          const percentChange = ((currentRate - rateAtReceipt) / rateAtReceipt) * 100

          console.log(`Payment ${payment.id}: ECB close rate at receipt (${payment.date_received})=${rateAtReceipt}, current live rate=${currentRate}, change=${percentChange.toFixed(2)}%`)

          // Update payment with current rate info
          await supabase
            .from('payments')
            .update({
              exchange_rate_at_receipt: rateAtReceipt,
              last_checked_rate: currentRate,
              last_rate_check: new Date().toISOString(),
            })
            .eq('id', payment.id)

          // Check if notification should be sent
          const shouldNotify = 
            payment.notification_type === 'daily' ||
            (payment.notification_type === 'threshold' && percentChange >= (payment.threshold || 0))

          // Send in-app notification if needed
          if (shouldNotify && payment.notification_method === 'push') {
            try {
              const direction = percentChange >= 0 ? 'improved' : 'dropped'
              const arrow = percentChange >= 0 ? '↑' : '↓'
              await supabase
                .from('notifications')
                .insert({
                  user_id: payment.user_id,
                  payment_id: payment.id,
                  title: `${arrow} ${payment.payment_currency}/${payment.local_currency} ${direction} ${Math.abs(percentChange).toFixed(2)}%`,
                  message: `Your ${payment.payment_currency} ${Number(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} from ${payment.payment_source} — rate went from ${rateAtReceipt.toFixed(4)} to ${currentRate.toFixed(4)}.`,
                  percent_change: percentChange,
                  payment_currency: payment.payment_currency,
                  local_currency: payment.local_currency,
                })
              console.log(`In-app notification created for payment ${payment.id}`)
            } catch (pushError) {
              console.error(`Error creating in-app notification for payment ${payment.id}:`, pushError)
            }
          }

          // Send email if needed
          if (shouldNotify && payment.notification_method === 'email') {
            try {
              // Get user email from profiles
              const { data: profile } = await supabase
                .from('profiles')
                .select('email')
                .eq('user_id', payment.user_id)
                .single()

              if (profile?.email) {
                const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
                if (RESEND_API_KEY) {
                  const direction = percentChange >= 0 ? 'improved' : 'dropped'
                  const isPositive = percentChange >= 0
                  const actionText = isPositive 
                    ? "The rate has improved — now might be a good time to convert." 
                    : "The rate has dipped. You may want to hold off for now."
                  
                  // Calculate local currency equivalents
                  const localAmountAtReceipt = (payment.amount * rateAtReceipt).toFixed(2)
                  const localAmountNow = (payment.amount * currentRate).toFixed(2)
                  const localDifference = (payment.amount * currentRate - payment.amount * rateAtReceipt).toFixed(2)
                  const accentColor = isPositive ? '#059669' : '#dc2626'
                  const accentBg = isPositive ? '#ecfdf5' : '#fef2f2'
                  const arrow = isPositive ? '↑' : '↓'

                  const resendResponse = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${RESEND_API_KEY}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      from: 'Payding <alerts@contact.payding.xyz>',
                      to: [profile.email],
                      subject: `${arrow} ${escapeHtml(payment.payment_currency)}/${escapeHtml(payment.local_currency)} ${direction} ${Math.abs(percentChange).toFixed(2)}% — ${escapeHtml(payment.payment_source)}`,
                      html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

<!-- Header -->
<tr><td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:28px 32px;text-align:center;">
  <table cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr>
    <td style="width:36px;height:36px;background:rgba(255,255,255,0.2);border-radius:10px;text-align:center;vertical-align:middle;color:#fff;font-size:18px;font-weight:700;line-height:36px;">P</td>
    <td style="padding-left:12px;color:#ffffff;font-size:18px;font-weight:600;letter-spacing:-0.3px;">Payding</td>
  </tr></table>
</td></tr>

<!-- Change Badge -->
<tr><td style="padding:28px 32px 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${accentBg};border-radius:12px;">
    <tr><td style="padding:20px;text-align:center;">
      <span style="font-size:32px;font-weight:700;color:${accentColor};letter-spacing:-1px;">${isPositive ? '+' : ''}${percentChange.toFixed(2)}%</span>
      <p style="margin:6px 0 0;color:${accentColor};font-size:13px;font-weight:500;">${actionText}</p>
    </td></tr>
  </table>
</td></tr>

<!-- Payment Info -->
<tr><td style="padding:24px 32px 0;">
  <p style="margin:0 0 4px;color:#6b7280;font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">Payment</p>
  <p style="margin:0;color:#111827;font-size:17px;font-weight:600;">${escapeHtml(payment.payment_currency)} ${Number(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} from ${escapeHtml(payment.payment_source)}</p>
</td></tr>

<!-- Rate Comparison -->
<tr><td style="padding:20px 32px 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
    <tr>
      <td width="50%" style="padding:16px;border-right:1px solid #e5e7eb;vertical-align:top;">
        <p style="margin:0 0 2px;color:#9ca3af;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:0.4px;">At receipt</p>
        <p style="margin:0;color:#374151;font-size:15px;font-weight:600;">${rateAtReceipt.toFixed(4)}</p>
        <p style="margin:4px 0 0;color:#6b7280;font-size:12px;">${escapeHtml(payment.date_received)}</p>
      </td>
      <td width="50%" style="padding:16px;vertical-align:top;">
        <p style="margin:0 0 2px;color:#9ca3af;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:0.4px;">Current</p>
        <p style="margin:0;color:${accentColor};font-size:15px;font-weight:600;">${currentRate.toFixed(4)}</p>
        <p style="margin:4px 0 0;color:#6b7280;font-size:12px;">1 ${escapeHtml(payment.payment_currency)} → ${escapeHtml(payment.local_currency)}</p>
      </td>
    </tr>
  </table>
</td></tr>

<!-- Local Currency Equivalent -->
<tr><td style="padding:20px 32px 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;">
    <tr><td style="padding:16px;">
      <p style="margin:0 0 10px;color:#9ca3af;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:0.4px;">Local currency equivalent (${escapeHtml(payment.local_currency)})</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#6b7280;font-size:13px;">At receipt</td>
          <td align="right" style="color:#374151;font-size:13px;font-weight:600;">${escapeHtml(payment.local_currency)} ${Number(localAmountAtReceipt).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr><td colspan="2" style="padding:6px 0;"><div style="border-top:1px solid #e5e7eb;"></div></td></tr>
        <tr>
          <td style="color:#6b7280;font-size:13px;">Today</td>
          <td align="right" style="color:#374151;font-size:13px;font-weight:600;">${escapeHtml(payment.local_currency)} ${Number(localAmountNow).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr><td colspan="2" style="padding:6px 0;"><div style="border-top:1px solid #e5e7eb;"></div></td></tr>
        <tr>
          <td style="color:${accentColor};font-size:13px;font-weight:600;">Difference</td>
          <td align="right" style="color:${accentColor};font-size:13px;font-weight:700;">${isPositive ? '+' : ''}${escapeHtml(payment.local_currency)} ${Number(localDifference).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        </tr>
      </table>
    </td></tr>
  </table>
</td></tr>

<!-- Footer -->
<tr><td style="padding:28px 32px;text-align:center;">
  <p style="margin:0;color:#9ca3af;font-size:11px;line-height:1.6;">
    You're receiving this because you set up a ${escapeHtml(payment.notification_type)} alert on Payding.<br/>
    <a href="https://www.payding.xyz/unsubscribe?id=${payment.id}" style="color:#6b7280;text-decoration:underline;">Unsubscribe from this alert</a><br/>
    © ${new Date().getFullYear()} Payding · All rights reserved
  </p>
</td></tr>

</table>
</td></tr>
</table>
</body></html>
                      `,
                    }),
                  })

                  if (!resendResponse.ok) {
                    const errText = await resendResponse.text()
                    console.error(`Failed to send alert email for payment ${payment.id}: ${errText}`)
                  } else {
                    console.log(`Alert email sent to ${profile.email} for payment ${payment.id}`)
                  }
                }
              }
            } catch (emailError) {
              console.error(`Error sending email for payment ${payment.id}:`, emailError)
            }
          }

          results.push({
            payment_id: payment.id,
            user_id: payment.user_id,
            payment_currency: payment.payment_currency,
            local_currency: payment.local_currency,
            rate_at_receipt: rateAtReceipt,
            current_rate: currentRate,
            percent_change: percentChange,
            should_notify: shouldNotify,
            notification_type: payment.notification_type,
            notification_method: payment.notification_method,
          })
        } catch (paymentError) {
          console.error(`Error processing payment ${payment.id}:`, paymentError)
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          checked: results.length,
          results 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'send_test_alert') {
      const testEmail = email || 'test@example.com'
      const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
      if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY not configured')

      // Mock data for preview
      const mock = {
        payment_currency: 'USD', local_currency: 'INR', amount: 5000,
        payment_source: 'Upwork', date_received: '2025-01-15',
        notification_type: 'daily',
      }
      const rateAtReceipt = 83.2500
      const currentRate = 84.7800
      const percentChange = ((currentRate - rateAtReceipt) / rateAtReceipt) * 100
      const isPositive = percentChange >= 0
      const direction = isPositive ? 'improved' : 'dropped'
      const actionText = isPositive 
        ? "The rate has improved — now might be a good time to convert." 
        : "The rate has dipped. You may want to hold off for now."
      const localAmountAtReceipt = (mock.amount * rateAtReceipt).toFixed(2)
      const localAmountNow = (mock.amount * currentRate).toFixed(2)
      const localDifference = (mock.amount * currentRate - mock.amount * rateAtReceipt).toFixed(2)
      const accentColor = isPositive ? '#059669' : '#dc2626'
      const accentBg = isPositive ? '#ecfdf5' : '#fef2f2'
      const arrow = isPositive ? '↑' : '↓'

      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Payding <alerts@contact.payding.xyz>',
          to: [testEmail],
          subject: `${arrow} ${mock.payment_currency}/${mock.local_currency} ${direction} ${Math.abs(percentChange).toFixed(2)}% — ${mock.payment_source}`,
          html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:28px 32px;text-align:center;">
  <table cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr>
    <td style="width:36px;height:36px;background:rgba(255,255,255,0.2);border-radius:10px;text-align:center;vertical-align:middle;color:#fff;font-size:18px;font-weight:700;line-height:36px;">P</td>
    <td style="padding-left:12px;color:#ffffff;font-size:18px;font-weight:600;letter-spacing:-0.3px;">Payding</td>
  </tr></table>
</td></tr>
<tr><td style="padding:28px 32px 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${accentBg};border-radius:12px;">
    <tr><td style="padding:20px;text-align:center;">
      <span style="font-size:32px;font-weight:700;color:${accentColor};letter-spacing:-1px;">${isPositive ? '+' : ''}${percentChange.toFixed(2)}%</span>
      <p style="margin:6px 0 0;color:${accentColor};font-size:13px;font-weight:500;">${actionText}</p>
    </td></tr>
  </table>
</td></tr>
<tr><td style="padding:24px 32px 0;">
  <p style="margin:0 0 4px;color:#6b7280;font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">Payment</p>
  <p style="margin:0;color:#111827;font-size:17px;font-weight:600;">${mock.payment_currency} ${Number(mock.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} from ${mock.payment_source}</p>
</td></tr>
<tr><td style="padding:20px 32px 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
    <tr>
      <td width="50%" style="padding:16px;border-right:1px solid #e5e7eb;vertical-align:top;">
        <p style="margin:0 0 2px;color:#9ca3af;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:0.4px;">At receipt</p>
        <p style="margin:0;color:#374151;font-size:15px;font-weight:600;">${rateAtReceipt.toFixed(4)}</p>
        <p style="margin:4px 0 0;color:#6b7280;font-size:12px;">${mock.date_received}</p>
      </td>
      <td width="50%" style="padding:16px;vertical-align:top;">
        <p style="margin:0 0 2px;color:#9ca3af;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:0.4px;">Current</p>
        <p style="margin:0;color:${accentColor};font-size:15px;font-weight:600;">${currentRate.toFixed(4)}</p>
        <p style="margin:4px 0 0;color:#6b7280;font-size:12px;">1 ${mock.payment_currency} → ${mock.local_currency}</p>
      </td>
    </tr>
  </table>
</td></tr>
<tr><td style="padding:20px 32px 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;">
    <tr><td style="padding:16px;">
      <p style="margin:0 0 10px;color:#9ca3af;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:0.4px;">Local currency equivalent (${mock.local_currency})</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#6b7280;font-size:13px;">At receipt</td>
          <td align="right" style="color:#374151;font-size:13px;font-weight:600;">${mock.local_currency} ${Number(localAmountAtReceipt).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr><td colspan="2" style="padding:6px 0;"><div style="border-top:1px solid #e5e7eb;"></div></td></tr>
        <tr>
          <td style="color:#6b7280;font-size:13px;">Today</td>
          <td align="right" style="color:#374151;font-size:13px;font-weight:600;">${mock.local_currency} ${Number(localAmountNow).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr><td colspan="2" style="padding:6px 0;"><div style="border-top:1px solid #e5e7eb;"></div></td></tr>
        <tr>
          <td style="color:${accentColor};font-size:13px;font-weight:600;">Difference</td>
          <td align="right" style="color:${accentColor};font-size:13px;font-weight:700;">${isPositive ? '+' : ''}${mock.local_currency} ${Number(localDifference).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        </tr>
      </table>
    </td></tr>
  </table>
</td></tr>
<tr><td style="padding:28px 32px;text-align:center;">
  <p style="margin:0;color:#9ca3af;font-size:11px;line-height:1.6;">
    This is a test email from Payding.<br/>
    <a href="#" style="color:#6b7280;text-decoration:underline;">Unsubscribe from this alert</a><br/>
    © ${new Date().getFullYear()} Payding · All rights reserved
  </p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`,
        }),
      })

      if (!resendResponse.ok) {
        const errText = await resendResponse.text()
        throw new Error(`Resend error: ${errText}`)
      }

      const resendData = await resendResponse.json()
      return new Response(
        JSON.stringify({ success: true, email_id: resendData.id, sent_to: testEmail }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    console.error('Edge function error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
