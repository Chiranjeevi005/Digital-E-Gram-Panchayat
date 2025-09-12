const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function checkDataConsistency() {
  try {
    // Use environment variable for MongoDB connection
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error('MONGODB_URI environment variable is not set');
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    // Check for applications with missing applicant references
    const applicationsWithMissingApplicants = await mongoose.connection.db.collection('applications').find({
      $or: [
        { applicant: { $exists: false } },
        { applicant: null }
      ]
    }).toArray();
    
    console.log(`Found ${applicationsWithMissingApplicants.length} applications with missing applicant references`);
    
    // Check for users with missing required fields
    const usersWithMissingFields = await mongoose.connection.db.collection('users').find({
      $or: [
        { name: { $exists: false } },
        { email: { $exists: false } },
        { role: { $exists: false } }
      ]
    }).toArray();
    
    console.log(`Found ${usersWithMissingFields.length} users with missing required fields`);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error checking data consistency:', error);
    process.exit(1);
  }
}

checkDataConsistency();