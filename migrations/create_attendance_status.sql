-- Create attendance_status table
CREATE TABLE IF NOT EXISTS public.attendance_status (
    id BIGSERIAL PRIMARY KEY,
    student_lrn TEXT NOT NULL REFERENCES public.students(lrn),
    subject TEXT NOT NULL,
    is_present BOOLEAN DEFAULT true,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(student_lrn, subject, date)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_attendance_status_date ON public.attendance_status(date);
CREATE INDEX IF NOT EXISTS idx_attendance_status_student_lrn ON public.attendance_status(student_lrn);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.attendance_status ENABLE ROW LEVEL SECURITY;

-- Create policy for read access
CREATE POLICY "Enable read access for authenticated users"
ON public.attendance_status
FOR SELECT
TO authenticated
USING (true);

-- Create policy for insert/update access
CREATE POLICY "Enable insert/update for authenticated users"
ON public.attendance_status
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_attendance_status_updated_at
    BEFORE UPDATE ON public.attendance_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
