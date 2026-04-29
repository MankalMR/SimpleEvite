import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import Image from 'next/image';
import HomeHeroActions from '@/components/home/HomeHeroActions';
import HomeRedirect from '@/components/home/HomeRedirect';
import { generateSoftwareSchema, generateWebSiteSchema } from '@/lib/seo';

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  const softwareSchema = generateSoftwareSchema();
  const websiteSchema = generateWebSiteSchema();

  return (
    <div className="min-h-screen">
      {/* Structured Data for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      {/* Client-side logic for redirection if needed */}
      <HomeRedirect />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-background via-muted/50 to-background py-32 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-10">
              <div className="p-4 bg-primary/5 rounded-3xl shadow-2xl shadow-primary/10">
                <Image
                  src="/sEvite.png"
                  alt="Simple Evite Logo"
                  width={100}
                  height={100}
                  className="rounded-2xl"
                  priority
                />
              </div>
            </div>
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tighter text-foreground mb-8">
              Beautiful & Free
              <span className="block text-primary">Digital Invitations</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
              Design stunning invites, track RSVPs in real-time, and manage your guests with ease. 
              The simplest online invitation maker for any occasion.
            </p>
            
            {/* Interactive Hero Actions */}
            <HomeHeroActions isAuthenticated={!!session} />

            {/* Additional Navigation Links */}
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
              <Link
                href="/demo/dashboard"
                className="hover:text-primary transition-colors"
              >
                Experience Demo
              </Link>
              <Link
                href="/features"
                className="hover:text-foreground transition-colors"
              >
                Features
              </Link>
              <Link
                href="/about"
                className="hover:text-foreground transition-colors"
              >
                Our Story
              </Link>
              <Link
                href="/contact"
                className="hover:text-foreground transition-colors"
              >
                Concierge
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-extrabold tracking-tighter text-foreground mb-4">
              Everything you need for perfect events
            </h2>
            <p className="text-lg text-muted-foreground font-medium">
              Simple, powerful tools to create and manage your invitations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary/10 group-hover:bg-primary/10 transition-colors">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-extrabold tracking-tighter text-foreground mb-3">Signature Designs</h3>
              <p className="text-muted-foreground font-medium leading-relaxed">
                Upload bespoke assets or utilize curated templates to create invitations that resonate.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary/10 group-hover:bg-primary/10 transition-colors">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-extrabold tracking-tighter text-foreground mb-3">Frictionless RSVP</h3>
              <p className="text-muted-foreground font-medium leading-relaxed">
                Elegant response workflows designed for guests. No accounts required, just pure interaction.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary/10 group-hover:bg-primary/10 transition-colors">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
              <h3 className="text-xl font-extrabold tracking-tighter text-foreground mb-3">Global Reach</h3>
              <p className="text-muted-foreground font-medium leading-relaxed">
                Seamless distribution via any medium. A single link to connect your entire guest list.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-foreground/10 via-transparent to-transparent opacity-50" />
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl font-extrabold tracking-tighter text-primary-foreground mb-6">
            Ready to create your first invitation?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-10 font-medium">
            Join thousands of users who trust Simple Evite for their events
          </p>
          
          <HomeHeroActions isAuthenticated={!!session} />
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="bg-card border-t border-border/40 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center">
              <div className="p-1.5 bg-primary/10 rounded-xl mr-3">
                <Image
                  src="/sEvite.png"
                  alt="Simple Evite Logo"
                  width={28}
                  height={28}
                  className="rounded-lg"
                />
              </div>
              <span className="text-foreground font-extrabold tracking-tighter text-lg">Simple Evite</span>
            </div>

            <div className="flex flex-wrap justify-center gap-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              <Link
                href="/features"
                className="hover:text-primary transition-colors"
              >
                Features
              </Link>
              <Link
                href="/about"
                className="hover:text-primary transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="hover:text-primary transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>

          <div className="border-t border-border/40 mt-12 pt-8 text-center">
            <p className="text-muted-foreground/40 text-[10px] font-bold uppercase tracking-widest">
              © 2024 Simple Evite. Elevated event experiences.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
