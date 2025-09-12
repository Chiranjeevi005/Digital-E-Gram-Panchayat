const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function fixAllApplications() {
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
    
    // Fix applications with missing applicant references
    const result = await mongoose.connection.db.collection('applications').updateMany(
      { applicant: { $exists: false } },
      { $set: { applicant: null } }
    );
    
    console.log(`Fixed ${result.modifiedCount} applications with missing applicant references`);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error fixing applications:', error);
    process.exit(1);
  }
}

fixAllApplications();