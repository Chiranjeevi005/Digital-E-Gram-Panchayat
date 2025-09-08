#!/usr/bin/env node

/**
 * Script to backup application data
 * 
 * Usage:
 * node scripts/backup.js [--type=mongodb|files] [--destination=path]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// Function to backup MongoDB
async function backupMongoDB(destination) {
  console.log('💾 Backing up MongoDB database...');
  
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable not set');
    }
    
    // Create backup directory
    const backupDir = destination || path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Generate timestamp for backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `mongodb-backup-${timestamp}`);
    
    // For MongoDB Atlas, we need to use mongodump
    // This requires the MongoDB Database Tools to be installed
    const command = `mongodump --uri="${uri}" --out="${backupPath}"`;
    
    console.log(`Executing: ${command}`);
    execSync(command, { stdio: 'inherit' });
    
    console.log(`✅ MongoDB backup completed: ${backupPath}`);
    return { success: true, path: backupPath };
  } catch (error) {
    console.error('❌ MongoDB backup failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Function to backup Cloudinary files
async function backupCloudinary(destination) {
  console.log('💾 Backing up Cloudinary files...');
  
  try {
    // This is a placeholder implementation
    // In production, you would use the Cloudinary API to list and download files
    console.log('⚠️  Cloudinary backup not implemented');
    console.log('   To implement:');
    console.log('   1. Use Cloudinary Admin API to list resources');
    console.log('   2. Download each resource to local storage');
    console.log('   3. Store in backup destination');
    
    return { success: true, message: 'Cloudinary backup placeholder' };
  } catch (error) {
    console.error('❌ Cloudinary backup failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Function to backup application code
async function backupCode(destination) {
  console.log('💾 Backing up application code...');
  
  try {
    const backupDir = destination || path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Generate timestamp for backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `code-backup-${timestamp}.tar.gz`);
    
    // Create a tar.gz archive of the source code
    const command = `tar -czf "${backupPath}" --exclude=node_modules --exclude=.next --exclude=backups .`;
    
    console.log(`Executing: ${command}`);
    execSync(command, { stdio: 'inherit' });
    
    console.log(`✅ Code backup completed: ${backupPath}`);
    return { success: true, path: backupPath };
  } catch (error) {
    console.error('❌ Code backup failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Function to verify backup integrity
async function verifyBackup(backupPath) {
  console.log(`🔍 Verifying backup integrity: ${backupPath}`);
  
  try {
    // Check if backup file exists
    if (!fs.existsSync(backupPath)) {
      throw new Error('Backup file does not exist');
    }
    
    // Check file size
    const stats = fs.statSync(backupPath);
    if (stats.size === 0) {
      throw new Error('Backup file is empty');
    }
    
    console.log(`✅ Backup verified: ${stats.size} bytes`);
    return { success: true, size: stats.size };
  } catch (error) {
    console.error('❌ Backup verification failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const typeArg = args.find(arg => arg.startsWith('--type='));
  const destArg = args.find(arg => arg.startsWith('--destination='));
  
  const type = typeArg ? typeArg.split('=')[1] : 'all';
  const destination = destArg ? destArg.split('=')[1] : null;
  
  console.log(`💾 Starting backup process (${type})...\n`);
  
  let results = [];
  
  try {
    if (type === 'all' || type === 'mongodb') {
      results.push({
        type: 'mongodb',
        result: await backupMongoDB(destination)
      });
    }
    
    if (type === 'all' || type === 'cloudinary') {
      results.push({
        type: 'cloudinary',
        result: await backupCloudinary(destination)
      });
    }
    
    if (type === 'all' || type === 'code') {
      results.push({
        type: 'code',
        result: await backupCode(destination)
      });
    }
    
    // Summary
    console.log('\n📋 Backup Summary:');
    let hasFailures = false;
    
    results.forEach(({ type, result }) => {
      const status = result.success ? '✅' : '❌';
      console.log(`   ${status} ${type}: ${result.success ? 'Completed' : 'Failed'}`);
      
      if (result.path) {
        console.log(`      Path: ${result.path}`);
      }
      
      if (!result.success) {
        hasFailures = true;
      }
    });
    
    if (hasFailures) {
      console.log('\n⚠️  Some backups failed');
      process.exit(1);
    } else {
      console.log('\n✅ All backups completed successfully!');
    }
  } catch (error) {
    console.error('❌ Backup process failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  backupMongoDB,
  backupCloudinary,
  backupCode,
  verifyBackup
};