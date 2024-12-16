-- Add is_present column to attendance table
ALTER TABLE public.attendance
ADD COLUMN IF NOT EXISTS is_present BOOLEAN DEFAULT true;
