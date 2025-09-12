const mongoose = require('mongoose');

async function fixMissingUsers() {
  try {
    await mongoose.connect('mongodb+srv://chiru:chiru@cluster0.yylyjss.mongodb.net/test?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    // Find all applications referencing the missing user
    const appsWithMissingUser = await mongoose.connection.db.collection('applications').find({
      applicant: '68c1650245029b288ce00c6e'
    }).toArray();
    
    console.log(`Found ${appsWithMissingUser.length} applications with missing user`);
    
    if (appsWithMissingUser.length > 0) {
      // Update all applications to reference an existing user
      const result = await mongoose.connection.db.collection('applications').updateMany(
        { applicant: '68c1650245029b288ce00c6e' },
        { $set: { applicant: new mongoose.Types.ObjectId('68c30553a5e6b4eae366e0ce') } }
      );
      
      console.log('Applications updated:', result);
    } else {
      console.log('No applications with missing users found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error fixing missing users:', error);
    process.exit(1);
  }
}

fixMissingUsers();