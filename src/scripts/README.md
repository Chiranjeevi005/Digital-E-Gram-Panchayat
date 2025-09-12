# Scripts Directory

This directory contains essential scripts for initializing, checking, and maintaining the Digital E-Panchayat application.

## Initialization Scripts

- **initializeAccounts.ts** - Creates default user accounts with proper role limits (Citizens, Staff, Officer)
- **initializeRequiredAccounts.ts** - Creates predefined officer and staff accounts with specific credentials
- **initializeServices.ts** - Sets up required services in the database

## Checking/Verification Scripts

- **checkAccounts.ts** - Verifies specific account types (admin, staff, citizen)
- **checkApplications.ts** - Lists applications and users in the database
- **checkUsers.ts** - Simple listing of all users
- **list-applications.js** - Lists applications with populated data
- **list-services.js** - Lists all services
- **list-users.js** - Lists all users
- **test-db-connection.ts** - Tests database connection

## Maintenance Scripts

- **cleanupDuplicateAccounts.ts** - Removes duplicate accounts from the database
- **deleteAllUsers.ts** - Deletes all users and applications (use with caution)

## Usage

Run any script using:
```bash
npm run script <script-name>
```

For example:
```bash
npm run script initializeAccounts.ts
```