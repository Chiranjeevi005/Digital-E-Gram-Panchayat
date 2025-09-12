const { exec } = require('child_process');

console.log('Creating test documents in all collections...');

// Commands to create test documents
const commands = [
  'mongosh digital-e-panchayat --eval "db.users.insertOne({name: \'Test User\', email: \'test@example.com\', role: \'Citizens\'})"',
  'mongosh digital-e-panchayat --eval "db.services.insertOne({name: \'Test Service\', description: \'A test service\', requirements: [\'Requirement 1\'], processingTime: 0, isActive: true, createdBy: ObjectId()})"',
  'mongosh digital-e-panchayat --eval "db.applications.insertOne({service: ObjectId(), applicant: ObjectId(), status: \'pending\', formData: {}, processingTime: 0})"'
];

function runCommand(index) {
  if (index >= commands.length) {
    console.log('All test documents created');
    checkDocumentCounts();
    return;
  }
  
  const command = commands[index];
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

function checkDocumentCounts() {
  console.log('Checking document counts...');
  
  const countCommands = [
    'mongosh digital-e-panchayat --eval "db.users.countDocuments()"',
    'mongosh digital-e-panchayat --eval "db.services.countDocuments()"',
    'mongosh digital-e-panchayat --eval "db.applications.countDocuments()"'
  ];
  
  countCommands.forEach((command, index) => {
    const collectionNames = ['users', 'services', 'applications'];
    setTimeout(() => {
      console.log(`Checking ${collectionNames[index]} count...`);
      exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error checking ${collectionNames[index]} count:`, error);
        }
        if (stdout) console.log(`${collectionNames[index]} count:`, stdout);
        if (stderr) console.error('stderr:', stderr);
      });
    }, index * 1000);
  });
}

// Start running commands
runCommand(0);