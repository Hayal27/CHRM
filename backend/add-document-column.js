// Script to add document_path column to employees table
const db = require('./models/db');

async function addDocumentColumn() {
    try {
        console.log('🔧 Adding document_path column to employees table...');

        // Add document_path column
        await db.query(`
            ALTER TABLE employees 
            ADD COLUMN IF NOT EXISTS document_path VARCHAR(500)
        `);
        
        console.log('✅ document_path column added successfully');

        // Add index for better performance
        try {
            await db.query(`
                CREATE INDEX IF NOT EXISTS idx_employees_document_path 
                ON employees(document_path)
            `);
            console.log('✅ Index created for document_path column');
        } catch (error) {
            if (error.code !== 'ER_DUP_KEYNAME') {
                console.log('⚠️  Index creation warning:', error.message);
            }
        }

        console.log('🎉 Database update completed successfully!');

    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('⚠️  Column document_path already exists');
        } else {
            console.error('❌ Error adding document column:', error.message);
        }
    }
}

addDocumentColumn();
