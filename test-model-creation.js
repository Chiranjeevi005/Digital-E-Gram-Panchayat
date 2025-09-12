const mongoose = require('mongoose');
require('dotenv').config();

// Import models using require
const User = require('./src/models/User');
const Service = require('./src/models/Service');
const Application = require('./src/models/Application');

const MONGODB_URI = process.env.MONGODB_URI;

console.log('Attempting to connect to MongoDB and create test documents...');

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Successfully connected to MongoDB');
  
  try {
    // Create a test user
    console.log('Creating test user...');
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'Citizens'
    });
    
    await user.save();
    console.log('Created user:', user._id);
    
    // Create a test service
    console.log('Creating test service...');
    const service = new Service({
      name: 'Test Service',
      description: 'A test service',
      requirements: ['Requirement 1', 'Requirement 2'],
      processingTime: 0,
      isActive: true,
      createdBy: user._id
    });
    
    await service.save();
    console.log('Created service:', service._id);
    
    // Create a test application
    console.log('Creating test application...');
    const application = new Application({
      service: service._id,
      applicant: user._id,
      status: 'approved',
      formData: { field1: 'value1', field2: 'value2' },
      processingTime: 0,
      downloadStatus: 'ready'
    });
    
    await application.save();
    console.log('Created application:', application._id);
    
    console.log('Test documents created successfully!');
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('Error creating test documents:', error);
  } finally {
    mongoose.connection.close();
  }
})
.catch(err => {
  console.error('Error connecting to MongoDB:', err);
});