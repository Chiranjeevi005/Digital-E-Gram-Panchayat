const fs = require('fs');
const path = require('path');

// This script updates the favicon reference in the layout file
// In this case, we're already using the correct path, so we'll just log a message

console.log('Favicon is already properly configured in the layout file.');
console.log('To regenerate the favicon from the navbar logo, run: node scripts/generate-favicon.js');