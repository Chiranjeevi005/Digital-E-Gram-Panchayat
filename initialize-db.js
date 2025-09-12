const mongoose = require('mongoose');
require('dotenv').config();

// Import models using require with .js extension
const User = require('./src/models/User.js');
const Service = require('./src/models/Service.js');
const Application = require('./src/models/Application.js');

const MONGODB_URI = process.env.MONGODB_URI;

console.log('Initializing database with required collections and documents...');

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Successfully connected to MongoDB');
  
  try {
    // Create a test user to ensure the users collection exists
    console.log('Creating test user...');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const user = new User({
        name: 'Test Citizen',
        email: 'test@citizen.com',
        password: 'password123',
        role: 'Citizens'
      });
      await user.save();
      console.log('Created test citizen user');
    } else {
      console.log('Users collection already has documents');
    }
    
    // Create a test service to ensure the services collection exists
    console.log('Creating test service...');
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      const service = new Service({
        name: 'Birth Certificate',
        description: 'Apply for birth certificate',
        requirements: ['Full Name', 'Date of Birth'],
        processingTime: 0,
        isActive: true,
        createdBy: (await User.findOne({ role: 'Citizens' }))._id
      });
      await service.save();
      console.log('Created test service');
    } else {
      console.log('Services collection already has documents');
    }
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections created:', collections.map(c => c.name));
    
    console.log('Database initialization completed successfully!');
    
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    mongoose.connection.close();
  }
})
.catch(err => {
  console.error('Error connecting to MongoDB:', err);
});