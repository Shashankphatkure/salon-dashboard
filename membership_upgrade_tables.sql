-- 1. First check if memberships table exists, if not create it
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'memberships') THEN
    CREATE TABLE public.memberships (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
      membership_type TEXT NOT NULL,
      points_balance INTEGER DEFAULT 0,
      start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      end_date TIMESTAMP WITH TIME ZONE,
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Add RLS policies for memberships
    ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Allow public read access" ON public.memberships
      FOR SELECT USING (true);
      
    CREATE POLICY "Allow authenticated insert" ON public.memberships
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
      
    CREATE POLICY "Allow authenticated updates" ON public.memberships
      FOR UPDATE USING (auth.role() = 'authenticated');
  END IF;
END
$$;

-- 2. Create membership_upgrades table to track upgrade history
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'membership_upgrades') THEN
    CREATE TABLE public.membership_upgrades (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
      from_plan TEXT NOT NULL,
      to_plan TEXT NOT NULL,
      points_carried INTEGER NOT NULL DEFAULT 0,
      upgrade_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Add RLS policies for membership_upgrades
    ALTER TABLE public.membership_upgrades ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Allow public read access" ON public.membership_upgrades
      FOR SELECT USING (true);
      
    CREATE POLICY "Allow authenticated insert" ON public.membership_upgrades
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
END
$$;

-- 3. Add function to calculate remaining points after migration
CREATE OR REPLACE FUNCTION calculate_carried_points(
  p_customer_id UUID,
  p_from_plan TEXT,
  p_to_plan TEXT
) RETURNS INTEGER AS $$
DECLARE
  current_points INTEGER;
BEGIN
  -- Get current points balance
  SELECT points_balance INTO current_points
  FROM memberships
  WHERE customer_id = p_customer_id AND active = TRUE
  LIMIT 1;
  
  -- If no active membership or no points, return 0
  IF current_points IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Return current points to be carried over
  RETURN current_points;
END;
$$ LANGUAGE plpgsql; 