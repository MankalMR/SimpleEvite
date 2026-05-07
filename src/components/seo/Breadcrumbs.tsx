import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { getBaseUrl } from '@/lib/url-utils';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const baseUrl = getBaseUrl();
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: item.label,
        item: item.href.startsWith('http') ? item.href : `${baseUrl}${item.href}`,
      })),
    ],
  };

  return (
    <nav className="flex mb-6 overflow-x-auto no-scrollbar py-1" aria-label="Breadcrumb">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ol className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 whitespace-nowrap">
        <li>
          <Link href="/" className="hover:text-primary transition-colors flex items-center">
            <Home className="w-3 h-3 mr-1" />
            Home
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center space-x-2">
            <ChevronRight className="w-3 h-3 text-muted-foreground/30" />
            {index === items.length - 1 ? (
              <span className="text-foreground tracking-tighter" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link href={item.href} className="hover:text-primary transition-colors">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
