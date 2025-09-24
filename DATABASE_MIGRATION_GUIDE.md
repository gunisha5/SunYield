# Database Migration Guide for Solar Capital System

## Overview
This guide will help you migrate your database to support the new Solar Capital model with Green Credits, flexible contributions, and withdrawal system.

## Migration Steps

### 1. Run the Database Migration
Execute the migration script to add new fields and tables:

```sql
-- The migration script is located at:
-- backend/src/main/resources/db/migration/V3__Add_Solar_Capital_Fields.sql
```

### 2. Update Existing Projects
After running the migration, update your existing projects with Solar Capital data:

```sql
-- Update projects with Solar Capital fields
UPDATE project SET 
    min_contribution = 999.00,
    efficiency = 'HIGH',
    project_type = 'SOLAR_PROJECT',
    description = 'High-efficiency solar energy project'
WHERE min_contribution IS NULL;

-- Set different efficiency levels for variety
UPDATE project SET efficiency = 'MEDIUM' WHERE id % 3 = 1;
UPDATE project SET efficiency = 'LOW' WHERE id % 3 = 2;
```

### 3. Update Existing Subscriptions
Update existing subscriptions to use the new contribution model:

```sql
-- Update subscriptions with contribution amounts
UPDATE subscription SET 
    contribution_amount = (SELECT subscription_price FROM project WHERE project.id = subscription.project_id),
    reserved_capacity = (SELECT subscription_price FROM project WHERE project.id = subscription.project_id) / 100,
    subscription_type = 'FIXED'
WHERE contribution_amount IS NULL;
```

### 4. Create Green Credits Wallets
Create wallets for existing users:

```sql
-- Create Green Credits wallets for all users
INSERT INTO green_credits_wallet (user_id, available_credits, total_earned, total_withdrawn, total_used, created_at, last_updated)
SELECT 
    id as user_id,
    0.00 as available_credits,
    0.00 as total_earned,
    0.00 as total_withdrawn,
    0.00 as total_used,
    NOW() as created_at,
    NOW() as last_updated
FROM user
WHERE id NOT IN (SELECT user_id FROM green_credits_wallet);
```

## Verification

### Check Migration Success
```sql
-- Verify new columns exist
DESCRIBE project;
DESCRIBE subscription;
DESCRIBE green_credits_wallet;
DESCRIBE withdrawal_requests;

-- Check data population
SELECT COUNT(*) FROM green_credits_wallet;
SELECT COUNT(*) FROM project WHERE min_contribution IS NOT NULL;
SELECT COUNT(*) FROM subscription WHERE contribution_amount IS NOT NULL;
```

### Test New Features
1. **Projects Page**: Should show "Min Contribution" instead of "Price"
2. **Calculator**: Should show Green Credits instead of ROI
3. **Wallet**: Should show Green Credits wallet
4. **Admin Dashboard**: Should have new project fields

## Rollback (if needed)
If you need to rollback the migration:

```sql
-- Remove new columns (be careful!)
ALTER TABLE project DROP COLUMN min_contribution;
ALTER TABLE project DROP COLUMN efficiency;
ALTER TABLE project DROP COLUMN project_type;
ALTER TABLE project DROP COLUMN description;

ALTER TABLE subscription DROP COLUMN contribution_amount;
ALTER TABLE subscription DROP COLUMN reserved_capacity;
ALTER TABLE subscription DROP COLUMN subscription_type;

-- Drop new tables
DROP TABLE withdrawal_requests;
DROP TABLE green_credits_wallet;
```

## Troubleshooting

### Common Issues
1. **Projects still show old prices**: Make sure migration ran and data was updated
2. **Missing project types**: Check if project_type field was populated
3. **Calculator not working**: Verify minContribution field exists
4. **Wallet errors**: Ensure green_credits_wallet table exists

### Support
If you encounter issues, check:
1. Database logs for migration errors
2. Application logs for API errors
3. Browser console for frontend errors

## Next Steps
After successful migration:
1. Test all new features
2. Update user documentation
3. Train administrators
4. Monitor system performance
