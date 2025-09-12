// Load environment variables
require('dotenv').config({ path: '.env.local' });

console.log('Environment Variables Check:');
console.log('========================');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'NOT SET');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET');
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');

// Check if required variables are set
const requiredVars = ['NEXTAUTH_URL', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'NEXTAUTH_SECRET'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.log('\n❌ Missing required environment variables:');
  missingVars.forEach(varName => console.log(`  - ${varName}`));
} else {
  console.log('\n✅ All required environment variables are set');
}

// Show the redirect URI that should be configured in Google Console
if (process.env.NEXTAUTH_URL) {
  console.log('\n🔧 Google OAuth Redirect URI to configure:');
  console.log(`  ${process.env.NEXTAUTH_URL}/api/auth/callback/google`);
}