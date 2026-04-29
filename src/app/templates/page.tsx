import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { supabaseDb } from '@/lib/database-supabase';
import { generateMetadata } from '@/lib/seo';

export const metadata: Metadata = generateMetadata({
  title: 'Free Event Invitation Templates',
  description: 'Browse our collection of beautiful, free digital invitation templates. Perfect for birthdays, weddings, housewarmings, and more. Easy to customize and share.',
  keywords: ['invitation templates', 'free evites', 'birthday templates', 'wedding invitations', 'party templates'],
});

export default async function TemplatesPage() {
  const templates = await supabaseDb.getTemplates();
  
  // Group templates by occasion
  const occasions = Array.from(new Set(templates.map(t => t.occasion)));
  
  const occasionDisplayNames: Record<string, string> = {
    birthday: 'Birthdays',
    wedding: 'Weddings',
    housewarming: 'Housewarmings',
    christmas: 'Christmas',
    'new-year': 'New Year',
    thanksgiving: 'Thanksgiving',
    diwali: 'Diwali',
    satyanarayan: 'Satyanarayan Puja',
  };

  return (
    <div className="py-4">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tighter text-foreground mb-2">
          Browse Templates
        </h1>
        <p className="text-muted-foreground text-sm font-medium">
          Choose a design and start creating your perfect invitation in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {occasions.map((occasion) => {
          const occasionTemplates = templates.filter(t => t.occasion === occasion);
          const featuredTemplate = occasionTemplates[0];
          
          return (
            <div 
              key={occasion} 
              className="group bg-card rounded-[var(--radius)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border-none overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(45,91,255,0.08)] hover:-translate-y-1"
            >
              <div className="aspect-video bg-muted relative">
                {featuredTemplate.image_url ? (
                  <Image
                    src={featuredTemplate.image_url}
                    alt={`${occasion} template`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No Image Available
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h2 className="text-xl font-bold text-white capitalize tracking-tight">
                    {occasionDisplayNames[occasion] || occasion}
                  </h2>
                  <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest">
                    {occasionTemplates.length} Templates Available
                  </p>
                </div>
              </div>
              <div className="p-6">
                <p className="text-muted-foreground text-xs font-medium mb-6 line-clamp-2 leading-relaxed">
                  Stunning {occasion} invitation designs ready for your next event.
                  Customizable text, colors, and easy RSVP tracking included.
                </p>
                <Link
                  href={`/templates/${occasion}`}
                  className="block w-full text-center bg-primary text-primary-foreground py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/10"
                >
                  Browse {occasionDisplayNames[occasion] || occasion}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* SEO Content Section */}
      <div className="mt-20 border-t border-border/40 pt-12">
        <h2 className="text-2xl font-extrabold tracking-tighter text-foreground mb-8">Why Use Our Digital Invitation Templates?</h2>
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-3">100% Free & Customizable</h3>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed">
              Unlike other invitation websites that hide their best designs behind a paywall, all of our 
              templates are completely free to use. Customize fonts, colors, and layout to match your theme.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-3">Real-Time RSVP Tracking</h3>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed">
              Every template comes with built-in guest management. See who is coming, who isn&apos;t, and 
              get notified immediately when a guest responds.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-3">Mobile Friendly Designs</h3>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed">
              Our invitations are designed to look amazing on any device. Your guests can RSVP from 
              their phones without ever needing to download an app.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-3">No Guest Accounts Needed</h3>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed">
              We respect your guests&apos; privacy. They can respond to your invitation with a single click, 
              making it the easiest experience for everyone involved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
