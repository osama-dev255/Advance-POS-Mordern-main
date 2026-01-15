-- Migration to update the customer settlements table to match frontend requirements
-- This script should be run in the Supabase SQL editor

-- Check if the customer_settlements table exists and add missing columns if needed
DO $$
BEGIN
  -- Check if table exists
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'customer_settlements') THEN
    -- Create the table if it doesn't exist
    CREATE TABLE customer_settlements (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      customer_name VARCHAR(255) NOT NULL,
      customer_phone VARCHAR(20),
      customer_email VARCHAR(255),
      reference_number VARCHAR(100),
      settlement_amount DECIMAL(10,2) NOT NULL,
      payment_method VARCHAR(50) NOT NULL,
      cashier_name VARCHAR(255),
      previous_balance DECIMAL(10,2) DEFAULT 0.00,
      amount_paid DECIMAL(10,2) DEFAULT 0.00,
      new_balance DECIMAL(10,2) DEFAULT 0.00,
      notes TEXT,
      date DATE NOT NULL,
      time TIME WITH TIME ZONE DEFAULT NOW(),
      status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'cancelled')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  ELSE
    -- Add missing columns to existing table if they don't exist
    ALTER TABLE customer_settlements ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255) NOT NULL DEFAULT '';
    ALTER TABLE customer_settlements ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20);
    ALTER TABLE customer_settlements ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);
    ALTER TABLE customer_settlements ADD COLUMN IF NOT EXISTS reference_number VARCHAR(100);
    ALTER TABLE customer_settlements ADD COLUMN IF NOT EXISTS settlement_amount DECIMAL(10,2) DEFAULT 0.00;
    ALTER TABLE customer_settlements ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
    ALTER TABLE customer_settlements ADD COLUMN IF NOT EXISTS cashier_name VARCHAR(255);
    ALTER TABLE customer_settlements ADD COLUMN IF NOT EXISTS previous_balance DECIMAL(10,2) DEFAULT 0.00;
    ALTER TABLE customer_settlements ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2) DEFAULT 0.00;
    ALTER TABLE customer_settlements ADD COLUMN IF NOT EXISTS new_balance DECIMAL(10,2) DEFAULT 0.00;
    ALTER TABLE customer_settlements ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE;
    ALTER TABLE customer_settlements ADD COLUMN IF NOT EXISTS time TIME WITH TIME ZONE DEFAULT NOW();
    ALTER TABLE customer_settlements ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'completed';
    
    -- Update the NOT NULL constraints for required fields
    ALTER TABLE customer_settlements ALTER COLUMN customer_name DROP DEFAULT;
    ALTER TABLE customer_settlements ALTER COLUMN date DROP DEFAULT;
    
    -- Update check constraint for status
    ALTER TABLE customer_settlements DROP CONSTRAINT IF EXISTS customer_settlements_status_check;
    ALTER TABLE customer_settlements ADD CONSTRAINT customer_settlements_status_check CHECK (status IN ('completed', 'pending', 'cancelled'));
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_settlements_customer_id ON customer_settlements(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_settlements_user_id ON customer_settlements(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_settlements_date ON customer_settlements(date);
CREATE INDEX IF NOT EXISTS idx_customer_settlements_reference ON customer_settlements(reference_number);
CREATE INDEX IF NOT EXISTS idx_customer_settlements_status ON customer_settlements(status);

-- Enable Row Level Security (RLS) for the customer_settlements table
ALTER TABLE customer_settlements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for customer settlements
CREATE POLICY "Users can view their own customer settlements" ON customer_settlements
FOR SELECT TO authenticated
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own customer settlements" ON customer_settlements
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own customer settlements" ON customer_settlements
FOR UPDATE TO authenticated
USING (auth.uid() = user_id OR (user_id IS NULL AND auth.role() = 'authenticated'));

CREATE POLICY "Users can delete their own customer settlements" ON customer_settlements
FOR DELETE TO authenticated
USING (auth.uid() = user_id OR (user_id IS NULL AND auth.role() = 'authenticated'));

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';