// Script to check Google-authenticated users in MongoDB
require('dotenv').config({ path: '.env.local' });

const { MongoClient } = require('mongodb');

async function checkGoogleUsers() {
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
    
    // Check users collection for Google-authenticated users
    const usersCollection = db.collection('users');
    
    // Find Google-authenticated users
    const googleUsers = await usersCollection.find({ 
      provider: 'google' 
    }).toArray();
    
    console.log(`\nGoogle-authenticated users: ${googleUsers.length}`);
    
    if (googleUsers.length > 0) {
      googleUsers.forEach((user, index) => {
        console.log(`\nGoogle User ${index + 1}:`);
        console.log(`  ID: ${user._id}`);
        console.log(`  Name: ${user.name}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Provider: ${user.provider}`);
        console.log(`  Email Verified: ${user.emailVerified ? new Date(user.emailVerified).toISOString() : 'No'}`);
        if (user.isDeactivated !== undefined) {
          console.log(`  Deactivated: ${user.isDeactivated}`);
        }
      });
    } else {
      console.log('No Google-authenticated users found');
    }
    
    // Also check for users with citizen role (Google users should have this role)
    const citizenUsers = await usersCollection.find({ 
      role: 'citizen' 
    }).toArray();
    
    console.log(`\nUsers with 'citizen' role: ${citizenUsers.length}`);
    
    if (citizenUsers.length > 0) {
      citizenUsers.forEach((user, index) => {
        console.log(`\nCitizen User ${index + 1}:`);
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
      console.log('No users with citizen role found');
    }
    
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the function
checkGoogleUsers();