# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-19

### Added
- Initial release of Simple Evite
- Google OAuth authentication with NextAuth.js
- Event invitation creation with custom designs
- Image upload and design management system
- Public invitation view with RSVP functionality
- User dashboard for managing invitations and designs
- Responsive design with TailwindCSS
- Supabase integration for database and file storage
- Real-time RSVP tracking and guest management
- Share invitation via unique links
- Support for event details (date, time, location, description)
- Design template reuse functionality
- Mobile-friendly interface
- Dark mode support for invitation backgrounds
- Form validation and error handling
- MIT License
- Comprehensive documentation
- Deployment guides for Vercel, Netlify, and Docker

### Features
- **Authentication**: Secure Google OAuth-only login
- **Invitations**: Create, edit, delete, and share event invitations
- **Designs**: Upload, manage, and reuse custom invitation backgrounds
- **RSVP System**: Public RSVP with Yes/No/Maybe responses and comments
- **Dashboard**: Centralized management of all invitations and designs
- **File Storage**: Secure image upload with Supabase Storage
- **Responsive UI**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Live RSVP statistics and guest lists

### Technical Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: TailwindCSS 4
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js with Google OAuth
- **File Storage**: Supabase Storage
- **Deployment**: Vercel-ready

### Security
- Row Level Security (RLS) policies for data protection
- Secure file upload with validation
- Authentication-protected routes
- CORS configuration for external resources
- Environment variable protection

---

## Future Releases

### Planned Features
- Email invitation sending
- Calendar integration (Google/Outlook)
- Event reminders and notifications
- Advanced analytics and reporting
- Premium design templates
- Multi-language support
- Mobile app (React Native)
- Webhook integrations
- Custom domains for invitations

---

For more details about each release, see the [GitHub Releases](https://github.com/mmankal/simple-evite/releases) page.
