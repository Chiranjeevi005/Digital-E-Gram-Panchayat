const mongoose = require('mongoose');

async function checkDataConsistency() {
  try {
    await mongoose.connect('mongodb+srv://chiru:chiru@cluster0.yylyjss.mongodb.net/test?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Checking data consistency...\n');
    
    // Get all users
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    const userIds = new Set(users.map(u => u._id.toString()));
    console.log(`Found ${users.length} users in the database\n`);
    
    // Get all services
    const services = await mongoose.connection.db.collection('services').find({}).toArray();
    const serviceIds = new Set(services.map(s => s._id.toString()));
    console.log(`Found ${services.length} services in the database\n`);
    
    // Check applications
    const applications = await mongoose.connection.db.collection('applications').find({}).toArray();
    console.log(`Found ${applications.length} applications in the database\n`);
    
    // Check for applications with missing applicants
    let invalidApplications = 0;
    for (const app of applications) {
      if (!userIds.has(app.applicant.toString())) {
        console.log(`❌ Application ${app._id} references missing user: ${app.applicant}`);
        invalidApplications++;
      }
      
      if (!serviceIds.has(app.service.toString())) {
        console.log(`❌ Application ${app._id} references missing service: ${app.service}`);
        invalidApplications++;
      }
    }
    
    if (invalidApplications === 0) {
      console.log('✅ All applications have valid references\n');
    } else {
      console.log(`\n❌ Found ${invalidApplications} applications with invalid references\n`);
    }
    
    // Check download history
    const downloads = await mongoose.connection.db.collection('downloadhistories').find({}).toArray();
    console.log(`Found ${downloads.length} download history records\n`);
    
    let invalidDownloads = 0;
    for (const download of downloads) {
      if (!userIds.has(download.user.toString())) {
        console.log(`❌ Download ${download._id} references missing user: ${download.user}`);
        invalidDownloads++;
      }
      
      if (!serviceIds.has(download.service.toString())) {
        console.log(`❌ Download ${download._id} references missing service: ${download.service}`);
        invalidDownloads++;
      }
      
      if (download.application && !mongoose.Types.ObjectId.isValid(download.application)) {
        console.log(`❌ Download ${download._id} has invalid application ID: ${download.application}`);
        invalidDownloads++;
      }
    }
    
    if (invalidDownloads === 0) {
      console.log('✅ All download history records have valid references\n');
    } else {
      console.log(`\n❌ Found ${invalidDownloads} download history records with invalid references\n`);
    }
    
    console.log('Data consistency check completed');
    process.exit(0);
  } catch (error) {
    console.error('Error checking data consistency:', error);
    process.exit(1);
  }
}

checkDataConsistency();