const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log('Attempting to connect to MongoDB...');

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Successfully connected to MongoDB');
  console.log('Connected to database:', mongoose.connection.name);
  
  // List all databases
  const admin = mongoose.connection.db.admin();
  const dbs = await admin.listDatabases();
  console.log('Available databases:', dbs.databases.map(db => db.name));
  
  // Check collections in the current database
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Collections in current database:', collections.map(c => c.name));
  
  // Check if required collections exist
  const requiredCollections = ['applications', 'services', 'users'];
  const missingCollections = requiredCollections.filter(
    required => !collections.some(c => c.name === required)
  );
  
  if (missingCollections.length > 0) {
    console.log('Missing collections:', missingCollections);
  } else {
    console.log('All required collections exist');
  }
  
  // Try to count documents in each collection
  for (const collection of collections) {
    try {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`${collection.name}: ${count} documents`);
    } catch (err) {
      console.log(`Error counting documents in ${collection.name}:`, err.message);
    }
  }
  
  mongoose.connection.close();
})
.catch(err => {
  console.error('Error connecting to MongoDB:', err);
  process.exit(1);
});