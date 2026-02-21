import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

function buildVerificationHtml(confirmUrl: string): string {
  const year = new Date().getFullYear()
  return `<!DOCTYPE html>
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

<!-- Badge -->
<tr><td style="padding:28px 32px 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#eef2ff;border-radius:12px;">
    <tr><td style="padding:20px;text-align:center;">
      <span style="font-size:32px;">✉️</span>
      <p style="margin:8px 0 0;color:#4f46e5;font-size:16px;font-weight:600;">Verify your email</p>
    </td></tr>
  </table>
</td></tr>

<!-- Body -->
<tr><td style="padding:24px 32px 0;">
  <p style="margin:0 0 4px;color:#111827;font-size:20px;font-weight:700;">Almost there!</p>
  <p style="margin:12px 0 0;color:#4b5563;font-size:15px;line-height:1.6;">Thanks for signing up for Payding. Please confirm your email address by clicking the button below to activate your account.</p>
</td></tr>

<!-- CTA Button -->
<tr><td style="padding:28px 32px 0;text-align:center;">
  <a href="${confirmUrl}" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:10px;font-weight:600;font-size:15px;letter-spacing:-0.2px;">Verify Email Address</a>
</td></tr>

<!-- Info cards -->
<tr><td style="padding:24px 32px 0;">
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

<!-- Link fallback -->
<tr><td style="padding:20px 32px 0;">
  <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">If the button doesn't work, copy and paste this link into your browser:</p>
  <p style="margin:4px 0 0;color:#4f46e5;font-size:12px;line-height:1.6;word-break:break-all;">${confirmUrl}</p>
</td></tr>

<!-- Footer -->
<tr><td style="padding:28px 32px;text-align:center;">
  <p style="margin:0;color:#9ca3af;font-size:11px;line-height:1.6;">
    This link expires in 24 hours.<br/>
    © ${year} Payding · All rights reserved
  </p>
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
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY is not configured')

    const body = await req.json()

    // Test mode: send test email with a dummy link
    if (body.action === 'send_test') {
      const testEmail = body.email
      if (!testEmail) throw new Error('No email provided for test')

      const dummyUrl = 'https://www.payding.xyz/?confirmed=true'
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Payding <welcome@contact.payding.xyz>',
          to: [testEmail],
          subject: 'Verify your email — Payding ✉️',
          html: buildVerificationHtml(dummyUrl),
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

    // Normal mode: create user and send branded verification email
    const { email, password } = body
    if (!email || !password) throw new Error('Email and password are required')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Generate signup link (this also creates the user if they don't exist)
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email,
      password,
      options: {
        redirectTo: 'https://www.payding.xyz',
      },
    })

    if (linkError) {
      // Check for already registered
      if (linkError.message?.includes('already been registered') || linkError.message?.includes('already registered')) {
        return new Response(
          JSON.stringify({ error: 'This email is already registered. Please sign in instead.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      throw linkError
    }

    let confirmUrl = linkData.properties?.action_link
    if (!confirmUrl) throw new Error('Failed to generate confirmation link')

    // Ensure the redirect points to the custom domain
    const targetRedirect = 'https://www.payding.xyz'
    try {
      const url = new URL(confirmUrl)
      url.searchParams.set('redirect_to', targetRedirect)
      confirmUrl = url.toString()
    } catch {
      // If URL parsing fails, use the original link
    }

    // Send branded verification email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Payding <welcome@contact.payding.xyz>',
        to: [email],
        subject: 'Verify your email — Payding ✉️',
        html: buildVerificationHtml(confirmUrl),
      }),
    })

    if (!resendResponse.ok) {
      const errText = await resendResponse.text()
      console.error(`Resend error: ${errText}`)
      throw new Error(`Failed to send verification email`)
    }

    const resendData = await resendResponse.json()
    console.log('Verification email sent:', resendData)

    return new Response(
      JSON.stringify({ success: true, id: resendData.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
