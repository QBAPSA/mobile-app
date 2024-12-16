-- Enable RLS on attendance table
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to select attendance records
CREATE POLICY "Enable read access for authenticated users"
ON public.attendance
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert attendance records
CREATE POLICY "Enable insert for authenticated users"
ON public.attendance
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update attendance records
CREATE POLICY "Enable update for authenticated users"
ON public.attendance
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete attendance records
CREATE POLICY "Enable delete for authenticated users"
ON public.attendance
FOR DELETE
TO authenticated
USING (true);
