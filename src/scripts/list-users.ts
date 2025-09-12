import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Define the User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  provider: String,
  status: String,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function listUsers() {
  try {
    console.log('Connecting to database...');
    
    // Check if MONGODB_URI is defined
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });
    
    console.log('Connected to database successfully!');
    
    // List all users
    const users = await User.find({}).select('name email role provider status');
    console.log(`Found ${users.length} users:`);
    
    users.forEach((user: any, index) => {
      console.log(`${index + 1}. Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Provider: ${user.provider}`);
      console.log(`   Status: ${user.status}`);
      console.log('---');
    });
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

listUsers();