-- Create flights table
CREATE TABLE public.flights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  origin_city TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  cabin_class TEXT NOT NULL CHECK (cabin_class IN ('economy', 'business', 'first')),
  emissions_kg NUMERIC NOT NULL,
  distance_km NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX idx_flights_user_id ON public.flights(user_id);
CREATE INDEX idx_flights_created_at ON public.flights(created_at DESC);

-- Enable RLS
ALTER TABLE public.flights ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read their own flights
CREATE POLICY "users_can_select_own_flights" ON public.flights
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can only insert their own flights
CREATE POLICY "users_can_insert_own_flights" ON public.flights
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only delete their own flights
CREATE POLICY "users_can_delete_own_flights" ON public.flights
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create favorites table
CREATE TABLE public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  origin_city TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  cabin_class TEXT NOT NULL CHECK (cabin_class IN ('economy', 'business', 'first')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create index
CREATE INDEX favorites_user_id_idx ON public.favorites (user_id);

-- Enable RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read their own favorites
CREATE POLICY "users_can_select_own_favorites" ON public.favorites
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can only insert their own favorites
CREATE POLICY "users_can_insert_own_favorites" ON public.favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only delete their own favorites
CREATE POLICY "users_can_delete_own_favorites" ON public.favorites
  FOR DELETE
  USING (auth.uid() = user_id);
