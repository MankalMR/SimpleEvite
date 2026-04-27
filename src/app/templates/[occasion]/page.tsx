import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { supabaseDb } from '@/lib/database-supabase';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';

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
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <Link href="/templates" className="text-blue-200 hover:text-white mb-4 inline-block">
            ← Back to All Occasions
          </Link>
          <h1 className="text-4xl font-extrabold sm:text-5xl mb-4">
            Free {name} Invitation Templates
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Choose from our curated collection of {name} designs. 
            Send via text or email and track your RSVPs for free.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          {occasionTemplates.map((template) => (
            <div key={template.id} className="group flex flex-col">
              <div className="aspect-w-4 aspect-h-5 bg-gray-200 rounded-2xl overflow-hidden relative h-80 shadow-sm group-hover:shadow-md transition-shadow">
                {template.image_url ? (
                  <Image
                    src={template.image_url}
                    alt={template.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No Preview Available
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/create?template=${template.id}`}
                    className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform"
                  >
                    Select Design
                  </Link>
                </div>
              </div>
              <div className="mt-4 flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{template.name}</h3>
                  <p className="text-sm text-gray-500">{template.theme} theme</p>
                </div>
                <div className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">
                  FREE
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Informational Section for SEO */}
        <div className="mt-24 border-t border-gray-100 pt-16 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            How to Create Your {name} Invitation
          </h2>
          <div className="space-y-8 text-left">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">1</div>
              <div>
                <h3 className="text-lg font-semibold">Choose your favorite {name} design</h3>
                <p className="text-gray-600">Pick from our variety of themes and styles specifically curated for {name} celebrations.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">2</div>
              <div>
                <h3 className="text-lg font-semibold">Add your event details</h3>
                <p className="text-gray-600">Enter your event name, date, time, and location. You can also add a personalized message for your guests.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">3</div>
              <div>
                <h3 className="text-lg font-semibold">Share and track RSVPs</h3>
                <p className="text-gray-600">Send your invitation link via text or email. Your dashboard will update instantly as guests respond.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 bg-gray-50 p-8 rounded-2xl">
            <p className="text-gray-700 font-medium italic">
              &quot;Simple Evite made my {name} planning so much easier. The RSVPs started coming in within minutes!&quot;
            </p>
            <p className="mt-4 text-sm text-gray-500 font-semibold">— Happy User</p>
          </div>
        </div>
      </div>
    </div>
  );
}
