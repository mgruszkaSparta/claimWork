-- Add role field to drivers table for configurable participant roles
-- This script adds a role field to store participant roles like kierowca, właściciel, etc.

ALTER TABLE drivers 
ADD COLUMN role VARCHAR(50) NULL;

-- Add index for better performance on role queries
CREATE INDEX idx_drivers_role ON drivers(role);

-- Update existing records to have default role
UPDATE drivers 
SET role = 'kierowca' 
WHERE role IS NULL;

-- Add comment to document the field
COMMENT ON COLUMN drivers.role IS 'Role of the participant: kierowca, właściciel, współwłaściciel, pasażer, pieszy';
