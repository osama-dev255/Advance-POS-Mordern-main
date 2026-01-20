-- Add payment fields to saved_invoices table
ALTER TABLE saved_invoices 
ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS credit_brought_forward DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS amount_due DECIMAL(10,2) DEFAULT 0.00;