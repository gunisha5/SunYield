-- Fix RewardHistory table to add date column and update existing records
-- Run this script in your MySQL database

-- Add the date column if it doesn't exist
ALTER TABLE reward_history ADD COLUMN IF NOT EXISTS date DATE;

-- Update existing records to use a reasonable date based on month/year
-- For records with month/year, set date to first day of that month
UPDATE reward_history 
SET date = STR_TO_DATE(CONCAT(year, '-', LPAD(month, 2, '0'), '-01'), '%Y-%m-%d')
WHERE date IS NULL AND month IS NOT NULL AND year IS NOT NULL;

-- For records without month/year, set date to created_at date
UPDATE reward_history 
SET date = DATE(created_at)
WHERE date IS NULL AND created_at IS NOT NULL;

-- For any remaining records, set date to current date
UPDATE reward_history 
SET date = CURDATE()
WHERE date IS NULL;

-- Make sure the date column is not null
ALTER TABLE reward_history MODIFY COLUMN date DATE NOT NULL;

-- Add an index on the date column for better performance
CREATE INDEX IF NOT EXISTS idx_reward_history_date ON reward_history(date);

-- Show the updated table structure
DESCRIBE reward_history;

-- Show sample of updated records
SELECT id, user_id, project_id, month, year, date, created_at, kwh, reward_amount, status 
FROM reward_history 
ORDER BY created_at DESC 
LIMIT 10;
