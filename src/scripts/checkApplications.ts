import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' }) // Load environment variables from .env.local

import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'
import Application from '@/models/Application'
import User from '@/models/User'

async function checkApplications() {
  try {
    console.log('Connecting to database...')
    await dbConnect()
    
    console.log('Fetching all applications...')
    const applications = await Application.find({})
      .populate('applicant', 'name email')
      .populate('service', 'name')
      .lean()
    
    console.log(`Found ${applications.length} applications:`)
    console.log('=====================================')
    
    for (const app of applications) {
      console.log(`Application ID: ${app._id}`)
      console.log(`Service: ${app.service?.name || 'N/A'}`)
      console.log(`Applicant ID: ${app.applicant?._id || 'N/A'}`)
      console.log(`Applicant Name: ${app.applicant?.name || 'N/A'}`)
      console.log(`Applicant Email: ${app.applicant?.email || 'N/A'}`)
      console.log(`Status: ${app.status}`)
      console.log('---')
    }
    
    console.log('\nFetching all users...')
    const users = await User.find({}).lean()
    
    console.log(`Found ${users.length} users:`)
    console.log('=====================================')
    
    for (const user of users) {
      console.log(`User ID: ${user._id}`)
      console.log(`Name: ${user.name}`)
      console.log(`Email: ${user.email}`)
      console.log(`Role: ${user.role}`)
      console.log('---')
    }
    
    console.log('Check completed!')
    process.exit(0)
  } catch (error) {
    console.error('Error checking applications:', error)
    process.exit(1)
  }
}

checkApplications()