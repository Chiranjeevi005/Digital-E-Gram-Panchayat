const mongoose = require('mongoose');

async function updateApplication() {
  try {
    await mongoose.connect('mongodb+srv://chiru:chiru@cluster0.yylyjss.mongodb.net/test?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    // Update the application to reference an existing user
    const result = await mongoose.connection.db.collection('applications').updateOne(
      { _id: new mongoose.Types.ObjectId('68c3930c3e3fc5b0b2f1a72b') },
      { $set: { applicant: new mongoose.Types.ObjectId('68c30553a5e6b4eae366e0ce') } }
    );
    
    console.log('Application updated successfully:', result);
    process.exit(0);
  } catch (error) {
    console.error('Error updating application:', error);
    process.exit(1);
  }
}

updateApplication();