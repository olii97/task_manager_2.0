-- Add reminder fields to calendar_entries table
ALTER TABLE calendar_entries 
ADD COLUMN has_reminder BOOLEAN DEFAULT false,
ADD COLUMN reminder_days_before INTEGER;

-- Update existing entries to have has_reminder set to false
UPDATE calendar_entries
SET has_reminder = false
WHERE has_reminder IS NULL;

-- Add a check constraint to ensure reminder_days_before is between 0 and 30
ALTER TABLE calendar_entries
ADD CONSTRAINT reminder_days_before_check 
CHECK (reminder_days_before IS NULL OR (reminder_days_before >= 0 AND reminder_days_before <= 30));

-- Add a check constraint to ensure reminder_days_before is set when has_reminder is true
ALTER TABLE calendar_entries
ADD CONSTRAINT reminder_days_before_required 
CHECK (NOT has_reminder OR reminder_days_before IS NOT NULL); 