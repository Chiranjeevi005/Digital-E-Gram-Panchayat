const mongoose = require('mongoose');

async function listUsers() {
  try {
    await mongoose.connect('mongodb+srv://chiru:chiru@cluster0.yylyjss.mongodb.net/test?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    
    console.log('Users in database:');
    console.log('==================');
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   ID: ${user._id}`);
      console.log('------------------');
    });
    
    console.log(`\nTotal users: ${users.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Connection error:', error);
    process.exit(1);
  }
}

listUsers();