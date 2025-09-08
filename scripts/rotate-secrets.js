#!/usr/bin/env node

/**
 * Script to rotate application secrets
 * 
 * Usage:
 * node scripts/rotate-secrets.js [--env=production|staging|development]
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Function to generate a secure random secret
function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

// Function to update environment variables
function updateEnvironmentVariables(env = 'development') {
  const envFile = env === 'production' ? '.env.production' : 
                 env === 'staging' ? '.env.staging' : 
                 '.env.local';
  
  const envPath = path.join(__dirname, '..', envFile);
  
  // Read existing env file or create new one
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Parse existing variables
  const envVars = {};
  const lines = envContent.split('\n');
  lines.forEach(line => {
    if (line.includes('=')) {
      const [key, ...value] = line.split('=');
      envVars[key.trim()] = value.join('=').trim();
    }
  });
  
  // Generate new secrets
  const newSecrets = {
    NEXTAUTH_SECRET: generateSecret(),
    SIGNING_SECRET: generateSecret(32)
  };
  
  // Update env vars with new secrets
  Object.assign(envVars, newSecrets);
  
  // Write back to file
  const newEnvContent = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  fs.writeFileSync(envPath, newEnvContent);
  
  console.log(`✅ Updated secrets in ${envFile}`);
  console.log('New secrets:');
  Object.entries(newSecrets).forEach(([key, value]) => {
    console.log(`  ${key}: ${value.substring(0, 10)}...`);
  });
}

// Function to rotate Cloudinary credentials (placeholder)
function rotateCloudinaryCredentials() {
  console.log('🔄 Rotating Cloudinary credentials...');
  console.log('   Note: This requires manual update in Cloudinary dashboard');
  console.log('   1. Log in to Cloudinary dashboard');
  console.log('   2. Go to Settings > Security');
  console.log('   3. Generate new API key and secret');
  console.log('   4. Update environment variables with new credentials');
}

// Function to rotate MongoDB credentials
function rotateMongoDBCredentials() {
  console.log('🔄 Rotating MongoDB credentials...');
  console.log('   Note: This requires manual update in MongoDB Atlas');
  console.log('   1. Log in to MongoDB Atlas');
  console.log('   2. Go to Database Access');
  console.log('   3. Edit the application user');
  console.log('   4. Generate new password');
  console.log('   5. Update environment variables with new credentials');
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const envArg = args.find(arg => arg.startsWith('--env='));
  const env = envArg ? envArg.split('=')[1] : 'development';
  
  console.log(`🔐 Rotating secrets for ${env} environment...\n`);
  
  try {
    updateEnvironmentVariables(env);
    rotateCloudinaryCredentials();
    rotateMongoDBCredentials();
    
    console.log('\n✅ Secret rotation completed!');
    console.log('\n⚠️  Remember to:');
    console.log('   1. Update secrets in your deployment platform (Vercel, Render, etc.)');
    console.log('   2. Restart your application services');
    console.log('   3. Update any dependent services with new credentials');
  } catch (error) {
    console.error('❌ Error rotating secrets:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  generateSecret,
  updateEnvironmentVariables
};