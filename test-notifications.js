const mongoose = require('mongoose');

async function testNotifications() {
  try {
    await mongoose.connect('mongodb+srv://chiru:chiru@cluster0.yylyjss.mongodb.net/test?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Testing notification system...\n');
    
    // Get all users
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    
    console.log('Users in database:');
    console.log('==================');
    
    // Display users with their roles
    users.forEach((user, index) => {
      console.log(`${index + 1}. Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   ID: ${user._id}`);
      console.log('------------------');
    });
    
    console.log(`\nTotal users: ${users.length}`);
    
    // Test creating a notification for a specific user (John Citizen)
    const johnCitizen = users.find(user => user.email === 'john@example.com');
    if (johnCitizen) {
      console.log(`\nCreating test notification for ${johnCitizen.name} (${johnCitizen.email})`);
      
      const notification = {
        user: johnCitizen._id,
        title: 'Test Notification',
        message: 'This is a test notification to verify the notification system is working correctly.',
        type: 'info',
        isRead: false,
        createdAt: new Date()
      };
      
      const result = await mongoose.connection.db.collection('notifications').insertOne(notification);
      console.log(`Notification created with ID: ${result.insertedId}`);
    } else {
      console.log('\nJohn Citizen user not found. Please create test users first.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error testing notifications:', error);
    process.exit(1);
  }
}

testNotifications();