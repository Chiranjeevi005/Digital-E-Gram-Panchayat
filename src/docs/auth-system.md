# Authentication System Documentation

## Overview

This document explains the rebuilt authentication system for the Digital E-Panchayat application. The system uses NextAuth.js for authentication with support for credentials-based authentication.

## Architecture

The authentication system is built with the following components:

1. **NextAuth Configuration** (`src/lib/auth.ts`) - Core authentication configuration
2. **NextAuth Route Handler** (`src/app/api/auth/[...nextauth]/route.ts`) - API route for authentication
3. **Authentication Helpers** (`src/lib/auth.ts`) - Utility functions for authentication checks
4. **Middleware** (`src/lib/middleware.ts`) - Route protection based on user roles
5. **UI Components** - Sign-in and registration pages

## Providers

### Credentials Provider
- Allows users to sign in with email, password, and role
- Supports three roles: citizen, staff, officer
- Validates credentials against the database
- Checks for account deactivation

## Role-Based Access Control

The system implements role-based access control with the following hierarchy:
- Officer (highest privileges)
- Staff 
- Citizen (lowest privileges)

## Environment Variables

The following environment variables are required:

```
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://digital-e-gram-panchayat-ao60.onrender.com
```

## Testing

To test the authentication system:

1. Start the development server: `npm run dev`
2. Visit https://digital-e-gram-panchayat-ao60.onrender.com/auth/signin
3. Test credentials authentication with:
   - Email: test@example.com
   - Password: TestPass123!
   - Role: citizen

## API Routes

- `/api/auth/[...nextauth]` - NextAuth API routes
- `/api/test-auth` - Test authentication status

## Pages

- `/auth/signin` - Sign in page
- `/auth/register` - Registration page
- `/test-auth` - Test authentication status
- `/test-api-auth` - Test API authentication

## Security Considerations

1. Passwords are hashed using bcrypt
2. Session tokens are JWT-based
3. Rate limiting is implemented for failed login attempts
4. Account deactivation is checked during authentication