-- Fix the permissive RLS policy for blocked_ips INSERT
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Service role can insert blocked IPs" ON public.blocked_ips;

-- The trigger function runs with SECURITY DEFINER, so it bypasses RLS for inserts
-- No need for an INSERT policy as the trigger handles insertions