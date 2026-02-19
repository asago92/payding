import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const url = new URL(req.url)
  const paymentId = url.searchParams.get('id')

  if (!paymentId) {
    return new Response('<html><body><h1>Invalid link</h1><p>This unsubscribe link is not valid.</p></body></html>', {
      status: 400,
      headers: { 'Content-Type': 'text/html' },
    })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { error } = await supabase
      .from('payments')
      .update({ is_active: false })
      .eq('id', paymentId)

    if (error) {
      console.error('Unsubscribe error:', error)
      return new Response(`<html><body style="font-family:sans-serif;text-align:center;padding:60px 20px;">
        <h1 style="color:#dc2626;">Something went wrong</h1>
        <p>We couldn't process your unsubscribe request. Please try again later.</p>
      </body></html>`, {
        status: 500,
        headers: { 'Content-Type': 'text/html' },
      })
    }

    return new Response(`<html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-align:center;padding:60px 20px;background:#f4f4f7;">
      <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:40px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <div style="width:48px;height:48px;background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:12px;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
          <span style="color:#fff;font-size:22px;font-weight:700;line-height:48px;">P</span>
        </div>
        <h1 style="color:#111827;font-size:22px;margin:0 0 8px;">Unsubscribed</h1>
        <p style="color:#6b7280;font-size:15px;line-height:1.6;">You've been unsubscribed from exchange rate alerts for this payment. You can re-enable tracking anytime from your dashboard.</p>
      </div>
    </body></html>`, {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    })
  } catch (err) {
    console.error('Unsubscribe error:', err)
    return new Response('<html><body><h1>Error</h1></body></html>', {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    })
  }
})
