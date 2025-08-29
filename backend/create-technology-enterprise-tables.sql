-- Create Technology Transfers table
CREATE TABLE IF NOT EXISTS technology_transfers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    technology_name VARCHAR(255) NOT NULL,
    sector VARCHAR(100) NOT NULL,
    identified_value_chain TEXT,
    technology_type ENUM('Manufacturing', 'Product/Service') NOT NULL,
    year_of_transfer INT NOT NULL,
    transferred_enterprise_name VARCHAR(255),
    transferred_enterprise_phone VARCHAR(20),
    enterprise_sector VARCHAR(100),
    wealth VARCHAR(100),
    college_id INT,
    technology_developer_name VARCHAR(255),
    technology_developer_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE SET NULL
);

-- Create Enterprise Data table
CREATE TABLE IF NOT EXISTS enterprise_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    enterprise_name VARCHAR(255) NOT NULL,
    year_of_establishment INT NOT NULL,
    zone VARCHAR(100) NOT NULL,
    woreda_city VARCHAR(100) NOT NULL,
    sub_city VARCHAR(100) NOT NULL,
    kebele VARCHAR(100) NOT NULL,
    sector VARCHAR(100) NOT NULL,
    sub_sector VARCHAR(100),
    trade_licence_id VARCHAR(100) NOT NULL,
    maturity_level ENUM('Startup', 'Growth', 'Mature', 'Decline') NOT NULL,
    live_operators_male INT DEFAULT 0,
    live_operators_female INT DEFAULT 0,
    live_operators_total INT DEFAULT 0,
    assessed_competent_operators_male INT DEFAULT 0,
    assessed_competent_operators_female INT DEFAULT 0,
    assessed_competent_operators_total INT DEFAULT 0,
    phone_no VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX idx_technology_transfers_college_id ON technology_transfers(college_id);
CREATE INDEX idx_technology_transfers_year ON technology_transfers(year_of_transfer);
CREATE INDEX idx_technology_transfers_type ON technology_transfers(technology_type);

CREATE INDEX idx_enterprise_data_year ON enterprise_data(year_of_establishment);
CREATE INDEX idx_enterprise_data_zone ON enterprise_data(zone);
CREATE INDEX idx_enterprise_data_sector ON enterprise_data(sector);