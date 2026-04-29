'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './navbar';
import SidebarLayout from './SidebarLayout';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const isAppRoute = pathname?.startsWith('/dashboard') || pathname?.startsWith('/demo') || pathname?.startsWith('/designs') || pathname?.startsWith('/invitations') || pathname?.startsWith('/create') || pathname?.startsWith('/templates');

  if (isAppRoute) {
    return <SidebarLayout>{children}</SidebarLayout>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {children}
      </main>
    </>
  );
}
