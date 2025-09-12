const fs = require('fs');
const path = require('path');
const selfsigned = require('selfsigned');

// Create cert directory if it doesn't exist
const certDir = path.join(__dirname, '..', 'cert');
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir);
}

// Generate certificate
const attrs = [{ name: 'commonName', value: 'localhost' }];
const pems = selfsigned.generate(attrs, {
  days: 365,
  algorithm: 'sha256',
  extensions: [{
    name: 'basicConstraints',
    cA: true
  }, {
    name: 'keyUsage',
    keyCertSign: true,
    digitalSignature: true,
    nonRepudiation: true,
    keyEncipherment: true,
    dataEncipherment: true
  }, {
    name: 'extKeyUsage',
    serverAuth: true,
    clientAuth: true,
    codeSigning: true,
    timeStamping: true
  }, {
    name: 'subjectAltName',
    altNames: [{
      type: 2, // DNS
      value: 'localhost'
    }, {
      type: 7, // IP
      ip: '127.0.0.1'
    }]
  }]
});

// Write private key
fs.writeFileSync(path.join(certDir, 'server.key'), pems.private);
console.log('Private key written to:', path.join(certDir, 'server.key'));

// Write certificate
fs.writeFileSync(path.join(certDir, 'server.cert'), pems.cert);
console.log('Certificate written to:', path.join(certDir, 'server.cert'));

console.log('SSL certificate generated successfully!');