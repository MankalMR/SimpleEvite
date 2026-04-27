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
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Beautiful Templates for Every Occasion
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Choose a design and start creating your perfect invitation in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          {occasions.map((occasion) => {
            const occasionTemplates = templates.filter(t => t.occasion === occasion);
            const featuredTemplate = occasionTemplates[0];
            
            return (
              <div key={occasion} className="group relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100">
                <div className="aspect-w-4 aspect-h-3 bg-gray-200 group-hover:opacity-75 transition-opacity relative h-64">
                  {featuredTemplate.image_url ? (
                    <Image
                      src={featuredTemplate.image_url}
                      alt={`${occasion} template`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No Image Available
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <h2 className="text-2xl font-bold text-white capitalize">
                      {occasionDisplayNames[occasion] || occasion}
                    </h2>
                    <p className="text-blue-100 text-sm">
                      {occasionTemplates.length} Templates Available
                    </p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                    Stunning {occasion} invitation designs ready for your next event.
                    Customizable text, colors, and easy RSVP tracking included.
                  </p>
                  <Link
                    href={`/templates/${occasion}`}
                    className="block w-full text-center bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Browse {occasionDisplayNames[occasion] || occasion} →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* SEO Content Section */}
        <div className="mt-20 prose prose-blue max-w-none border-t border-gray-200 pt-12">
          <h2 className="text-3xl font-bold text-gray-900">Why Use Our Digital Invitation Templates?</h2>
          <div className="grid md:grid-cols-2 gap-8 mt-8">
            <div>
              <h3 className="text-xl font-semibold">100% Free & Customizable</h3>
              <p className="text-gray-600">
                Unlike other invitation websites that hide their best designs behind a paywall, all of our 
                templates are completely free to use. Customize fonts, colors, and layout to match your theme.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Real-Time RSVP Tracking</h3>
              <p className="text-gray-600">
                Every template comes with built-in guest management. See who is coming, who isn&apos;t, and 
                get notified immediately when a guest responds.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Mobile Friendly Designs</h3>
              <p className="text-gray-600">
                Our invitations are designed to look amazing on any device. Your guests can RSVP from 
                their phones without ever needing to download an app.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">No Guest Accounts Needed</h3>
              <p className="text-gray-600">
                We respect your guests&apos; privacy. They can respond to your invitation with a single click, 
                making it the easiest experience for everyone involved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
