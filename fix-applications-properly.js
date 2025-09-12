const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function fixApplicationsProperly() {
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
    
    // Fix applications with invalid applicant references
    const applications = await mongoose.connection.db.collection('applications').find({}).toArray();
    
    let fixedCount = 0;
    for (const application of applications) {
      if (application.applicant && typeof application.applicant === 'string') {
        // Convert string to ObjectId
        await mongoose.connection.db.collection('applications').updateOne(
          { _id: application._id },
          { $set: { applicant: new mongoose.Types.ObjectId(application.applicant) } }
        );
        fixedCount++;
      }
    }
    
    console.log(`Fixed ${fixedCount} applications with string applicant references`);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error fixing applications:', error);
    process.exit(1);
  }
}

fixApplicationsProperly();