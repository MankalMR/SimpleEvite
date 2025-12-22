# Service Architecture

## Overview
Simple Evite operates as a **Next.js Monolith** hosted on Vercel, utilizing a **Service-Based Architecture** internally to separate concerns between the UI, Logic/Validation, and Persistence layers.

## Component Breakdown

### 1. Frontend Subsystem
- **Location**: `src/app` (App Router), `src/components`.
- **Role**: Renders the UI and manages local state.
- **Key Characteristic**: "Thick Client" for interactivity, but "Thin" for data logic (delegates to BFF).
- **Authentication**: Uses `NextAuth` (Creators) or Token-based flows (Guests).

### 2. Backend-for-Frontend (BFF)
- **Location**: `src/app/api`.
- **Role**: Secure Gatekeeper.
- **Responsibility**: 
  - Validates Sessions (`getServerSession`).
  - Validates Tokens (`share_token`).
  - Calls `src/lib` services.
  - Returns JSON responses to the frontend.

### 3. Service Layer (`src/lib`)
- **Persistence Service**: `database-supabase.ts` (Repository Pattern).
- **Email Service**: `email-service.ts` (Resend Wrapper).
- **Security Service**: `security.ts` (Validation & Sanitization).

### 4. External Infrastructure
- **Supabase**: PostgreSQL Database & Object Storage.
- **Resend**: Transactional Email API.
- **Google OAuth**: Identity Provider.
