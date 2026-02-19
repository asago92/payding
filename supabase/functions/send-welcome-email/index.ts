import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

function buildWelcomeHtml(): string {
  const year = new Date().getFullYear()
  return `<!DOCTYPE html>
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
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#ecfdf5;border-radius:12px;">
    <tr><td style="padding:20px;text-align:center;">
      <span style="font-size:32px;">🎉</span>
      <p style="margin:8px 0 0;color:#059669;font-size:16px;font-weight:600;">You're all set!</p>
    </td></tr>
  </table>
</td></tr>
<tr><td style="padding:24px 32px 0;">
  <p style="margin:0 0 4px;color:#111827;font-size:20px;font-weight:700;">Welcome to Payding</p>
  <p style="margin:12px 0 0;color:#4b5563;font-size:15px;line-height:1.6;">Thanks for signing up. You're ready to start tracking your international payments and get notified when exchange rates move in your favor.</p>
</td></tr>
<tr><td style="padding:20px 32px 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
    <tr><td style="padding:16px;border-bottom:1px solid #e5e7eb;">
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="width:32px;height:32px;background:#eef2ff;border-radius:8px;text-align:center;vertical-align:middle;font-size:16px;line-height:32px;">📊</td>
        <td style="padding-left:12px;">
          <p style="margin:0;color:#111827;font-size:14px;font-weight:600;">Log payments</p>
          <p style="margin:2px 0 0;color:#6b7280;font-size:13px;">Track your international income</p>
        </td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:16px;border-bottom:1px solid #e5e7eb;">
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="width:32px;height:32px;background:#eef2ff;border-radius:8px;text-align:center;vertical-align:middle;font-size:16px;line-height:32px;">💱</td>
        <td style="padding-left:12px;">
          <p style="margin:0;color:#111827;font-size:14px;font-weight:600;">Monitor rates</p>
          <p style="margin:2px 0 0;color:#6b7280;font-size:13px;">Watch exchange rate movements daily</p>
        </td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:16px;">
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="width:32px;height:32px;background:#eef2ff;border-radius:8px;text-align:center;vertical-align:middle;font-size:16px;line-height:32px;">🔔</td>
        <td style="padding-left:12px;">
          <p style="margin:0;color:#111827;font-size:14px;font-weight:600;">Get alerts</p>
          <p style="margin:2px 0 0;color:#6b7280;font-size:13px;">Know when it's the best time to convert</p>
        </td>
      </tr></table>
    </td></tr>
  </table>
</td></tr>
<tr><td style="padding:28px 32px 0;text-align:center;">
  <a href="https://www.payding.xyz/" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;text-decoration:none;padding:13px 36px;border-radius:10px;font-weight:600;font-size:14px;letter-spacing:-0.2px;">Get Started</a>
</td></tr>
<tr><td style="padding:28px 32px;text-align:center;">
  <p style="margin:0;color:#9ca3af;font-size:11px;line-height:1.6;">© ${year} Payding · All rights reserved</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured')
    }

    const body = await req.json()

    // Test mode: skip auth, just send the email
    if (body.action === 'send_test') {
      const testEmail = body.email
      if (!testEmail) throw new Error('No email provided for test')

      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Payding <welcome@contact.payding.xyz>',
          to: [testEmail],
          subject: 'Welcome to Payding! 🎉',
          html: buildWelcomeHtml(),
        }),
      })

      if (!resendResponse.ok) {
        const errText = await resendResponse.text()
        throw new Error(`Resend error: ${errText}`)
      }

      const resendData = await resendResponse.json()
      return new Response(
        JSON.stringify({ success: true, id: resendData.id, sent_to: testEmail }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Normal mode: requires auth
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      throw new Error('Unable to get user')
    }

    const userEmail = body.email || user.email

    if (!userEmail) {
      throw new Error('No email address found')
    }

    // Check if welcome email was already sent by looking at profile metadata
    const { data: profile } = await supabase
      .from('profiles')
      .select('welcome_email_sent')
      .eq('user_id', user.id)
      .single()

    if (profile?.welcome_email_sent) {
      return new Response(
        JSON.stringify({ message: 'Welcome email already sent' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send welcome email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Payding <welcome@contact.payding.xyz>',
        to: [userEmail],
        subject: 'Welcome to Payding! 🎉',
        html: buildWelcomeHtml(),
      }),
    })

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text()
      console.error(`Resend API error [${resendResponse.status}]: ${errorData}`)
      throw new Error(`Failed to send email: ${resendResponse.status}`)
    }

    const resendData = await resendResponse.json()
    console.log('Welcome email sent:', resendData)

    // Mark welcome email as sent
    await supabase
      .from('profiles')
      .update({ welcome_email_sent: true })
      .eq('user_id', user.id)

    return new Response(
      JSON.stringify({ success: true, id: resendData.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) {
    console.error('Error sending welcome email:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
