import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Decode the JWT to get user info
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      throw new Error('Unable to get user')
    }

    const { email } = await req.json()
    const userEmail = email || user.email

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
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); width: 48px; height: 48px; border-radius: 12px; line-height: 48px; color: white; font-size: 24px; font-weight: bold;">$</div>
              <h1 style="margin: 16px 0 0; font-size: 24px; color: #1a1a2e;">Welcome to Payding!</h1>
            </div>
            
            <p style="color: #4a4a68; font-size: 16px; line-height: 1.6;">
              Hi there! 👋
            </p>
            
            <p style="color: #4a4a68; font-size: 16px; line-height: 1.6;">
              Thanks for signing up for Payding. You're all set to start tracking your international payments and exchange rates.
            </p>
            
            <p style="color: #4a4a68; font-size: 16px; line-height: 1.6;">
              Here's what you can do:
            </p>
            
            <ul style="color: #4a4a68; font-size: 16px; line-height: 2;">
              <li>📊 Log your international payments</li>
              <li>💱 Track exchange rate movements</li>
              <li>🔔 Get alerts when rates improve</li>
            </ul>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://payding.lovable.app" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Get Started →
              </a>
            </div>
            
            <p style="color: #8888a0; font-size: 14px; text-align: center; margin-top: 40px; border-top: 1px solid #e5e5f0; padding-top: 20px;">
              © ${new Date().getFullYear()} Payding. All rights reserved.
            </p>
          </div>
        `,
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
