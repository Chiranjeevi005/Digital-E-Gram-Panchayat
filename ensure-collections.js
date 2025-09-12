// This script ensures that all required collections exist with at least one document
const { exec } = require('child_process');

console.log('Ensuring required collections exist...');

// Run the initialization scripts
const initCommands = [
  'npm run init:services',
  'npm run init:required-accounts'
];

function runCommand(index) {
  if (index >= initCommands.length) {
    console.log('All initialization commands completed');
    setTimeout(checkCollections, 2000); // Wait a bit for database operations to complete
    return;
  }
  
  const command = initCommands[index];
  console.log(`Running: ${command}`);
  
  exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error running ${command}:`, error);
    }
    if (stdout) console.log(stdout);
    if (stderr) console.error('stderr:', stderr);
    
    // Run next command
    setTimeout(() => runCommand(index + 1), 1000);
  });
}

function checkCollections() {
  console.log('Checking collections...');
  
  exec('mongosh digital-e-panchayat --eval "db.getCollectionNames()"', 
    { cwd: process.cwd() }, 
    (error, stdout, stderr) => {
      if (error) {
        console.error('Error checking collections:', error);
        return;
      }
      if (stdout) console.log('Collections:', stdout);
      if (stderr) console.error('stderr:', stderr);
    }
  );
}

// Start running commands
runCommand(0);