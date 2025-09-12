// We can't directly require the TypeScript file, so let's use the MongoDB connection directly
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log('Testing database connection...');

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async (connection) => {
  console.log('Successfully connected to MongoDB');
  console.log('Database name:', connection.connection.name);
  
  // List collections
  const collections = await connection.connection.db.listCollections().toArray();
  console.log('Collections:', collections.map(c => c.name));
  
  // Close connection
  connection.connection.close();
})
.catch(err => {
  console.error('Error connecting to MongoDB:', err);
});