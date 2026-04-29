'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { 
  LayoutDashboard, 
  Mail, 
  Layout,
  HelpCircle, 
  LogOut, 
  Search, 
  Bell,
  Menu,
  X
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import Image from 'next/image';

const NAVIGATION = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Templates', href: '/designs', icon: Mail },
  { name: 'Templates', href: '/templates', icon: Layout },
];

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDemo = pathname?.startsWith('/demo');
  
  // Update links if in demo mode
  const navLinks = isDemo ? [
    { name: 'Dashboard', href: '/demo/dashboard', icon: LayoutDashboard },
  ] : NAVIGATION;

  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-card border-r border-border
        transform transition-transform duration-200 ease-in-out
        flex flex-col
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-border/40">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-1.5 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
              <Image src="/sEvite.png" alt="Logo" width={24} height={24} className="rounded-md" />
            </div>
            <span className="font-extrabold text-xl tracking-tighter text-foreground">Simple Evite</span>
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-2">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all
                  ${isActive 
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                `}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground/70'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Links */}
        <div className="p-4 space-y-2 border-t border-border/40">
          <Link href="/contact" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold tracking-tight text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
            <HelpCircle className="w-5 h-5 text-muted-foreground/70" />
            Help
          </Link>
          <button 
            onClick={() => isDemo ? window.location.href = '/' : signOut()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold tracking-tight text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
          >
            <LogOut className="w-5 h-5 text-muted-foreground/70" />
            {isDemo ? 'Exit Demo' : 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-border bg-card/50 backdrop-blur-sm z-30">
          <div className="flex items-center gap-4 flex-1">
            <button 
              className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            
            <Link 
              href={isDemo ? "/demo/create" : "/create"}
              className="hidden sm:flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all shadow-lg shadow-primary/20"
            >
              <span className="text-xl leading-none">+</span> New Invite
            </Link>

            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-border ml-2">
              {session?.user?.image ? (
                <Image src={session.user.image} alt="User" width={32} height={32} />
              ) : (
                <span className="text-sm font-medium text-primary">
                  {session?.user?.name?.[0] || 'U'}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
