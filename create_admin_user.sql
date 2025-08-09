-- Create admin user
-- Password: admin123 (BCrypt encoded)
INSERT INTO user (email, password, full_name, contact, is_verified, role, kyc_status) 
VALUES (
    'admin@solarcapital.com', 
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 
    'Admin User', 
    '1234567890', 
    true, 
    'ADMIN', 
    'APPROVED'
);

-- Create a regular user for testing
INSERT INTO user (email, password, full_name, contact, is_verified, role, kyc_status) 
VALUES (
    'user@solarcapital.com', 
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 
    'Test User', 
    '9876543210', 
    true, 
    'USER', 
    'PENDING'
); 