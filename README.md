# Digital E-Gram Panchayat

A full-stack web application for village-level citizen services (apply, track, approve services) with role-based dashboards.

## 🛠 Tech Overview

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: MongoDB (Atlas / Render)
- **Auth**: NextAuth.js (JWT credentials provider) + bcrypt password hashing
- **Logging**: Pino
- **Testing**: Jest + React Testing Library + Playwright (E2E)

## 📦 Dependencies

All dependencies are listed in [package.json](package.json)

## ⚙️ Working Features

### 👤 Citizens
- Register / Login
- Search services
- Apply for a service (with form data)
- Track application status
- **Download approved applications as PDF/JPEG documents**
- Manage profile

### 👨‍💼 Staff
- Login
- View assigned applications
- Update application status (in progress → approved/rejected)

### 🏛 Officer
- Login
- Create / Update / Delete services
- Approve / Reject applications
- Track all user applications
- Maintain audit logs

### 🔐 Cross-Cutting
- Role-based access control (Citizens / Staff / Officer)
- Input validation (Zod)
- Logging every action (stored in logs collection + console)
- Secure password storage (bcrypt)
- **Free document generation (PDF/JPEG) for approved applications**

## 📋 Requirements Before Starting

- Node.js (v18+) installed
- npm / pnpm package manager
- MongoDB Atlas account (or local MongoDB server)
- Vercel account (for frontend deployment)
- Render account (for backend deployment)

## 🚀 Getting Started (Local Dev)

1. **Clone repo**
   ```bash
   git clone https://github.com/yourusername/digital-egram.git
   cd digital-egram
   ```

2. **Install deps**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   Create a `.env.local` file with:
   ```
   MONGODB_URI="your-mongodb-connection-string"
   NEXTAUTH_SECRET="your-random-secret"
   NEXTAUTH_URL="https://digital-e-gram-panchayat-ao60.onrender.com"
   ```

4. **Setup Tailwind**
   ```bash
   npx tailwindcss init -p
   ```

5. **Run dev**
   ```bash
   npm run dev
   ```

Visit 👉 https://digital-e-gram-panchayat-ao60.onrender.com

## 🚀 Deployment

### Vercel Deployment (Frontend)

1. **Prepare Environment Variables**
   Create a `.env.production` file with your production values:
   ```
   MONGODB_URI=your_production_mongodb_uri_here
   NEXTAUTH_SECRET=your_production_nextauth_secret_here
   NEXTAUTH_URL=https://digital-e-gram-panchayat-chi.vercel.app
   CLOUDINARY_CLOUD_NAME=your_production_cloudinary_cloud_name_here
   CLOUDINARY_API_KEY=your_production_cloudinary_api_key_here
   CLOUDINARY_API_SECRET=your_production_cloudinary_api_secret_here
   ```

2. **Deploy to Vercel**
   - Push your code to GitHub
   - Connect your repository to Vercel
   - Set the environment variables in Vercel dashboard
   - Deploy!

### Render Deployment (Backend)

Since this is a monolithic Next.js application, the backend API routes are part of the frontend application. You can deploy the entire application to Render:

1. **Using render.yaml**
   The project includes a [render.yaml](render.yaml) file for easy deployment:
   ```yaml
   services:
     - type: web
       name: digital-e-panchayat
       env: node
       plan: free
       buildCommand: npm run build
       startCommand: npm start
   ```

2. **Deploy to Render**
   - Push your code to GitHub
   - Connect your repository to Render
   - Render will automatically detect the render.yaml file
   - Set the environment variables in Render dashboard
   - Deploy!

## 🧪 Testing

- **Run unit + integration tests**
  ```bash
  npm run test
  ```

- **Run end-to-end tests**
  ```bash
  npm run test:e2e
  ```

## 📖 Project Flow

- `src/models/` → Mongoose schemas (User, Service, Application, Logs)
- `src/app/api/` → API routes (auth, services, applications)
- `src/app/` → Pages (public services, user dashboard, officer dashboard)
- `src/components/` → UI building blocks (forms, tables, modals)
- `src/lib/` → DB connection + auth helpers + document generation
- `tests/` → Jest + Playwright test cases

## 🗄 Database Structure

1. **Users Collection**
   - name, email, password (hashed), role

2. **Services Collection**
   - name, description, requirements, processingTime, isActive, createdBy

3. **Applications Collection**
   - service, applicant, status, formData, assignedTo, remarks, submittedAt, processedAt

4. **Logs Collection**
   - action, performedBy, targetType, targetId, details, ipAddress, userAgent

5. **DownloadHistory Collection**
   - application, user, service, downloadType, fileType, status

## 📄 Document Generation

The system now supports generating professional documents from approved applications:

- **Formats**: PDF and JPEG
- **Cost**: Completely free (₹0)
- **Processing**: Instant generation
- **Naming**: `GramPanchayat_Record_[UserName].[pdf|jpg]`
- **Content**: Includes all application data in a well-formatted layout

For more details, see [DOCUMENT_GENERATION.md](DOCUMENT_GENERATION.md)

## Login Credentials

For security reasons, test credentials have been removed from this document. To set up test accounts:

1. Run the initialization script:
   ```bash
   npm run init-db
   ```

2. Or manually create test accounts through the registration page.

**Important**: When logging in, make sure to select the correct role from the dropdown menu. The authentication system requires an exact match of email, password, AND role.

Note: These credentials are set up by the `initializeRequiredAccounts.ts` script and are the only authorized accounts for the application.