# Simple Evite - Minimalistic Event Invitation Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)](https://vercel.com/)

A modern, minimalistic event invitation platform built with Next.js, Supabase, and Google OAuth. Create beautiful custom invitations, track RSVPs, and manage your events with ease - no complex setup required!

## 🌟 Live Demo
[View Live Application](https://your-app-name.vercel.app) *(Update this after deployment)*

## 📸 Screenshots
![Dashboard](./docs/dashboard-screenshot.png) *(Add screenshots after deployment)*
![Invitation View](./docs/invitation-screenshot.png)

## Features

- **Google OAuth Authentication**: Secure login with Google accounts only
- **Custom Invitations**: Create personalized event invitations with custom designs
- **Design Management**: Upload, save, and reuse invitation designs
- **Public RSVP**: Share invitation links for easy RSVP without guest login required
- **RSVP Tracking**: Track Yes/No/Maybe responses with optional comments
- **Dashboard**: Manage all your invitations and view RSVP statistics
- **Responsive Design**: Works beautifully on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js with Google OAuth
- **File Storage**: Supabase Storage
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account
- A Google Cloud Console project for OAuth
- Vercel account (for deployment)

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Go to Settings > Database and run the SQL from `database-schema.sql`
   - **If you have existing tables**: First run `database-reset.sql` to clean up, then `database-schema.sql`
4. Go to Storage and create a bucket named "designs" (this should already exist from the SQL)

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
5. Set application type to "Web application"
6. Add authorized redirect URI: `http://localhost:3008/api/auth/callback/google`
7. For production, add: `https://yourdomain.com/api/auth/callback/google`
8. Save the Client ID and Client Secret

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# NextAuth
NEXTAUTH_URL=http://localhost:3008
NEXTAUTH_SECRET=your_nextauth_secret_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

Generate a secure NextAuth secret:
```bash
openssl rand -base64 32
```

### 4. Installation & Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3008](http://localhost:3008) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/         # NextAuth configuration
│   │   ├── invitations/  # Invitation CRUD
│   │   ├── designs/      # Design management
│   │   ├── rsvp/         # RSVP handling
│   │   ├── invite/       # Public invitation access
│   │   └── upload/       # File upload
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # User dashboard
│   ├── create/           # Invitation creation
│   ├── designs/          # Design management
│   ├── invitations/      # Invitation details
│   └── invite/           # Public invitation view
├── components/            # Reusable components
├── lib/                  # Utilities and configurations
└── types/                # TypeScript type definitions
```

## Key Components

### Authentication
- Google OAuth only (no password registration)
- Protected routes for invitation management
- Public access for RSVP

### Invitation Management
- Create invitations with custom designs
- Share via unique, unguessable links
- Edit and delete invitations
- View RSVP statistics

### Design System
- Upload custom images/designs
- Save and reuse designs
- Manage design library

### RSVP System
- Public RSVP without login
- Yes/No/Maybe responses
- Optional comments
- Real-time updates

## Database Schema

The application uses these main tables:

- `users` - User profiles from Google OAuth
- `designs` - Uploaded invitation designs
- `invitations` - Event invitations with details
- `rsvps` - RSVP responses from guests

See `database-schema.sql` for complete schema with RLS policies.

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel dashboard
4. Update Google OAuth redirect URI for production domain
5. Deploy!

### Environment Variables for Production

Make sure to update these for production:
- `NEXTAUTH_URL` to your production domain
- Add production domain to Google OAuth authorized origins
- Use production Supabase project if desired

## Usage

### For Event Organizers

1. Sign in with Google
2. Create a new invitation with event details
3. Upload or select a design (optional)
4. Share the generated invitation link
5. Monitor RSVPs on your dashboard

### For Guests

1. Click invitation link (no login required)
2. View event details and design
3. RSVP with name and response
4. Add optional comment
5. See who else is attending

## MVP Limitations

This is a minimal viable product with focused scope:

- **No email/SMS sending** - Share links manually
- **No calendar integration** - Manual date management
- **No payment features** - Free events only
- **No advanced analytics** - Basic RSVP statistics only
- **No email notifications** - Manual follow-up required

## Future Enhancements

Potential features for future versions:

- Email invitation sending
- Calendar integration (Google/Outlook)
- Event reminders
- Advanced analytics
- Premium design templates
- Multi-language support
- Mobile app

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Mmankal**
- GitHub: [@mmankal](https://github.com/mmankal) *(Update with your actual GitHub username)*
- Email: your.email@example.com *(Update with your email)*

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/mmankal/simple-evite/issues).

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

- Create an [Issue](https://github.com/mmankal/simple-evite/issues) for bug reports or feature requests
- ⭐ Star this repository if you find it helpful!

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Supabase](https://supabase.com/) for the backend-as-a-service platform
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Vercel](https://vercel.com/) for seamless deployment

---

<div align="center">

**Built with ❤️ using Next.js, Supabase, and modern web technologies**

[⬆ Back to Top](#simple-evite---minimalistic-event-invitation-platform)

</div>