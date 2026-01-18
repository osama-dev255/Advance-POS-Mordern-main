-- Fix RLS policies for saved_invoices to allow admins to view all invoices
-- This enables admins to see invoices created by managers and cashiers

-- Drop existing policies
DROP POLICY IF EXISTS select_own_saved_invoices ON saved_invoices;
DROP POLICY IF EXISTS insert_own_saved_invoices ON saved_invoices;
DROP POLICY IF EXISTS update_own_saved_invoices ON saved_invoices;
DROP POLICY IF EXISTS delete_own_saved_invoices ON saved_invoices;

-- Create new policies that allow admins to see all invoices
-- Admins can SELECT all invoices, others can only see their own
CREATE POLICY select_saved_invoices ON saved_invoices
FOR SELECT TO authenticated
USING (
  -- Admins can see all invoices
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
  OR 
  -- Other users can only see their own invoices
  auth.uid() = user_id
);

-- Keep insert policy the same - users can only insert their own invoices
CREATE POLICY insert_saved_invoices ON saved_invoices
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Keep update policy the same - users can only update their own invoices
CREATE POLICY update_saved_invoices ON saved_invoices
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- Keep delete policy the same - users can only delete their own invoices
CREATE POLICY delete_saved_invoices ON saved_invoices
FOR DELETE TO authenticated
USING (auth.uid() = user_id);