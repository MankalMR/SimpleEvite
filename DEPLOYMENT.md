# Deployment Guide

This guide will help you deploy Simple Evite to various platforms.

## 🚀 Quick Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mmankal/simple-evite)

### Step-by-Step Vercel Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "Import Project"
   - Select your repository

3. **Configure Environment Variables**
   Add these in Vercel dashboard:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your_production_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. **Update Google OAuth Settings**
   - Go to Google Cloud Console
   - Add your Vercel domain to authorized origins
   - Add callback URL: `https://your-app.vercel.app/api/auth/callback/google`

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app is live! 🎉

## 🌐 Other Deployment Options

### Netlify
1. Connect your GitHub repository
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add environment variables
5. Deploy

### Railway
1. Connect GitHub repository
2. Add environment variables
3. Railway will auto-deploy

### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3008

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t simple-evite .
docker run -p 3008:3008 simple-evite
```

## 🔧 Post-Deployment Checklist

- [ ] Test Google OAuth login
- [ ] Verify file upload functionality
- [ ] Test invitation creation and sharing
- [ ] Check RSVP functionality
- [ ] Test responsive design on mobile
- [ ] Update README with live demo link
- [ ] Set up monitoring/analytics (optional)

## 🔒 Security Considerations

- Use strong `NEXTAUTH_SECRET` in production
- Enable CORS properly in Supabase
- Review Supabase RLS policies
- Monitor usage and set appropriate limits
- Enable HTTPS (automatic on Vercel)

## 📊 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `NEXTAUTH_URL` | Yes | Your app's URL |
| `NEXTAUTH_SECRET` | Yes | NextAuth secret key |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |

## 🆘 Troubleshooting

### Build Errors
- Check all environment variables are set
- Verify TypeScript types are correct
- Ensure all dependencies are installed

### Authentication Issues
- Verify Google OAuth URLs are correct
- Check NEXTAUTH_URL matches deployment URL
- Ensure NEXTAUTH_SECRET is set

### Database Connection
- Verify Supabase credentials
- Check RLS policies are active
- Ensure database schema is up to date

### Image Upload Issues
- Verify Supabase Storage bucket exists
- Check storage policies
- Ensure proper CORS settings

Need help? [Create an issue](https://github.com/mmankal/simple-evite/issues) 🤝
