-- Add is_present column if it doesn't exist
ALTER TABLE public.attendance
ADD COLUMN IF NOT EXISTS is_present BOOLEAN DEFAULT true;

-- Enable RLS
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Create a single policy for all operations
CREATE POLICY "Enable all operations for authenticated users"
ON public.attendance
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
