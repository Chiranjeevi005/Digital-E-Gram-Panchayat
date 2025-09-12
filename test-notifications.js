const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function testNotifications() {
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
    
    // Test notification creation
    const notification = {
      recipient: 'test@example.com',
      message: 'This is a test notification',
      type: 'test',
      createdAt: new Date()
    };
    
    const result = await mongoose.connection.db.collection('notifications').insertOne(notification);
    console.log('Notification created successfully:', result.insertedId);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error testing notifications:', error);
    process.exit(1);
  }
}

testNotifications();