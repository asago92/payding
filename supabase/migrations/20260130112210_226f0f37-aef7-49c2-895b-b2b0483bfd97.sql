-- Add column to store the exchange rate at the time of payment receipt
ALTER TABLE public.payments 
ADD COLUMN exchange_rate_at_receipt numeric;

-- Add column to store the last checked rate for comparison
ALTER TABLE public.payments 
ADD COLUMN last_checked_rate numeric;

-- Add column to store when rates were last checked
ALTER TABLE public.payments 
ADD COLUMN last_rate_check timestamp with time zone;