// Script to create education office database tables
const db = require('./models/db');

async function createEducationOfficeTables() {
    try {
        console.log('🔧 Creating education office database tables...');

        // Create colleges table
        console.log('📋 Creating colleges table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS colleges (
                college_id INT AUTO_INCREMENT PRIMARY KEY,
                college_name VARCHAR(255) NOT NULL UNIQUE,
                college_code VARCHAR(50) NOT NULL UNIQUE,
                location VARCHAR(255),
                college_type ENUM('technical', 'vocational', 'university', 'institute') DEFAULT 'technical',
                status ENUM('active', 'inactive') DEFAULT 'active',
                established_date DATE,
                contact_email VARCHAR(255),
                contact_phone VARCHAR(50),
                address TEXT,
                description TEXT,
                capacity INT DEFAULT 0,
                current_enrollment INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                INDEX idx_college_name (college_name),
                INDEX idx_college_code (college_code),
                INDEX idx_status (status)
            )
        `);
        console.log('✅ Colleges table created');

        // Create college_departments table
        console.log('📋 Creating college_departments table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS college_departments (
                department_id INT AUTO_INCREMENT PRIMARY KEY,
                college_id INT NOT NULL,
                department_name VARCHAR(255) NOT NULL,
                department_code VARCHAR(50),
                head_of_department INT,
                status ENUM('active', 'inactive') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE CASCADE,
                UNIQUE KEY unique_dept_per_college (college_id, department_name),
                INDEX idx_college_id (college_id),
                INDEX idx_department_name (department_name)
            )
        `);
        console.log('✅ College departments table created');

        // Add new columns to employees table
        console.log('📋 Enhancing employees table...');
        
        // Check if columns already exist before adding them
        const columns = [
            { name: 'employee_type', definition: "ENUM('admin', 'trainer', 'support', 'management') DEFAULT 'admin'" },
            { name: 'college_id', definition: 'INT' },
            { name: 'specialization', definition: 'VARCHAR(255)' },
            { name: 'qualification_level', definition: "ENUM('diploma', 'bachelor', 'master', 'phd', 'certificate') DEFAULT 'bachelor'" },
            { name: 'years_of_experience', definition: 'INT DEFAULT 0' },
            { name: 'certification_details', definition: 'TEXT' },
            { name: 'training_areas', definition: 'TEXT' },
            { name: 'citizen_address', definition: 'TEXT' },
            { name: 'emergency_contact_name', definition: 'VARCHAR(255)' },
            { name: 'emergency_contact_phone', definition: 'VARCHAR(50)' },
            { name: 'emergency_contact_relationship', definition: 'VARCHAR(100)' },
            { name: 'created_by', definition: 'INT' },
            { name: 'updated_by', definition: 'INT' }
        ];

        for (const column of columns) {
            try {
                await db.query(`ALTER TABLE employees ADD COLUMN ${column.name} ${column.definition}`);
                console.log(`✅ Added column: ${column.name}`);
            } catch (error) {
                if (error.code === 'ER_DUP_FIELDNAME') {
                    console.log(`⚠️  Column ${column.name} already exists`);
                } else {
                    console.error(`❌ Error adding column ${column.name}:`, error.message);
                }
            }
        }

        // Create employee_reports table
        console.log('📋 Creating employee_reports table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS employee_reports (
                report_id INT AUTO_INCREMENT PRIMARY KEY,
                report_name VARCHAR(255) NOT NULL,
                college_id INT,
                department_id INT,
                report_type ENUM('comprehensive', 'summary', 'detailed', 'statistical') DEFAULT 'comprehensive',
                period_start DATE,
                period_end DATE,
                include_inactive BOOLEAN DEFAULT FALSE,
                generated_by INT NOT NULL,
                generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                report_data JSON,
                file_path VARCHAR(500),
                status ENUM('generating', 'completed', 'failed') DEFAULT 'generating',
                
                FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE SET NULL,
                FOREIGN KEY (generated_by) REFERENCES users(user_id) ON DELETE CASCADE,
                INDEX idx_college_id (college_id),
                INDEX idx_generated_by (generated_by),
                INDEX idx_generated_at (generated_at)
            )
        `);
        console.log('✅ Employee reports table created');

        // Insert sample colleges
        console.log('📋 Inserting sample colleges...');
        const sampleColleges = [
            ['Addis Ababa Technical College', 'AATC001', 'Addis Ababa', 'technical', 'active', 'info@aatc.edu.et', '+251-11-123-4567', 'Leading technical college in Addis Ababa'],
            ['Bahir Dar Vocational Institute', 'BDVI002', 'Bahir Dar', 'vocational', 'active', 'admin@bdvi.edu.et', '+251-58-123-4567', 'Vocational training institute in Bahir Dar'],
            ['Hawassa Technical University', 'HTU003', 'Hawassa', 'university', 'active', 'registrar@htu.edu.et', '+251-46-123-4567', 'Technical university offering various programs']
        ];

        for (const college of sampleColleges) {
            try {
                await db.query(`
                    INSERT IGNORE INTO colleges 
                    (college_name, college_code, location, college_type, status, contact_email, contact_phone, description) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `, college);
                console.log(`✅ Inserted college: ${college[0]}`);
            } catch (error) {
                console.log(`⚠️  College ${college[0]} already exists or error:`, error.message);
            }
        }

        // Insert sample departments
        console.log('📋 Inserting sample departments...');
        const sampleDepartments = [
            [1, 'Computer Science', 'CS', 'active'],
            [1, 'Electrical Engineering', 'EE', 'active'],
            [1, 'Mechanical Engineering', 'ME', 'active'],
            [2, 'Automotive Technology', 'AT', 'active'],
            [2, 'Construction Technology', 'CT', 'active'],
            [3, 'Information Technology', 'IT', 'active'],
            [3, 'Civil Engineering', 'CE', 'active']
        ];

        for (const dept of sampleDepartments) {
            try {
                await db.query(`
                    INSERT IGNORE INTO college_departments 
                    (college_id, department_name, department_code, status) 
                    VALUES (?, ?, ?, ?)
                `, dept);
                console.log(`✅ Inserted department: ${dept[1]}`);
            } catch (error) {
                console.log(`⚠️  Department ${dept[1]} already exists or error:`, error.message);
            }
        }

        console.log('🎉 Education office database setup completed successfully!');
        console.log('📊 Summary:');
        console.log('   ✅ Colleges table created');
        console.log('   ✅ College departments table created');
        console.log('   ✅ Employees table enhanced');
        console.log('   ✅ Employee reports table created');
        console.log('   ✅ Sample data inserted');

    } catch (error) {
        console.error('❌ Error creating education office tables:', error);
    }
}

createEducationOfficeTables();
