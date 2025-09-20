-- Fix admin table by removing area column and adding zone_id
-- This script handles the migration from the old admin table structure to the new one

-- First, add the zone_id column if it doesn't exist
ALTER TABLE admin ADD COLUMN IF NOT EXISTS zone_id uuid;

-- Add foreign key constraint for zone_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'admin_zone_id_zone_id_fk'
    ) THEN
        ALTER TABLE admin ADD CONSTRAINT admin_zone_id_zone_id_fk 
        FOREIGN KEY (zone_id) REFERENCES zone(id) ON DELETE no action ON UPDATE no action;
    END IF;
END $$;

-- Remove the area column if it exists
ALTER TABLE admin DROP COLUMN IF EXISTS area;