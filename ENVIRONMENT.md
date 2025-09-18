# Environment Variables Guide

This document lists all environment variables used in Simple Evite and ensures no secrets are hardcoded.

## 🔐 Required Environment Variables

### Supabase Configuration
```env
# Your Supabase project URL (Public)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Supabase anonymous key (Public - safe for client-side)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Supabase service role key (SECRET - server-side only)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### NextAuth Configuration
```env
# Your application URL
# Development: http://localhost:3008
# Production: https://your-app.vercel.app
NEXTAUTH_URL=http://localhost:3008

# NextAuth secret key (SECRET - generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### Google OAuth Configuration
```env
# Google OAuth client ID (can be public)
GOOGLE_CLIENT_ID=your_google_client_id_here

# Google OAuth client secret (SECRET)
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

## ✅ Security Audit Checklist

### Environment Variables Status
- [x] All secrets read from `process.env`
- [x] No hardcoded API keys in source code
- [x] No hardcoded URLs in source code
- [x] Supabase hostname dynamically extracted from `NEXT_PUBLIC_SUPABASE_URL`
- [x] All environment files in `.gitignore`
- [x] Example environment file provided
- [x] Production environment variables documented

### Files That Read Environment Variables
1. **`src/lib/supabase.ts`**
   - ✅ `NEXT_PUBLIC_SUPABASE_URL`
   - ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - ✅ `SUPABASE_SERVICE_ROLE_KEY`

2. **`src/lib/auth.ts`**
   - ✅ `GOOGLE_CLIENT_ID`
   - ✅ `GOOGLE_CLIENT_SECRET`

3. **`next.config.ts`**
   - ✅ `NEXT_PUBLIC_SUPABASE_URL` (for image hostname)

### Protected Files (in .gitignore)
- ✅ `.env`
- ✅ `.env.local`
- ✅ `.env*.local`
- ✅ `.vercel` (may contain secrets)
- ✅ `*.pem` (SSL certificates)

## 🚀 Setup Instructions

### 1. Development Setup
```bash
# Copy the example file
cp .env.local.example .env.local

# Edit with your actual values
nano .env.local
```

### 2. Production Setup
Add environment variables in your hosting platform:
- **Vercel**: Project Settings > Environment Variables
- **Netlify**: Site Settings > Environment Variables
- **Railway**: Variables tab

### 3. Generating Secrets
```bash
# Generate NextAuth secret
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 🔍 Validation

### Check for Hardcoded Secrets
```bash
# Search for potential hardcoded secrets
grep -r "sk_" src/           # Stripe keys
grep -r "pk_" src/           # Public keys
grep -r "https://" src/      # Hardcoded URLs
grep -r "secret" src/        # Secret strings
```

### Verify Environment Loading
```bash
# Check if environment variables are loaded
npm run dev
# Look for console warnings about missing variables
```

## 🚨 Never Commit These
- API keys
- Database passwords
- OAuth secrets
- JWT secrets
- SSL certificates
- Private keys
- Database connection strings
- Third-party service tokens

## 📝 Notes
- Public variables (`NEXT_PUBLIC_*`) are safe to expose to clients
- Secret variables should only be used server-side
- Always use environment variables for configuration
- Test with different environment setups before deployment

---

**Security First**: If you accidentally commit secrets, immediately revoke them and generate new ones.
