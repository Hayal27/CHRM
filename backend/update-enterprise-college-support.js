const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateEnterpriseCollegeSupport() {
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

        // Add college_id column to enterprise_data table
        console.log('📝 Adding college_id column to enterprise_data table...');
        
        try {
            await connection.execute(`
                ALTER TABLE enterprise_data 
                ADD COLUMN college_id INT NULL AFTER phone_no,
                ADD FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE SET NULL
            `);
            console.log('✅ Added college_id column and foreign key constraint successfully!');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️  college_id column already exists in enterprise_data table.');
            } else {
                throw error;
            }
        }

        // Add index for better performance
        try {
            await connection.execute(`
                CREATE INDEX idx_enterprise_data_college_id ON enterprise_data(college_id)
            `);
            console.log('✅ Added index for college_id column successfully!');
        } catch (error) {
            if (error.code === 'ER_DUP_KEYNAME') {
                console.log('ℹ️  Index for college_id already exists.');
            } else {
                throw error;
            }
        }

        // Check current enterprise_data table structure
        const [columns] = await connection.execute(`
            DESCRIBE enterprise_data
        `);
        
        console.log('\n📋 Current enterprise_data table structure:');
        console.log('=====================================');
        columns.forEach(column => {
            console.log(`${column.Field}: ${column.Type} ${column.Null === 'YES' ? '(NULL)' : '(NOT NULL)'} ${column.Key ? `[${column.Key}]` : ''}`);
        });

        // Check if there are any existing enterprises
        const [existingEnterprises] = await connection.execute('SELECT COUNT(*) as count FROM enterprise_data');
        
        if (existingEnterprises[0].count === 0) {
            console.log('\n📝 Adding sample enterprise data with college associations...');
            
            // Get some colleges to associate with enterprises
            const [colleges] = await connection.execute('SELECT college_id, college_name FROM colleges LIMIT 5');
            
            if (colleges.length > 0) {
                const sampleEnterprises = [
                    {
                        enterprise_name: 'Tech Solutions Ethiopia',
                        year_of_establishment: 2020,
                        zone: 'Addis Ababa',
                        woreda_city: 'Bole',
                        sub_city: 'Bole Sub City',
                        kebele: '03',
                        sector: 'Technology',
                        sub_sector: 'Software Development',
                        trade_licence_id: 'TL001234',
                        maturity_level: 'Growth',
                        live_operators_male: 15,
                        live_operators_female: 10,
                        live_operators_total: 25,
                        assessed_competent_operators_male: 12,
                        assessed_competent_operators_female: 8,
                        assessed_competent_operators_total: 20,
                        phone_no: '+251-11-123-4567',
                        college_id: colleges[0].college_id
                    },
                    {
                        enterprise_name: 'Manufacturing Plus',
                        year_of_establishment: 2018,
                        zone: 'Oromia',
                        woreda_city: 'Jimma',
                        sub_city: 'Jimma Town',
                        kebele: '05',
                        sector: 'Manufacturing',
                        sub_sector: 'Textile Production',
                        trade_licence_id: 'TL005678',
                        maturity_level: 'Mature',
                        live_operators_male: 30,
                        live_operators_female: 20,
                        live_operators_total: 50,
                        assessed_competent_operators_male: 25,
                        assessed_competent_operators_female: 18,
                        assessed_competent_operators_total: 43,
                        phone_no: '+251-47-111-2345',
                        college_id: colleges[1] ? colleges[1].college_id : colleges[0].college_id
                    },
                    {
                        enterprise_name: 'Healthcare Innovations',
                        year_of_establishment: 2019,
                        zone: 'Amhara',
                        woreda_city: 'Bahir Dar',
                        sub_city: 'Bahir Dar City',
                        kebele: '02',
                        sector: 'Healthcare',
                        sub_sector: 'Medical Equipment',
                        trade_licence_id: 'TL009876',
                        maturity_level: 'Growth',
                        live_operators_male: 8,
                        live_operators_female: 12,
                        live_operators_total: 20,
                        assessed_competent_operators_male: 6,
                        assessed_competent_operators_female: 10,
                        assessed_competent_operators_total: 16,
                        phone_no: '+251-58-220-1234',
                        college_id: colleges[2] ? colleges[2].college_id : colleges[0].college_id
                    },
                    {
                        enterprise_name: 'Agri-Business Solutions',
                        year_of_establishment: 2021,
                        zone: 'SNNPR',
                        woreda_city: 'Hawassa',
                        sub_city: 'Hawassa City',
                        kebele: '01',
                        sector: 'Agriculture',
                        sub_sector: 'Food Processing',
                        trade_licence_id: 'TL011234',
                        maturity_level: 'Startup',
                        live_operators_male: 5,
                        live_operators_female: 7,
                        live_operators_total: 12,
                        assessed_competent_operators_male: 4,
                        assessed_competent_operators_female: 6,
                        assessed_competent_operators_total: 10,
                        phone_no: '+251-46-220-5678',
                        college_id: colleges[3] ? colleges[3].college_id : colleges[0].college_id
                    },
                    {
                        enterprise_name: 'Education Services Ltd',
                        year_of_establishment: 2017,
                        zone: 'Tigray',
                        woreda_city: 'Mekelle',
                        sub_city: 'Mekelle City',
                        kebele: '04',
                        sector: 'Education',
                        sub_sector: 'Training Services',
                        trade_licence_id: 'TL013456',
                        maturity_level: 'Mature',
                        live_operators_male: 18,
                        live_operators_female: 22,
                        live_operators_total: 40,
                        assessed_competent_operators_male: 15,
                        assessed_competent_operators_female: 20,
                        assessed_competent_operators_total: 35,
                        phone_no: '+251-34-440-9876',
                        college_id: colleges[4] ? colleges[4].college_id : colleges[0].college_id
                    }
                ];

                for (const enterprise of sampleEnterprises) {
                    await connection.execute(
                        `INSERT INTO enterprise_data 
                            (enterprise_name, year_of_establishment, zone, woreda_city, sub_city, kebele,
                             sector, sub_sector, trade_licence_id, maturity_level, live_operators_male,
                             live_operators_female, live_operators_total, assessed_competent_operators_male,
                             assessed_competent_operators_female, assessed_competent_operators_total, phone_no, college_id)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            enterprise.enterprise_name, enterprise.year_of_establishment, enterprise.zone,
                            enterprise.woreda_city, enterprise.sub_city, enterprise.kebele, enterprise.sector,
                            enterprise.sub_sector, enterprise.trade_licence_id, enterprise.maturity_level,
                            enterprise.live_operators_male, enterprise.live_operators_female, enterprise.live_operators_total,
                            enterprise.assessed_competent_operators_male, enterprise.assessed_competent_operators_female,
                            enterprise.assessed_competent_operators_total, enterprise.phone_no, enterprise.college_id
                        ]
                    );
                }

                console.log(`✅ Added ${sampleEnterprises.length} sample enterprises with college associations!`);
            } else {
                console.log('⚠️  No colleges found. Please run setup-colleges-table.js first.');
            }
        } else {
            console.log(`ℹ️  Enterprise data table already has ${existingEnterprises[0].count} records.`);
        }

        // Verify the setup
        const [enterprises] = await connection.execute(`
            SELECT e.id, e.enterprise_name, e.sector, e.zone, c.college_name, c.college_code
            FROM enterprise_data e
            LEFT JOIN colleges c ON e.college_id = c.college_id
            ORDER BY e.enterprise_name
        `);
        
        console.log('\n📋 Current Enterprises with College Associations:');
        console.log('================================================');
        enterprises.forEach((enterprise, index) => {
            console.log(`${index + 1}. ${enterprise.enterprise_name}`);
            console.log(`   Sector: ${enterprise.sector}`);
            console.log(`   Zone: ${enterprise.zone}`);
            console.log(`   College: ${enterprise.college_name || 'Not Associated'} ${enterprise.college_code ? `(${enterprise.college_code})` : ''}`);
            console.log(`   ID: ${enterprise.id}`);
            console.log('');
        });

        console.log('🎉 Enterprise Data college support setup completed successfully!');
        console.log('💡 Enterprise data is now integrated with the colleges table.');

    } catch (error) {
        console.error('❌ Error setting up enterprise college support:', error.message);
        
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
updateEnterpriseCollegeSupport();