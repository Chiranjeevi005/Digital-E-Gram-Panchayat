const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log('MONGODB_URI:', MONGODB_URI);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Successfully connected to MongoDB');
  console.log('Database name:', mongoose.connection.name);
  
  // Create a simple document to force collection creation
  const testSchema = new mongoose.Schema({ name: String });
  const TestModel = mongoose.model('Test', testSchema);
  
  const testDoc = new TestModel({ name: 'test' });
  await testDoc.save();
  console.log('Created test document');
  
  // List collections
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Collections:', collections.map(c => c.name));
  
  mongoose.connection.close();
})
.catch(err => {
  console.error('Error connecting to MongoDB:', err);
});