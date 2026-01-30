import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Frankfurter API - free, uses ECB mid-market rates
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

      const results = []

      for (const payment of payments || []) {
        try {
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

          // Calculate percentage change from payment date to now
          const percentChange = ((currentRate - rateAtReceipt) / rateAtReceipt) * 100

          console.log(`Payment ${payment.id}: rate at receipt=${rateAtReceipt}, current=${currentRate}, change=${percentChange.toFixed(2)}%`)

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
