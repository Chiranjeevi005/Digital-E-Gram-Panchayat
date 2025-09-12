const mongoose = require('mongoose');
const { Server } = require('socket.io');
const http = require('http');

async function testRealtimeNotifications() {
  try {
    await mongoose.connect('mongodb+srv://chiru:chiru@cluster0.yylyjss.mongodb.net/test?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Testing real-time notification system...\n');
    
    // Get all users with different roles
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    
    // Find users for each role
    const citizenUser = users.find(user => user.role === 'Citizens');
    const staffUser = users.find(user => user.role === 'Staff');
    const officerUser = users.find(user => user.role === 'Officer');
    const adminUser = users.find(user => user.role === 'admin');
    
    console.log('Testing users:');
    if (citizenUser) console.log(`Citizen: ${citizenUser.name} (${citizenUser.email}) - ID: ${citizenUser._id}`);
    if (staffUser) console.log(`Staff: ${staffUser.name} (${staffUser.email}) - ID: ${staffUser._id}`);
    if (officerUser) console.log(`Officer: ${officerUser.name} (${officerUser.email}) - ID: ${officerUser._id}`);
    if (adminUser) console.log(`Admin: ${adminUser.name} (${adminUser.email}) - ID: ${adminUser._id}`);
    
    // Test creating notifications for different user roles
    const testUsers = [
      { user: citizenUser, role: 'Citizen' },
      { user: staffUser, role: 'Staff' },
      { user: officerUser, role: 'Officer' },
      { user: adminUser, role: 'Admin' }
    ].filter(item => item.user);
    
    for (const { user, role } of testUsers) {
      console.log(`\nCreating test notification for ${role}: ${user.name}`);
      
      const notification = {
        user: user._id,
        title: `${role} Test Notification`,
        message: `This is a test notification for a ${role.toLowerCase()} user to verify role-based notification delivery.`,
        type: 'info',
        isRead: false,
        createdAt: new Date()
      };
      
      const result = await mongoose.connection.db.collection('notifications').insertOne(notification);
      console.log(`  Notification created with ID: ${result.insertedId}`);
    }
    
    console.log('\n✅ All notifications created successfully!');
    console.log('\nTo test real-time functionality:');
    console.log('1. Start your Next.js application');
    console.log('2. Log in as each user type');
    console.log('3. Observe that each user only sees their own notifications');
    console.log('4. Verify that the notification dropdown automatically opens when a new notification arrives');
    console.log('5. Check that the dropdown closes after 5 seconds or when "Mark as Read" is clicked');
    
    process.exit(0);
  } catch (error) {
    console.error('Error testing real-time notifications:', error);
    process.exit(1);
  }
}

testRealtimeNotifications();