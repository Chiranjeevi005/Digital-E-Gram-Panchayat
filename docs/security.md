# Security Configuration Guide

This document provides instructions for configuring security settings for deployment on Vercel, Render, and MongoDB Atlas.

## Environment Variables and Secrets Management

### Required Environment Variables

Create a `.env.local` file with the following variables:

```env
# MongoDB Connection
MONGODB_URI=your_mongodb_atlas_connection_string

# NextAuth Configuration
NEXTAUTH_SECRET=your_strong_nextauth_secret
NEXTAUTH_URL=https://your-domain.com

# Cloudinary Configuration (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Signing Secret (for signed URLs)
SIGNING_SECRET=your_strong_signing_secret

# Application Settings
NODE_ENV=production
```

### Vercel Configuration

1. In your Vercel project dashboard, go to Settings > Environment Variables
2. Add each of the required environment variables:
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `NEXTAUTH_SECRET` - A strong random secret
   - `NEXTAUTH_URL` - Your production URL
   - `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY` - Your Cloudinary API key
   - `CLOUDINARY_API_SECRET` - Your Cloudinary API secret
   - `SIGNING_SECRET` - A strong random secret for signed URLs
   - `NODE_ENV` - Set to "production"

### Render Configuration

1. In your Render dashboard, go to your web service settings
2. Under "Environment" section, add the same environment variables:
   - `MONGODB_URI`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `SIGNING_SECRET`
   - `NODE_ENV=production`

### MongoDB Atlas Hardening

1. **Enable TLS/SSL**:
   - In Atlas dashboard, go to your cluster
   - Navigate to "Network Access" > "IP Access List"
   - Add your Vercel and Render IP addresses to the whitelist
   - Ensure "TLS/SSL" is enabled (default for Atlas)

2. **Database User Privileges**:
   - Create a dedicated database user for the application
   - Grant only the required privileges (readWrite on your database)
   - Never use the Atlas admin user in your application

3. **IP Whitelisting**:
   - Add Vercel IPs to Atlas IP whitelist:
     - 140.82.112.0/20
     - 185.199.108.0/22
     - 192.30.252.0/22
   - Add Render IPs to Atlas IP whitelist:
     - Refer to Render documentation for current IP ranges

## HTTPS and TLS Configuration

### Vercel HTTPS

Vercel automatically provides HTTPS for all deployments. No additional configuration is required.

### Custom Domain TLS

1. In Vercel dashboard, go to your project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Vercel will automatically provision an SSL certificate

### MongoDB Atlas TLS

MongoDB Atlas requires TLS by default. Ensure your connection string includes:
```
mongodb+srv://username:password@cluster.mongodb.net/database?ssl=true&tlsAllowInvalidCertificates=false
```

## Authentication Security

### NextAuth Configuration

The application is configured with secure defaults:
- HttpOnly, Secure, SameSite cookies
- 15-minute session expiration
- Rate limiting for authentication attempts
- Strong password hashing with bcrypt

### Password Policy

The application enforces:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Account Lockout

After 5 failed login attempts:
- Account is locked for 15 minutes
- Further attempts will extend the lockout period exponentially

## File Upload Security

### Cloudinary Security

1. In Cloudinary dashboard:
   - Enable "Strict transformations"
   - Set up upload presets with restricted settings
   - Enable "Auto tagging" for content moderation

2. Application-level security:
   - File type validation (PDF, JPG, PNG only)
   - File size limits (5MB maximum)
   - Server-side virus scanning (integrate ClamAV in production)
   - Signed URLs for downloads with 1-hour expiration

## Logging and Monitoring

### Structured Logging

The application uses Pino for structured logging with:
- Automatic PII redaction
- Request correlation IDs
- Security event logging

### Log Shipping

Configure log shipping to your preferred provider:
- Papertrail
- LogDNA
- ELK Stack
- AWS CloudWatch

## Rate Limiting

### Redis Configuration (Production)

For production deployments, configure Redis for distributed rate limiting:

1. Set up a Redis instance (Redis Labs, AWS ElastiCache, etc.)
2. Add `REDIS_URL` to your environment variables
3. Update the rate limiter to use Redis instead of in-memory storage

## Backup and Recovery

### MongoDB Atlas Backups

1. In Atlas dashboard:
   - Enable "Cloud Backup" for your cluster
   - Configure snapshot frequency (hourly/daily/weekly)
   - Set retention policy (30 days recommended)

2. Test restore procedures regularly:
   - Document restore procedures
   - Schedule periodic restore tests
   - Verify data integrity after restores

## Incident Response

Refer to [incident-response.md](incident-response.md) for detailed incident response procedures.