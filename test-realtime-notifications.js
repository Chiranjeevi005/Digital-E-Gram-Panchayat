const mongoose = require('mongoose');
const { initSocketIO } = require('./src/lib/socketService');
require('dotenv').config({ path: '.env.local' });

async function testRealtimeNotifications() {
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
    
    // Test realtime notification creation
    const notification = {
      recipient: 'test@example.com',
      message: 'This is a realtime test notification',
      type: 'realtime-test',
      createdAt: new Date()
    };
    
    const result = await mongoose.connection.db.collection('notifications').insertOne(notification);
    console.log('Realtime notification created successfully:', result.insertedId);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error testing realtime notifications:', error);
    process.exit(1);
  }
}

testRealtimeNotifications();