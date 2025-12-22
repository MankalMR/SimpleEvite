# Building and Running the Project

## Prerequisites
- **Node.js**: Version 20+
- **npm**: Version 10+
- **Supabase Account**: For database and storage.
- **Resend Account**: For transactional emails.

## Environment Setup
Create a `.env.local` file with the following keys:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (Critical for Guest Logic)
- `RESEND_API_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (e.g., http://localhost:3008)

## Installation
```bash
npm install
```

## Local Development
The project is configured to run on port **3008** to avoid conflicts with other local projects.

```bash
npm run dev
# Access at http://localhost:3008
```

## Production Build
```bash
npm run build
npm start
```
