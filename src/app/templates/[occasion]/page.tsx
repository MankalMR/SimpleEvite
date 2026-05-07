import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { supabaseDb } from '@/lib/database-supabase';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

interface PageProps {
  params: Promise<{
    occasion: string;
  }>;
}

const occasionDisplayNames: Record<string, string> = {
  birthday: 'Birthday',
  wedding: 'Wedding',
  housewarming: 'Housewarming',
  christmas: 'Christmas',
  'new-year': 'New Year',
  thanksgiving: 'Thanksgiving',
  diwali: 'Diwali',
  satyanarayan: 'Satyanarayan Puja',
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { occasion } = await params;
  const name = occasionDisplayNames[occasion] || occasion;
  
  return generateSEOMetadata({
    title: `Free ${name} Invitation Templates - Create & Track RSVPs`,
    description: `Browse beautiful, free ${name} invitation templates. Customize your design, share with guests, and track RSVPs in real-time. No account required for guests.`,
    keywords: [`${occasion} templates`, `${occasion} invitations`, `free ${occasion} evite`, `online ${occasion} invite`],
  });
}

export default async function OccasionTemplatesPage({ params }: PageProps) {
  const { occasion } = await params;
  const templates = await supabaseDb.getTemplates();
  const occasionTemplates = templates.filter(t => t.occasion === occasion);
  
  if (occasionTemplates.length === 0) {
    notFound();
  }

  const name = occasionDisplayNames[occasion] || occasion;

  return (
    <div className="py-4">
      <Breadcrumbs items={[
        { label: 'Templates', href: '/templates' },
        { label: name, href: `/templates/${occasion}` }
      ]} />
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tighter text-foreground mb-2">
          Free {name} Invitation Templates
        </h1>
        <p className="text-muted-foreground text-sm font-medium">
          Choose from our curated collection of {name} designs. 
          Send via text or email and track your RSVPs for free.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {occasionTemplates.map((template) => (
          <div 
            key={template.id} 
            className="group bg-card rounded-[var(--radius)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border-none overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(45,91,255,0.08)] hover:-translate-y-1"
          >
            <div className="w-full aspect-video bg-muted relative overflow-hidden">
              {template.image_url ? (
                <Image
                  src={template.image_url}
                  alt={template.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No Preview Available
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                <Link
                  href={`/create?template=${template.id}`}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-md text-xs font-bold uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                  Select Design
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-foreground tracking-tight truncate">{template.name}</h3>
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">
                  FREE
                </span>
              </div>
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">{template.theme} theme</p>
            </div>
          </div>
        ))}
      </div>

      {/* Informational Section for SEO */}
      <div className="mt-24 border-t border-border/40 pt-16 max-w-3xl mx-auto">
        <h2 className="text-3xl font-extrabold tracking-tighter text-foreground text-center mb-12">
          How to Create Your {name} Invitation
        </h2>
        <div className="space-y-10">
          <div className="flex gap-6">
            <div className="flex-shrink-0 w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-lg">1</div>
            <div>
              <h3 className="text-lg font-bold text-foreground tracking-tight mb-2">Choose your favorite {name} design</h3>
              <p className="text-muted-foreground text-sm font-medium leading-relaxed">Pick from our variety of themes and styles specifically curated for {name} celebrations.</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex-shrink-0 w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-lg">2</div>
            <div>
              <h3 className="text-lg font-bold text-foreground tracking-tight mb-2">Add your event details</h3>
              <p className="text-muted-foreground text-sm font-medium leading-relaxed">Enter your event name, date, time, and location. You can also add a personalized message for your guests.</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex-shrink-0 w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-lg">3</div>
            <div>
              <h3 className="text-lg font-bold text-foreground tracking-tight mb-2">Share and track RSVPs</h3>
              <p className="text-muted-foreground text-sm font-medium leading-relaxed">Send your invitation link via text or email. Your dashboard will update instantly as guests respond.</p>
            </div>
          </div>
        </div>
        
        <div className="mt-16 bg-muted/20 border border-border/40 p-10 rounded-[var(--radius)] text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          <p className="text-foreground text-lg font-medium italic leading-relaxed relative z-10">
            &quot;Simple Evite made my {name} planning so much easier. The RSVPs started coming in within minutes!&quot;
          </p>
          <p className="mt-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">— Happy User</p>
        </div>
      </div>
    </div>
  );
}
