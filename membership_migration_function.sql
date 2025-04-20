-- Create a stored procedure to handle membership plan migration
CREATE OR REPLACE FUNCTION migrate_membership_plan(
  p_customer_id UUID,
  p_from_plan TEXT,
  p_to_plan TEXT,
  p_points_to_carry INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_now TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
  -- Validate upgrade path
  IF p_to_plan = 'Silver Plus' AND p_from_plan != 'Silver' THEN
    RAISE EXCEPTION 'Cannot upgrade to Silver Plus from % plan', p_from_plan;
  END IF;
  
  IF p_to_plan = 'Gold' AND p_from_plan NOT IN ('Silver', 'Silver Plus') THEN
    RAISE EXCEPTION 'Cannot upgrade to Gold from % plan', p_from_plan;
  END IF;
  
  -- Don't allow downgrading
  IF (p_to_plan = 'Silver' AND p_from_plan IN ('Silver Plus', 'Gold')) OR 
     (p_to_plan = 'Silver Plus' AND p_from_plan = 'Gold') THEN
    RAISE EXCEPTION 'Cannot downgrade from % to % plan', p_from_plan, p_to_plan;
  END IF;
  
  -- Begin transaction
  BEGIN
    -- Deactivate current membership
    UPDATE public.memberships
    SET active = FALSE, updated_at = v_now
    WHERE customer_id = p_customer_id AND active = TRUE;
    
    -- Create new membership with carried points
    INSERT INTO public.memberships (
      customer_id,
      membership_type,
      points_balance,
      start_date,
      active,
      created_at,
      updated_at
    ) VALUES (
      p_customer_id,
      p_to_plan,
      p_points_to_carry, -- Carry forward points
      v_now,
      TRUE,
      v_now,
      v_now
    );
    
    -- Update customer record
    UPDATE public.customers
    SET membership_type = p_to_plan, updated_at = v_now
    WHERE id = p_customer_id;
    
    -- Log the migration in history table
    INSERT INTO public.membership_upgrades (
      customer_id,
      from_plan,
      to_plan,
      points_carried,
      upgrade_date,
      created_at
    ) VALUES (
      p_customer_id,
      p_from_plan,
      p_to_plan,
      p_points_to_carry,
      v_now,
      v_now
    );
    
    RETURN TRUE;
  EXCEPTION WHEN OTHERS THEN
    RAISE;
  END;
END;
$$ LANGUAGE plpgsql; 