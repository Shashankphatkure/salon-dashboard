-- Create the transactions table to track customer credit usage
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  service_name TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  credit_used DECIMAL(10, 2) DEFAULT 0,
  invoice_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups by customer
CREATE INDEX IF NOT EXISTS transactions_customer_id_idx ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS transactions_date_idx ON transactions(date);

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 