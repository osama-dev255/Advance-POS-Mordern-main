-- RLS Policies for Saved Invoices and Delivery Notes
-- These policies ensure that users can only access their own saved invoices and delivery notes

-- Enable RLS on saved_invoices table
ALTER TABLE saved_invoices ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to select their own saved invoices
CREATE POLICY select_own_saved_invoices ON saved_invoices
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own saved invoices
CREATE POLICY insert_own_saved_invoices ON saved_invoices
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own saved invoices
CREATE POLICY update_own_saved_invoices ON saved_invoices
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own saved invoices
CREATE POLICY delete_own_saved_invoices ON saved_invoices
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Enable RLS on saved_delivery_notes table
ALTER TABLE saved_delivery_notes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to select their own saved delivery notes
CREATE POLICY select_own_saved_delivery_notes ON saved_delivery_notes
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own saved delivery notes
CREATE POLICY insert_own_saved_delivery_notes ON saved_delivery_notes
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own saved delivery notes
CREATE POLICY update_own_saved_delivery_notes ON saved_delivery_notes
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own saved delivery notes
CREATE POLICY delete_own_saved_delivery_notes ON saved_delivery_notes
FOR DELETE TO authenticated
USING (auth.uid() = user_id);