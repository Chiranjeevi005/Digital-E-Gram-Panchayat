import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Define the Service schema
const serviceSchema = new mongoose.Schema({
  name: String,
  description: String,
  requirements: [String],
  processingTime: Number,
  isActive: Boolean,
  category: String,
  createdBy: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

const Service = mongoose.model('Service', serviceSchema);

async function listServices() {
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
    
    // List all services
    const services = await Service.find({}).limit(10);
    console.log(`Found ${services.length} services:`);
    
    services.forEach((service: any, index) => {
      console.log(`${index + 1}. ${service.name} (ID: ${service._id})`);
      console.log(`   Category: ${service.category || 'N/A'}`);
      console.log(`   Active: ${service.isActive ? 'Yes' : 'No'}`);
      console.log(`   Processing Time: ${service.processingTime} days`);
      console.log('---');
    });
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

listServices();