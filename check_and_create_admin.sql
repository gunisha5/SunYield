-- Check if admin user exists
SELECT 'Checking admin user...' as status;
SELECT id, email, full_name, role, is_verified, kyc_status 
FROM user 
WHERE email = 'admin@solarcapital.com';

-- If no admin user exists, create one
INSERT INTO user (email, password, full_name, contact, is_verified, role, kyc_status) 
SELECT 
    'admin@solarcapital.com', 
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 
    'Admin User', 
    '1234567890', 
    true, 
    'ADMIN', 
    'APPROVED'
WHERE NOT EXISTS (
    SELECT 1 FROM user WHERE email = 'admin@solarcapital.com'
);

-- Verify admin user was created
SELECT 'Verifying admin user...' as status;
SELECT id, email, full_name, role, is_verified, kyc_status 
FROM user 
WHERE email = 'admin@solarcapital.com'; 