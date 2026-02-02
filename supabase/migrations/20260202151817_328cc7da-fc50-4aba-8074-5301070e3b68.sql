-- Add timezone column to payments table for per-alert timezone preference
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- Add comment explaining the column
COMMENT ON COLUMN public.payments.timezone IS 'User timezone for 8 AM local notifications (IANA timezone format e.g. America/New_York)';