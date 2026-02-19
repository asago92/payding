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

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, base, target, date } = await req.json()
    
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
                  const emoji = percentChange >= 0 ? '📈' : '📉'
                  const actionText = percentChange >= 0 
                    ? "Now might be a good time to convert!" 
                    : "You may want to wait for a better rate."

                  const resendResponse = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${RESEND_API_KEY}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      from: 'Payding <alerts@contact.payding.xyz>',
                      to: [profile.email],
                      subject: `${emoji} ${payment.payment_currency}/${payment.local_currency} rate ${direction} ${Math.abs(percentChange).toFixed(2)}%`,
                      html: `
                        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                          <div style="text-align: center; margin-bottom: 32px;">
                            <div style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); width: 48px; height: 48px; border-radius: 12px; line-height: 48px; color: white; font-size: 24px; font-weight: bold;">$</div>
                            <h1 style="margin: 16px 0 0; font-size: 24px; color: #1a1a2e;">Exchange Rate Alert</h1>
                          </div>
                          
                          <div style="background: #f8f9fa; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                            <p style="margin: 0 0 8px; color: #4a4a68; font-size: 14px;">Your ${payment.payment_currency} ${payment.amount} payment from ${payment.payment_source}</p>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                              <div>
                                <p style="margin: 0; color: #8888a0; font-size: 12px;">Rate at receipt (${payment.date_received})</p>
                                <p style="margin: 4px 0 0; color: #1a1a2e; font-size: 20px; font-weight: bold;">1 ${payment.payment_currency} = ${rateAtReceipt.toFixed(4)} ${payment.local_currency}</p>
                              </div>
                            </div>
                            <div>
                              <p style="margin: 0; color: #8888a0; font-size: 12px;">Current rate</p>
                              <p style="margin: 4px 0 0; color: ${percentChange >= 0 ? '#16a34a' : '#dc2626'}; font-size: 20px; font-weight: bold;">1 ${payment.payment_currency} = ${currentRate.toFixed(4)} ${payment.local_currency}</p>
                            </div>
                          </div>
                          
                          <div style="text-align: center; background: ${percentChange >= 0 ? '#f0fdf4' : '#fef2f2'}; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                            <p style="margin: 0; font-size: 28px;">${emoji}</p>
                            <p style="margin: 8px 0 0; color: ${percentChange >= 0 ? '#16a34a' : '#dc2626'}; font-size: 18px; font-weight: bold;">${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(2)}% change</p>
                            <p style="margin: 8px 0 0; color: #4a4a68; font-size: 14px;">${actionText}</p>
                          </div>
                          
                          <div style="text-align: center; margin: 32px 0;">
                            <a href="https://payding.lovable.app" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                              View Dashboard →
                            </a>
                          </div>
                          
                          <p style="color: #8888a0; font-size: 12px; text-align: center; margin-top: 40px; border-top: 1px solid #e5e5f0; padding-top: 20px;">
                            You're receiving this because you set up a ${payment.notification_type} alert on Payding.<br/>
                            © ${new Date().getFullYear()} Payding. All rights reserved.
                          </p>
                        </div>
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
