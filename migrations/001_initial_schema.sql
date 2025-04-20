-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE membership_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration_days INTEGER NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  discount_percentage INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  name TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES membership_plans(id),
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  remaining_points INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

CREATE TABLE user_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'credit' or 'debit'
  amount DECIMAL(10, 2) NOT NULL,
  points INTEGER,
  description TEXT,
  reference_id UUID, -- Can reference an appointment, membership, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE customer_beneficiaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  category TEXT,
  points_required INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT,
  bio TEXT,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE staff_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(staff_id, service_id)
);

CREATE TABLE staff_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  points_used INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE appointment_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(appointment_id, service_id)
);

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  final_amount DECIMAL(10, 2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'cancelled'
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(invoice_number)
);

-- Create stored procedures

-- Procedure for deleting records with password verification
CREATE OR REPLACE FUNCTION delete_with_password(
  p_table TEXT,
  p_id UUID,
  p_password TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_admin_password TEXT := 'admin123'; -- This would be securely stored in a real app
BEGIN
  -- Check if password matches
  IF p_password = v_admin_password THEN
    -- Delete based on table name
    IF p_table = 'customers' THEN
      DELETE FROM customers WHERE id = p_id;
      RETURN TRUE;
    ELSIF p_table = 'staff' THEN
      DELETE FROM staff WHERE id = p_id;
      RETURN TRUE;
    ELSIF p_table = 'services' THEN
      DELETE FROM services WHERE id = p_id;
      RETURN TRUE;
    ELSE
      RAISE EXCEPTION 'Invalid table specified';
    END IF;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Procedure for upgrading membership
CREATE OR REPLACE FUNCTION upgrade_membership(
  p_user_id UUID,
  p_new_plan_id UUID,
  p_old_plan_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_old_membership RECORD;
  v_new_plan RECORD;
  v_remaining_points INTEGER := 0;
  v_end_date TIMESTAMPTZ;
BEGIN
  -- Get the new plan details
  SELECT * INTO v_new_plan FROM membership_plans WHERE id = p_new_plan_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Membership plan not found';
  END IF;
  
  -- If upgrading from existing plan, calculate remaining points
  IF p_old_plan_id IS NOT NULL THEN
    SELECT * INTO v_old_membership 
    FROM user_memberships 
    WHERE user_id = p_user_id AND active = TRUE;
    
    IF FOUND THEN
      -- Transfer remaining points
      v_remaining_points := v_old_membership.remaining_points;
      
      -- Deactivate the old membership
      UPDATE user_memberships 
      SET active = FALSE, 
          updated_at = NOW() 
      WHERE id = v_old_membership.id;
    END IF;
  END IF;
  
  -- Calculate end date
  v_end_date := NOW() + (v_new_plan.duration_days || ' days')::INTERVAL;
  
  -- Create new membership
  INSERT INTO user_memberships (
    user_id,
    plan_id,
    start_date,
    end_date,
    remaining_points,
    active
  ) VALUES (
    p_user_id,
    p_new_plan_id,
    NOW(),
    v_end_date,
    v_remaining_points + v_new_plan.points,
    TRUE
  );
  
  -- Add the fixed credit amount to user credits
  INSERT INTO user_credits (user_id, points, balance)
  VALUES (p_user_id, 0, 400)
  ON CONFLICT (user_id) 
  DO UPDATE SET balance = user_credits.balance + 400;
  
  -- Record the transaction
  INSERT INTO credit_transactions (
    user_id,
    type,
    amount,
    points,
    description
  ) VALUES (
    p_user_id,
    'credit',
    400,
    v_new_plan.points,
    'Membership upgrade to ' || v_new_plan.name
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get staff performance
CREATE OR REPLACE FUNCTION get_staff_performance(
  p_start_date DATE,
  p_end_date DATE
) RETURNS TABLE (
  staff_id UUID,
  staff_name TEXT,
  total_appointments INTEGER,
  total_hours DECIMAL,
  total_revenue DECIMAL,
  customers_served INTEGER,
  idle_hours DECIMAL,
  performance_percentage DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH staff_hours AS (
    SELECT 
      s.id AS staff_id,
      s.name AS staff_name,
      COUNT(DISTINCT a.id) AS total_appointments,
      SUM(EXTRACT(EPOCH FROM (a.end_time - a.start_time))/3600) AS total_hours,
      SUM(a.total_price) AS total_revenue,
      COUNT(DISTINCT a.customer_id) AS customers_served,
      -- Assuming 8-hour workdays for available staff
      (COUNT(DISTINCT sa.date) * 8) - SUM(EXTRACT(EPOCH FROM (a.end_time - a.start_time))/3600) AS idle_hours
    FROM 
      staff s
    LEFT JOIN 
      appointments a ON s.id = a.staff_id 
      AND a.date BETWEEN p_start_date AND p_end_date
      AND a.status = 'completed'
    LEFT JOIN 
      staff_availability sa ON s.id = sa.staff_id 
      AND sa.date BETWEEN p_start_date AND p_end_date
      AND sa.is_available = TRUE
    GROUP BY 
      s.id, s.name
  )
  SELECT 
    sh.staff_id,
    sh.staff_name,
    sh.total_appointments,
    sh.total_hours,
    sh.total_revenue,
    sh.customers_served,
    CASE WHEN sh.idle_hours < 0 THEN 0 ELSE sh.idle_hours END AS idle_hours,
    CASE 
      WHEN (sh.total_hours + sh.idle_hours) = 0 THEN 0
      ELSE (sh.total_hours / (sh.total_hours + sh.idle_hours)) * 100 
    END AS performance_percentage
  FROM 
    staff_hours sh;
END;
$$ LANGUAGE plpgsql;

-- Function to get sales report
CREATE OR REPLACE FUNCTION get_sales_report(
  p_start_date DATE,
  p_end_date DATE
) RETURNS TABLE (
  date DATE,
  total_appointments INTEGER,
  total_revenue DECIMAL,
  membership_revenue DECIMAL,
  service_revenue DECIMAL,
  points_used INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.date,
    COUNT(a.id) AS total_appointments,
    SUM(a.total_price) AS total_revenue,
    SUM(CASE WHEN a.points_used > 0 THEN a.total_price ELSE 0 END) AS membership_revenue,
    SUM(CASE WHEN a.points_used = 0 THEN a.total_price ELSE 0 END) AS service_revenue,
    SUM(a.points_used) AS points_used
  FROM 
    appointments a
  WHERE 
    a.date BETWEEN p_start_date AND p_end_date
    AND a.status = 'completed'
  GROUP BY 
    a.date
  ORDER BY 
    a.date;
END;
$$ LANGUAGE plpgsql;

-- Insert initial data

-- Create default membership plans
INSERT INTO membership_plans (name, description, price, duration_days, points, discount_percentage)
VALUES 
  ('Silver', 'Basic membership with essential benefits', 10000, 365, 1000, 20),
  ('Silver Plus', 'Enhanced membership with more benefits', 18000, 365, 2000, 25),
  ('Gold', 'Premium membership with maximum benefits', 25000, 365, 3000, 30),
  ('Platinum', 'Exclusive membership with VIP benefits', 30000, 365, 4000, 35),
  ('Diamond', 'Elite membership with ultimate benefits', 50000, 365, 6000, 50);

-- Create admin user
INSERT INTO users (email, name, password_hash, role)
VALUES ('admin@salon.com', 'Admin User', '$2a$10$hACwQ5/HQI6FhbIISOUVeusy3sKyUDhSq36fF5d/54aAdiygJPFzm', 'admin'); 