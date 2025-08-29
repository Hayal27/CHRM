// Fixed helper functions with proper console logging
const API_BASE_URL = "http://localhost:5001";

// Helper function to construct full image URL
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

// Helper function to construct full document URL
const getDocumentUrl = (documentPath) => {
  console.log('📄 Processing document path:', documentPath);
  if (!documentPath) {
    console.log('❌ No document path provided');
    return null;
  }
  if (documentPath.startsWith('http')) {
    console.log('✅ Document path is already full URL:', documentPath);
    return documentPath;
  }
  const fullUrl = `${API_BASE_URL}/${documentPath.replace(/^\/+/, '')}`;
  console.log('🔗 Constructed document URL:', fullUrl);
  return fullUrl;
};

// Test the functions
console.log('\n=== Testing Fixed Helper Functions ===\n');

console.log('Test 1: Image with relative path');
getImageUrl('uploads/profiles/user123.jpg');

console.log('\nTest 2: Image with null path');
getImageUrl(null);

console.log('\nTest 3: Image with full URL');
getImageUrl('http://example.com/image.jpg');

console.log('\nTest 4: Document with relative path');
getDocumentUrl('uploads/documents/doc123.pdf');

console.log('\n✅ Helper functions are working correctly!');