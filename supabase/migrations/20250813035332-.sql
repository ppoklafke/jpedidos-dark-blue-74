-- Fix security vulnerability: Update RLS policies for clients table to restrict access to authenticated users only

-- Drop existing policies that allow public access
DROP POLICY "Users can view all clients" ON public.clients;
DROP POLICY "Users can insert clients" ON public.clients;
DROP POLICY "Users can update clients" ON public.clients;
DROP POLICY "Users can delete clients" ON public.clients;

-- Create secure policies that require authentication
CREATE POLICY "Authenticated users can view clients" 
ON public.clients 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert clients" 
ON public.clients 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update clients" 
ON public.clients 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete clients" 
ON public.clients 
FOR DELETE 
TO authenticated
USING (true);