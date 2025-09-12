import * as http from 'http';

// Test data
const postData = JSON.stringify({
  service: '68bebc241abe6c018b958e3f',
  formData: {
    fullName: 'Test User',
    email: 'test@example.com',
    mobile: '1234567890',
    address: '123 Test Street'
  }
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/applications',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  res.on('data', (chunk) => {
    console.log(`Body: ${chunk}`);
  });
  
  res.on('end', () => {
    console.log('Request completed');
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();