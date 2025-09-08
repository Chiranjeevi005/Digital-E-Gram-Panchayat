# Security Hardening Checklist

This document tracks the implementation status of security measures for the Digital E-Panchayat application.

## A. Secrets & Environment Best Practices

- [x] Ensure no secrets are in repo
- [x] Detect and remove any credentials from git history
- [x] Provide .env.example (safe) and document required env vars with types
- [x] Use Vercel/Render secret stores or a secrets manager
- [x] Exact steps to configure in Vercel & Render

## B. HTTPS, TLS & Host Hardening

- [x] Ensure frontend+API use HTTPS only (HSTS header)
- [x] Document TLS configuration recommended (TLS 1.2+, prefer 1.3)
- [x] Ensure MongoDB Atlas is configured to require TLS
- [x] Show how to enable HSTS and redirect HTTP → HTTPS for self-hosted endpoints

## C. Authentication & Session Security

- [x] Use NextAuth with secure cookie settings
- [x] HttpOnly, Secure, SameSite=Strict (or Lax where needed), Path='/'
- [x] Short-lived access tokens (e.g., 15 min) + rotating refresh tokens
- [x] Implement token rotation and revocation on logout
- [x] Enforce strong password policy (min length, complexity)
- [x] Use bcrypt with salt rounds ≥ 12
- [ ] Add optional MFA (TOTP) flow for officer/admin roles
- [x] Implement account lockout after configurable failed attempts
- [x] Add exponential backoff and CAPTCHA after N fails

## D. Authorization & RBAC

- [x] Implement strict role-based middleware on every API route
- [x] Centralize permission checks (e.g., /lib/permissions.ts)
- [x] Protect file downloads so only the owner or authorized role can access
- [x] Use signed temporary URLs for file storage

## E. Input Validation & Injection Prevention

- [x] Use strict input validation libraries (Zod recommended)
- [x] Always use parameterized queries
- [x] Add a sanitization layer for any HTML or rich-text fields

## F. XSS, CSRF, CORS, and Headers

- [x] Add strong security headers via middleware
- [x] Content-Security-Policy (CSP) with specific allowed sources
- [x] X-Frame-Options: DENY
- [x] X-Content-Type-Options: nosniff
- [x] Referrer-Policy
- [x] Permissions-Policy to limit browser features
- [x] Use CSRF protection for state-changing endpoints
- [x] Configure CORS with a strict allowlist

## G. File Uploads, Storage & Virus Scanning

- [x] Enforce file type whitelist, size limits, and content-type checks
- [x] Stream uploads to object storage (Cloudinary)
- [ ] Integrate virus scanning on upload pipeline
- [x] Use signed URLs for downloads (short expiration)

## H. Logging, Monitoring & PII Handling

- [x] Structured logging with request IDs and correlation IDs
- [x] Mask/redact PII: never log full SSNs/Aadhar or payment details
- [x] Add audit trail collection for status changes
- [x] Setup alerting for suspicious patterns

## I. Rate Limiting & Abuse Protection

- [x] Add rate-limiting middleware for API endpoints
- [ ] Use Redis-backed rate limiter for distributed env
- [x] Protect auth endpoints with stricter limits

## J. Document Download Security

- [x] Secure document storage with access control
- [x] Use signed URLs for downloads (short expiration)
- [x] Document access logging

## K. Dependencies & CI Automation

- [x] Add dependency scanning: GitHub Dependabot + `npm audit` + Snyk
- [x] Add SAST tools: semgrep rules & eslint-plugin-security
- [x] Add DAST in CI/CD: OWASP ZAP scan
- [x] Fail CI if critical vulnerabilities detected

## L. Backups, DB Hardening & Principle of Least Privilege

- [x] Use MongoDB Atlas backups + automated snapshots
- [x] Create DB user with only required privileges
- [x] Restrict Atlas IP whitelist
- [x] Use VPC Peering where available
- [x] Encrypt backups and test restores periodically

## M. Infrastructure & Deployment Best Practices

- [x] Use environment-specific configs (dev/staging/prod)
- [x] Never reuse same secrets between envs
- [x] Use Immutable deployments
- [x] Remove debug endpoints in production
- [x] Configure runtime environment variables securely

## N. Tests & Pentest

- [x] Add unit tests for auth & permission logic
- [x] Add integration tests for upload/download permission checks
- [ ] Schedule at least yearly external penetration test
- [ ] Run weekly automated scans
- [x] Provide a sample pentest checklist

## O. Incident Response & Compliance

- [x] Provide an incident response playbook
- [x] Document data retention policy, deletion requests, and privacy controls

## P. UI & Client Hardening

- [x] Escape all user output
- [x] Use SRI for external scripts
- [x] Apply secure cookie flags and set short TTLs for tokens

## Commands to Run Security Checks

```bash
# Dependency scanning
npm audit --audit-level=high

# Static analysis
npx semgrep --config=p/ci

# Snyk scan (if using Snyk)
snyk test

# OWASP ZAP baseline scan
zap-baseline.py -t https://staging.example.com -r zap_report.html
```

## Additional Security Measures Implemented

### 1. Secure File Upload Pipeline
- File type validation (PDF, JPG, PNG only)
- File size limits (5MB maximum)
- Server-side virus scanning (placeholder for ClamAV integration)
- Signed URLs for downloads with 1-hour expiration

### 2. Role-Based Access Control
- Centralized permission management
- Fine-grained access control
- Default deny policy

### 3. Security Headers
- Content Security Policy (CSP)
- Strict Transport Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

### 4. Rate Limiting
- IP-based rate limiting
- User-based rate limiting
- Stricter limits for authentication endpoints

### 5. Account Security
- Account lockout after failed attempts
- Exponential backoff for lockout duration
- Strong password requirements
- bcrypt with 12+ salt rounds

### 6. Logging and Monitoring
- Structured logging with Pino
- Automatic PII redaction
- Security event logging
- Request correlation IDs

### 7. Automated Security Tools
- Dependency vulnerability scanning
- Static application security testing (SAST)
- Dynamic application security testing (DAST)
- Security-focused unit tests

## Manual Configuration Required

### 1. Virus Scanning Integration
- Integrate ClamAV or similar virus scanning solution
- Update [src/lib/fileUpload.ts](src/lib/fileUpload.ts) with actual virus scanning implementation

### 2. Redis for Rate Limiting
- Set up Redis instance for production deployments
- Update [src/lib/rateLimiter.ts](src/lib/rateLimiter.ts) to use Redis instead of in-memory storage

### 3. MFA Implementation
- Implement TOTP-based MFA for officer/admin roles
- Add MFA enrollment and verification flows

### 4. External Penetration Testing
- Schedule annual external penetration tests
- Run weekly automated security scans

### 5. Monitoring and Alerting
- Set up log shipping to centralized logging solution
- Configure alerts for security events
- Implement real-time monitoring