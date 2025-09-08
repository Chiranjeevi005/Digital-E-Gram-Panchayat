// Simple script to verify account management endpoints
async function verifyEndpoints() {
  console.log('Verifying account management endpoints...');
  
  try {
    // Test the download data endpoint
    console.log('Testing /api/user/account/data endpoint...');
    const dataResponse = await fetch('http://localhost:3000/api/user/account/data');
    console.log('Data endpoint status:', dataResponse.status);
    
    // Test the deactivate endpoint
    console.log('Testing /api/user/deactivate endpoint...');
    const deactivateResponse = await fetch('http://localhost:3000/api/user/deactivate', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Deactivate endpoint status:', deactivateResponse.status);
    
    // Test the delete endpoint
    console.log('Testing /api/user/account/delete endpoint...');
    const deleteResponse = await fetch('http://localhost:3000/api/user/account/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Delete endpoint status:', deleteResponse.status);
    
    console.log('Endpoint verification completed.');
  } catch (error) {
    console.error('Error verifying endpoints:', error);
  }
}

verifyEndpoints();