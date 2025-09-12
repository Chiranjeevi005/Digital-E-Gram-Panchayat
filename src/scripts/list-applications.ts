import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Define the Application schema
const applicationSchema = new mongoose.Schema({
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: String,
  formData: mongoose.Schema.Types.Mixed,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  remarks: String,
  processingTime: Number,
  downloadStatus: String,
  downloadLinks: {
    pdf: String,
    jpeg: String,
  },
  submittedAt: Date,
  processedAt: Date,
}, { timestamps: true });

const Application = mongoose.model('Application', applicationSchema);

async function listApplications() {
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
    
    // Count all applications
    const count = await Application.countDocuments();
    console.log(`Total applications in database: ${count}`);
    
    // List recent applications
    const applications = await Application.find({}).populate('service', 'name').populate('applicant', 'name email').sort({ createdAt: -1 }).limit(5);
    console.log(`Recent applications:`);
    
    applications.forEach((application: any, index) => {
      console.log(`${index + 1}. Service: ${application.service?.name || 'N/A'}`);
      console.log(`   Applicant: ${application.applicant?.name || 'N/A'} (${application.applicant?.email || 'N/A'})`);
      console.log(`   Status: ${application.status}`);
      console.log(`   Submitted: ${application.submittedAt}`);
      console.log('---');
    });
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

listApplications();