// Test script to verify image URL construction
const API_BASE_URL = "http://localhost:5001";

// Helper function to construct full image URL (same as in component)
const getImageUrl = (imagePath) => {
  console.log('🖼️ Processing image path:', imagePath);
  if (!imagePath) {
    console.log('❌ No image path provided');
    return null;
  }
  if (imagePath.startsWith('http')) {
    console.log('✅ Image path is already full URL:', imagePath);
    return imagePath;
  }
  const fullUrl = `${API_BASE_URL}/${imagePath.replace(/^\/+/, '')}`;
  console.log('🔗 Constructed image URL:', fullUrl);
  return fullUrl;
};

// Test different image path scenarios
console.log('\n=== Testing Image URL Construction ===\n');

// Test 1: Relative path
console.log('Test 1: Relative path');
getImageUrl('uploads/profiles/user123.jpg');

console.log('\nTest 2: Path with leading slash');
getImageUrl('/uploads/profiles/user123.jpg');

console.log('\nTest 3: Path with multiple leading slashes');
getImageUrl('///uploads/profiles/user123.jpg');

console.log('\nTest 4: Full URL');
getImageUrl('http://example.com/image.jpg');

console.log('\nTest 5: Null/undefined path');
getImageUrl(null);
getImageUrl(undefined);

console.log('\nTest 6: Empty string');
getImageUrl('');

// Test fetching actual employee data
console.log('\n=== Testing Employee Data Fetch ===\n');

const axios = require('axios');

async function testEmployeeFetch() {
  try {
    console.log('🔄 Fetching employees from:', `${API_BASE_URL}/api/getEmployees`);
    const response = await axios.get(`${API_BASE_URL}/api/getEmployees`);
    
    console.log('📥 Employee fetch response status:', response.status);
    console.log('📥 Response success:', response.data.success);
    console.log('📥 Number of employees:', response.data.employees?.length || 0);
    
    if (response.data.success && response.data.employees) {
      const employees = response.data.employees;
      console.log(`✅ Successfully fetched ${employees.length} employees`);
      
      // Check for images and documents
      let imageCount = 0;
      let documentCount = 0;
      
      employees.forEach((emp, index) => {
        if (emp.profileImage || emp.profile_image) {
          imageCount++;
          console.log(`👤 Employee ${index + 1} (${emp.full_name || emp.name}) - Profile Image:`, emp.profileImage || emp.profile_image);
          
          // Test URL construction
          const imageUrl = getImageUrl(emp.profileImage || emp.profile_image);
          console.log('   Constructed URL:', imageUrl);
        }
        if (emp.document_path) {
          documentCount++;
          console.log(`📄 Employee ${index + 1} (${emp.full_name || emp.name}) - Document:`, emp.document_path);
        }
      });
      
      console.log(`\n📊 Summary: ${imageCount} employees with images, ${documentCount} employees with documents`);
      
      if (imageCount === 0 && documentCount === 0) {
        console.log('ℹ️ No employees have profile images or documents in the database');
        console.log('ℹ️ This explains why images are not displaying - there are no image paths to process');
      }
    }
  } catch (error) {
    console.error('❌ Error fetching employees:', error.message);
  }
}

testEmployeeFetch();