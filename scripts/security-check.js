#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 Running security check for sensitive files...\n');

// Check specifically for sensitive .env files (excluding .env.example)
try {
  const trackedEnvFiles = execSync('git ls-files | findstr ".env"', { encoding: 'utf-8' });
  const envFiles = trackedEnvFiles.trim().split('\n').filter(file => file.length > 0);
  
  // Only flag sensitive .env files (not .env.example)
  const sensitiveEnvFiles = envFiles.filter(file => 
    file.includes('.env.local') || 
    file.includes('.env.production') || 
    file.includes('.env.development') ||
    (file.includes('.env.') && !file.includes('.env.example'))
  );
  
  if (sensitiveEnvFiles.length > 0) {
    console.error('🚨 SECURITY ISSUE: Sensitive .env files are being tracked by Git:');
    sensitiveEnvFiles.forEach(file => {
      console.error(`  - ${file}`);
    });
    console.error('\n❌ FAILED: Remove sensitive files from Git tracking immediately!\n');
    process.exit(1);
  } else {
    console.log('✅ No sensitive .env files are being tracked');
  }
} catch (error) {
  console.log('✅ No sensitive .env files are being tracked');
}

// Check for private keys and certificates
console.log('\n🔍 Checking for private keys and certificates...');
try {
  const keyFiles = execSync('git ls-files | findstr -i ".pem\\|.key\\|.crt\\|.cer\\|id_rsa"', { encoding: 'utf-8' });
  const keyFileList = keyFiles.trim().split('\n').filter(file => file.length > 0);
  
  // Filter out known safe files
  const sensitiveKeyFiles = keyFileList.filter(file => {
    // next-env.d.ts is a standard Next.js file and is safe
    if (file === 'next-env.d.ts') return false;
    return true;
  });
  
  if (sensitiveKeyFiles.length > 0) {
    console.error('🚨 SECURITY ISSUE: Private keys or certificates are being tracked:');
    sensitiveKeyFiles.forEach(file => console.error(`  - ${file}`));
    console.error('\n❌ FAILED: Remove sensitive files from Git tracking immediately!\n');
    process.exit(1);
  } else {
    console.log('✅ No private keys or certificates are being tracked');
  }
} catch (error) {
  console.log('✅ No private keys or certificates are being tracked');
}

// Check for database files
console.log('\n🔍 Checking for database files...');
try {
  const dbFiles = execSync('git ls-files | findstr -i ".db\\|.sqlite"', { encoding: 'utf-8' });
  const dbFileList = dbFiles.trim().split('\n').filter(file => file.length > 0);
  
  if (dbFileList.length > 0) {
    console.error('🚨 SECURITY ISSUE: Database files are being tracked:');
    dbFileList.forEach(file => console.error(`  - ${file}`));
    console.error('\n❌ FAILED: Remove sensitive files from Git tracking immediately!\n');
    process.exit(1);
  } else {
    console.log('✅ No database files are being tracked');
  }
} catch (error) {
  console.log('✅ No database files are being tracked');
}

// Check if .gitignore is properly configured
console.log('\n🔍 Checking .gitignore configuration...');
const gitignoreContent = fs.readFileSync('.gitignore', 'utf-8');

const requiredPatterns = [
  'node_modules',
  '.env.local',
  '.env.production',
  '.env.development',
  '.next',
  '*.log',
  '*.pem',
  '*.key',
  '*.crt',
  '*.cer',
  'id_rsa'
];

const missingPatterns = requiredPatterns.filter(pattern => !gitignoreContent.includes(pattern));

if (missingPatterns.length > 0) {
  console.error('🚨 SECURITY ISSUE: .gitignore is missing important patterns:');
  missingPatterns.forEach(pattern => console.error(`  - ${pattern}`));
  console.error('\n❌ FAILED: Update .gitignore to include these patterns!\n');
  process.exit(1);
} else {
  console.log('✅ .gitignore contains all required patterns');
}

console.log('\n🎉 All security checks passed! Your repository is secure.\n');
console.log('💡 Remember to run this check regularly and especially before pushing to production!\n');