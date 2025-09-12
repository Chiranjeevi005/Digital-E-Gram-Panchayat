const mongoose = require('mongoose');

async function fixAllApplications() {
  try {
    await mongoose.connect('mongodb+srv://chiru:chiru@cluster0.yylyjss.mongodb.net/test?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Fixing applications with missing users...\n');
    
    // Update all applications referencing the missing user
    const result = await mongoose.connection.db.collection('applications').updateMany(
      { applicant: '68c1650245029b288ce00c6e' },
      { $set: { applicant: '68c30553a5e6b4eae366e0ce' } }
    );
    
    console.log(`Updated ${result.modifiedCount} applications\n`);
    
    // Verify the fix
    const remaining = await mongoose.connection.db.collection('applications').countDocuments({
      applicant: '68c1650245029b288ce00c6e'
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

fixAllApplications();