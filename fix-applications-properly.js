const mongoose = require('mongoose');

async function fixApplicationsProperly() {
  try {
    await mongoose.connect('mongodb+srv://chiru:chiru@cluster0.yylyjss.mongodb.net/test?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Fixing applications with missing users properly...\n');
    
    // Find applications with the missing user reference
    const appsWithMissingUser = await mongoose.connection.db.collection('applications').find({
      applicant: new mongoose.Types.ObjectId('68c1650245029b288ce00c6e')
    }).toArray();
    
    console.log(`Found ${appsWithMissingUser.length} applications with missing user references\n`);
    
    if (appsWithMissingUser.length > 0) {
      // Update all applications referencing the missing user
      const result = await mongoose.connection.db.collection('applications').updateMany(
        { applicant: new mongoose.Types.ObjectId('68c1650245029b288ce00c6e') },
        { $set: { applicant: new mongoose.Types.ObjectId('68c30553a5e6b4eae366e0ce') } }
      );
      
      console.log(`Updated ${result.modifiedCount} applications\n`);
    }
    
    // Verify the fix
    const remaining = await mongoose.connection.db.collection('applications').countDocuments({
      applicant: new mongoose.Types.ObjectId('68c1650245029b288ce00c6e')
    });
    
    if (remaining === 0) {
      console.log('✅ All applications now reference valid users\n');
    } else {
      console.log(`❌ ${remaining} applications still reference invalid users\n`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error fixing applications:', error);
    process.exit(1);
  }
}

fixApplicationsProperly();