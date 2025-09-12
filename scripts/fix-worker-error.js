/**
 * Script to fix worker thread errors in Next.js build
 * This script cleans the build cache and ensures proper configuration
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Function to safely remove directory
function removeDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    console.log(`Removing ${dirPath}...`)
    fs.rmSync(dirPath, { recursive: true, force: true })
  }
}

// Function to safely remove file
function removeFile(filePath) {
  if (fs.existsSync(filePath)) {
    console.log(`Removing ${filePath}...`)
    fs.unlinkSync(filePath)
  }
}

try {
  console.log('Starting fix for worker thread error...')

  // Remove .next directory
  removeDir(path.join(__dirname, '..', '.next'))

  // Remove node_modules
  removeDir(path.join(__dirname, '..', 'node_modules'))

  // Remove package-lock.json
  removeFile(path.join(__dirname, '..', 'package-lock.json'))

  // Remove any existing build artifacts
  removeDir(path.join(__dirname, '..', '.next'))
  removeDir(path.join(__dirname, '..', '.dist'))
  removeDir(path.join(__dirname, '..', 'dist'))

  // Clean npm cache
  console.log('Cleaning npm cache...')
  execSync('npm cache clean --force', { stdio: 'inherit' })

  // Reinstall dependencies
  console.log('Reinstalling dependencies...')
  execSync('npm install', { stdio: 'inherit' })

  // Build the project
  console.log('Building the project...')
  execSync('npm run build', { stdio: 'inherit' })

  console.log('Worker thread error fix completed successfully!')
  console.log('You can now start the server with: npm run start')

} catch (error) {
  console.error('Error during fix process:', error.message)
  process.exit(1)
}