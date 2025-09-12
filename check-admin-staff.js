// Script to check officer and staff credentials in MongoDB
require('dotenv').config({ path: '.env.local' });

const { MongoClient } = require('mongodb');

async function checkOfficerStaff() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('MONGODB_URI not found in environment variables');
    return;
  }
  
  const client = new MongoClient(uri);
  
  try {
    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');
    
    // Select the database (default is usually the one in the URI)
    const db = client.db();
    
    // Check users collection for officer users
    const usersCollection = db.collection('users');
    
    // Find officer users (role: 'officer' or 'admin')
    const officerUsers = await usersCollection.find({ 
      role: { $in: ['officer', 'admin'] }
    }).toArray();
    
    console.log(`\nOfficer users: ${officerUsers.length}`);
    
    if (officerUsers.length > 0) {
      officerUsers.forEach((user, index) => {
        console.log(`\nOfficer User ${index + 1}:`);
        console.log(`  ID: ${user._id}`);
        console.log(`  Name: ${user.name}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Provider: ${user.provider || 'local'}`);
        if (user.isDeactivated !== undefined) {
          console.log(`  Deactivated: ${user.isDeactivated}`);
        }
      });
    } else {
      console.log('No officer users found');
    }
    
    // Find staff users (role: 'staff')
    const staffUsers = await usersCollection.find({ 
      role: 'staff'
    }).toArray();
    
    console.log(`\nStaff users: ${staffUsers.length}`);
    
    if (staffUsers.length > 0) {
      staffUsers.forEach((user, index) => {
        console.log(`\nStaff User ${index + 1}:`);
        console.log(`  ID: ${user._id}`);
        console.log(`  Name: ${user.name}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Provider: ${user.provider || 'local'}`);
        if (user.isDeactivated !== undefined) {
          console.log(`  Deactivated: ${user.isDeactivated}`);
        }
      });
    } else {
      console.log('No staff users found');
    }
    
    // Note: Passwords are hashed and should not be displayed for security reasons
    console.log('\n--- Security Note ---');
    console.log('Passwords are securely hashed and cannot be retrieved.');
    console.log('If you need to reset a password, you should use the application\'s password reset feature.');
    
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the function
checkOfficerStaff();