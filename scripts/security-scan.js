#!/usr/bin/env node

/**
 * Script to run security scans
 * 
 * Usage:
 * node scripts/security-scan.js [--type=audit|semgrep|snyk] [--level=low|medium|high]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to run npm audit
function runNpmAudit(level = 'high') {
  console.log('🔍 Running npm audit...');
  
  try {
    const result = execSync(`npm audit --audit-level=${level}`, {
      stdio: 'pipe',
      encoding: 'utf8'
    });
    
    console.log('✅ npm audit completed successfully');
    return { success: true, output: result };
  } catch (error) {
    console.log('⚠️  npm audit found vulnerabilities:');
    console.log(error.stdout);
    
    // Check if it's a high severity issue
    if (error.status === 1) {
      return { success: false, output: error.stdout, error: error.stderr };
    }
    
    return { success: true, output: error.stdout };
  }
}

// Function to run semgrep
function runSemgrep() {
  console.log('🔍 Running semgrep scan...');
  
  try {
    // Check if semgrep is installed
    execSync('which semgrep', { stdio: 'ignore' });
    
    const result = execSync('npx semgrep --config=p/ci .', {
      stdio: 'pipe',
      encoding: 'utf8'
    });
    
    console.log('✅ Semgrep scan completed successfully');
    return { success: true, output: result };
  } catch (error) {
    if (error.message.includes('not found')) {
      console.log('⚠️  Semgrep not found. Installing...');
      try {
        execSync('npm install -g semgrep', { stdio: 'inherit' });
        return runSemgrep();
      } catch (installError) {
        console.log('❌ Failed to install semgrep');
        return { success: false, error: installError.message };
      }
    }
    
    console.log('⚠️  Semgrep found issues:');
    console.log(error.stdout);
    
    return { success: false, output: error.stdout, error: error.stderr };
  }
}

// Function to run snyk test
function runSnyk() {
  console.log('🔍 Running Snyk test...');
  
  try {
    // Check if snyk is installed
    execSync('which snyk', { stdio: 'ignore' });
    
    const result = execSync('snyk test', {
      stdio: 'pipe',
      encoding: 'utf8'
    });
    
    console.log('✅ Snyk test completed successfully');
    return { success: true, output: result };
  } catch (error) {
    if (error.message.includes('not found')) {
      console.log('⚠️  Snyk not found. Please install it globally:');
      console.log('   npm install -g snyk');
      return { success: false, error: 'Snyk not installed' };
    }
    
    // Snyk returns non-zero exit code for vulnerabilities
    console.log('⚠️  Snyk found vulnerabilities:');
    console.log(error.stdout);
    
    return { success: false, output: error.stdout, error: error.stderr };
  }
}

// Function to check for secrets in code
function checkForSecrets() {
  console.log('🔍 Checking for secrets in code...');
  
  const secretPatterns = [
    /password\s*=\s*['"][^'"]+['"]/gi,
    /secret\s*=\s*['"][^'"]+['"]/gi,
    /api[key|secret]\s*=\s*['"][^'"]+['"]/gi,
    /token\s*=\s*['"][^'"]+['"]/gi,
    /[0-9a-zA-Z]{32,}/g // Long strings that might be secrets
  ];
  
  const filesToCheck = [
    '.env.local',
    '.env',
    'src/',
    'config/'
  ];
  
  let secretsFound = [];
  
  filesToCheck.forEach(fileOrDir => {
    const fullPath = path.join(__dirname, '..', fileOrDir);
    
    if (fs.existsSync(fullPath)) {
      if (fs.lstatSync(fullPath).isDirectory()) {
        // Recursively check directory
        const files = fs.readdirSync(fullPath);
        files.forEach(file => {
          const filePath = path.join(fullPath, file);
          if (fs.lstatSync(filePath).isFile() && 
              (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.env'))) {
            const content = fs.readFileSync(filePath, 'utf8');
            secretPatterns.forEach(pattern => {
              const matches = content.match(pattern);
              if (matches) {
                matches.forEach(match => {
                  secretsFound.push({
                    file: filePath,
                    match: match
                  });
                });
              }
            });
          }
        });
      } else {
        // Check single file
        const content = fs.readFileSync(fullPath, 'utf8');
        secretPatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            matches.forEach(match => {
              secretsFound.push({
                file: fullPath,
                match: match
              });
            });
          }
        });
      }
    }
  });
  
  if (secretsFound.length > 0) {
    console.log('⚠️  Potential secrets found:');
    secretsFound.forEach(secret => {
      console.log(`   File: ${secret.file}`);
      console.log(`   Match: ${secret.match.substring(0, 50)}...`);
    });
    
    return { success: false, secrets: secretsFound };
  } else {
    console.log('✅ No secrets found in code');
    return { success: true };
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const typeArg = args.find(arg => arg.startsWith('--type='));
  const levelArg = args.find(arg => arg.startsWith('--level='));
  
  const type = typeArg ? typeArg.split('=')[1] : 'all';
  const level = levelArg ? levelArg.split('=')[1] : 'high';
  
  console.log(`🛡️  Running security scan (${type})...\n`);
  
  let results = [];
  
  try {
    if (type === 'all' || type === 'audit') {
      results.push({
        type: 'npm-audit',
        result: runNpmAudit(level)
      });
    }
    
    if (type === 'all' || type === 'semgrep') {
      results.push({
        type: 'semgrep',
        result: runSemgrep()
      });
    }
    
    if (type === 'all' || type === 'snyk') {
      results.push({
        type: 'snyk',
        result: runSnyk()
      });
    }
    
    if (type === 'all' || type === 'secrets') {
      results.push({
        type: 'secrets',
        result: checkForSecrets()
      });
    }
    
    // Summary
    console.log('\n📋 Scan Summary:');
    let hasFailures = false;
    
    results.forEach(({ type, result }) => {
      const status = result.success ? '✅' : '❌';
      console.log(`   ${status} ${type}: ${result.success ? 'Passed' : 'Failed'}`);
      
      if (!result.success) {
        hasFailures = true;
      }
    });
    
    if (hasFailures) {
      console.log('\n⚠️  Security scan found issues that need attention');
      process.exit(1);
    } else {
      console.log('\n✅ All security scans passed!');
    }
  } catch (error) {
    console.error('❌ Error running security scan:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  runNpmAudit,
  runSemgrep,
  runSnyk,
  checkForSecrets
};