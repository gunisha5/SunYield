-- Initialize system configuration table
USE solarcapital;

-- Create system_config table if it doesn't exist
CREATE TABLE IF NOT EXISTS system_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(255) UNIQUE NOT NULL,
    config_value VARCHAR(255) NOT NULL,
    description TEXT
);

-- Insert default monthly withdrawal cap
INSERT INTO system_config (config_key, config_value, description) 
VALUES ('MONTHLY_WITHDRAWAL_CAP', '3000', 'Monthly withdrawal limit for users in INR')
ON DUPLICATE KEY UPDATE config_value = VALUES(config_value);

-- Verify the configuration
SELECT 'System Configuration:' as info;
SELECT config_key, config_value, description FROM system_config; 