import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Loaded' : 'Not found')
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'Loaded' : 'Not found')
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL ? 'Loaded' : 'Not found')