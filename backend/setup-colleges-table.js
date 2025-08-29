const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupCollegesTable() {
    let connection;
    
    try {
        // Create connection
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'hrms'
        });

        console.log('✅ Connected to database successfully!');

        // Create colleges table if it doesn't exist
        const createCollegesTable = `
            CREATE TABLE IF NOT EXISTS colleges (
                college_id INT PRIMARY KEY AUTO_INCREMENT,
                college_name VARCHAR(255) NOT NULL UNIQUE,
                college_code VARCHAR(50) UNIQUE,
                location VARCHAR(255),
                college_type ENUM('technical', 'vocational', 'university', 'institute') DEFAULT 'technical',
                contact_phone VARCHAR(20),
                contact_email VARCHAR(255),
                address TEXT,
                established_date DATE,
                status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_college_name (college_name),
                INDEX idx_college_code (college_code),
                INDEX idx_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        await connection.execute(createCollegesTable);
        console.log('✅ Colleges table created/verified successfully!');

        // Check if colleges table has data
        const [existingColleges] = await connection.execute('SELECT COUNT(*) as count FROM colleges');
        
        if (existingColleges[0].count === 0) {
            console.log('📝 Adding sample colleges data...');
            
            // Insert sample colleges
            const sampleColleges = [
                {
                    college_name: 'Addis Ababa Technical and Vocational Education Training College',
                    college_code: 'AATVTC',
                    location: 'Addis Ababa',
                    college_type: 'technical',
                    contact_phone: '+251-11-123-4567',
                    contact_email: 'info@aatvtc.edu.et',
                    address: 'Bole Sub City, Addis Ababa, Ethiopia',
                    established_date: '2010-09-15'
                },
                {
                    college_name: 'Bahir Dar Technical College',
                    college_code: 'BDTC',
                    location: 'Bahir Dar',
                    college_type: 'technical',
                    contact_phone: '+251-58-220-1234',
                    contact_email: 'admin@bdtc.edu.et',
                    address: 'Bahir Dar, Amhara Region, Ethiopia',
                    established_date: '2008-01-20'
                },
                {
                    college_name: 'Hawassa Industrial College',
                    college_code: 'HIC',
                    location: 'Hawassa',
                    college_type: 'technical',
                    contact_phone: '+251-46-220-5678',
                    contact_email: 'contact@hic.edu.et',
                    address: 'Hawassa, SNNPR, Ethiopia',
                    established_date: '2012-03-10'
                },
                {
                    college_name: 'Mekelle Technical and Vocational College',
                    college_code: 'MTVC',
                    location: 'Mekelle',
                    college_type: 'vocational',
                    contact_phone: '+251-34-440-9876',
                    contact_email: 'info@mtvc.edu.et',
                    address: 'Mekelle, Tigray Region, Ethiopia',
                    established_date: '2009-11-05'
                },
                {
                    college_name: 'Jimma Polytechnic Institute',
                    college_code: 'JPI',
                    location: 'Jimma',
                    college_type: 'institute',
                    contact_phone: '+251-47-111-2345',
                    contact_email: 'admin@jpi.edu.et',
                    address: 'Jimma, Oromia Region, Ethiopia',
                    established_date: '2011-07-18'
                }
            ];

            for (const college of sampleColleges) {
                await connection.execute(
                    `INSERT INTO colleges 
                        (college_name, college_code, location, college_type, contact_phone, contact_email, address, established_date)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        college.college_name,
                        college.college_code,
                        college.location,
                        college.college_type,
                        college.contact_phone,
                        college.contact_email,
                        college.address,
                        college.established_date
                    ]
                );
            }

            console.log(`✅ Added ${sampleColleges.length} sample colleges successfully!`);
        } else {
            console.log(`ℹ️  Colleges table already has ${existingColleges[0].count} records.`);
        }

        // Verify the setup
        const [colleges] = await connection.execute('SELECT college_id, college_name, college_code, location, status FROM colleges ORDER BY college_name');
        
        console.log('\n📋 Current Colleges in Database:');
        console.log('=====================================');
        colleges.forEach((college, index) => {
            console.log(`${index + 1}. ${college.college_name} (${college.college_code})`);
            console.log(`   Location: ${college.location || 'N/A'}`);
            console.log(`   Status: ${college.status}`);
            console.log(`   ID: ${college.college_id}`);
            console.log('');
        });

        console.log('🎉 Colleges table setup completed successfully!');
        console.log('💡 You can now use these colleges in the Technology Transfer module.');

    } catch (error) {
        console.error('❌ Error setting up colleges table:', error.message);
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('\n🔧 Database Connection Help:');
            console.log('1. Make sure MySQL/MariaDB is running');
            console.log('2. Check your .env file database credentials');
            console.log('3. Ensure the database "hrms" exists');
            console.log('4. Verify user permissions');
        }
        
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed.');
        }
    }
}

// Run the setup
setupCollegesTable();