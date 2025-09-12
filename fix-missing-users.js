const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function fixMissingUsers() {
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
    
    // Fix applications with missing user references
    const result = await mongoose.connection.db.collection('applications').updateMany(
      { user: { $exists: false } },
      { $set: { user: null } }
    );
    
    console.log(`Fixed ${result.modifiedCount} applications with missing user references`);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error fixing applications:', error);
    process.exit(1);
  }
}

fixMissingUsers();