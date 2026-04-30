'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProtectedRoute } from '@/components/protected-route';
import { formatShortDate, isDateInPast } from '@/lib/date-utils';
import { getRSVPStats, getTotalRSVPCount, getGlobalRSVPStats } from '@/lib/rsvp-utils';
import { useInvitations } from '@/hooks/useInvitations';
import { getInvitationImageUrl, hasInvitationDesign } from '@/lib/invitation-utils';
import { InlineError } from '@/components/inline-error';
import { Mail, Users, CalendarDays } from 'lucide-react';
import { ShareLinkGroup } from '@/components/share-link-group';

export default function Dashboard() {
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    invitations,
    loading,
    error,
    fetchInvitations,
  } = useInvitations();

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);



  // Global stats across all invitations
  const stats = useMemo(() => {
    const now = new Date();
    return {
      globalStats: getGlobalRSVPStats(invitations),
      totalInvitations: invitations.length,
      totalRSVPs: getTotalRSVPCount(invitations),
      activeEventsCount: invitations.filter(inv => new Date(inv.event_date) >= now).length
    };
  }, [invitations]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted/50 rounded w-1/4 mb-8"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card rounded-[var(--radius)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border-none p-6">
                  <div className="h-6 bg-muted/50 rounded mb-4"></div>
                  <div className="h-4 bg-muted/50 rounded mb-2"></div>
                  <div className="h-4 bg-muted/50 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="py-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-extrabold tracking-tighter text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground text-sm font-medium">Elevated event management and guest list tracking.</p>
          </div>

          <InlineError error={error} />
          <InlineError error={actionError} onDismiss={() => setActionError(null)} />

          <div className="mb-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-muted/50 p-6 rounded-[var(--radius)] border-none">
                <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center mb-4">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Total Designs</h3>
                <p className="text-4xl font-extrabold text-foreground tracking-tight">{stats.totalInvitations}</p>
              </div>
              <div className="bg-muted/50 p-6 rounded-[var(--radius)] border-none">
                <div className="w-10 h-10 bg-green-500/10 rounded-md flex items-center justify-center mb-4">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Total Attending</h3>
                <p className="text-4xl font-extrabold text-foreground tracking-tight">{stats.globalStats.attendingCount}</p>
              </div>
              <div className="bg-muted/50 p-6 rounded-[var(--radius)] border-none">
                <div className="w-10 h-10 bg-purple-500/10 rounded-md flex items-center justify-center mb-4">
                  <CalendarDays className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Active Events</h3>
                <p className="text-4xl font-extrabold text-foreground tracking-tight">
                  {stats.activeEventsCount}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-extrabold tracking-tighter text-foreground">Recent Designs</h2>
            <Link href="/designs" className="text-xs font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors">View All</Link>
          </div>

          {invitations.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-2xl font-extrabold tracking-tighter text-foreground mb-2">No designs yet</h3>
              <p className="text-muted-foreground mb-8 font-medium">Start your journey by creating a premium digital invitation.</p>
              <Link
                href="/create"
                className="bg-primary text-primary-foreground px-8 py-4 rounded-md font-bold uppercase tracking-widest text-xs hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
              >
                Create Your First Design
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {invitations.map((invitation) => {
                const rsvpStats = getRSVPStats(invitation.rsvps || []);
                const isUpcoming = !isDateInPast(invitation.event_date);

                return (
                  <div 
                    key={invitation.id} 
                    className="bg-card rounded-[var(--radius)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border-none overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(45,91,255,0.08)] hover:-translate-y-1"
                  >
                    <Link href={`/invitations/${invitation.id}`} className="block group/card">
                      {hasInvitationDesign(invitation) && (
                        <div className="aspect-video bg-muted relative">
                          <Image
                            src={getInvitationImageUrl(invitation) || ''}
                            alt={invitation.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      )}
                      <div className="p-6 pb-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-bold text-foreground truncate group-hover/card:text-primary transition-colors">
                            {invitation.title}
                          </h3>
                          <span className={`px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-full ${isUpcoming
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                            }`}>
                            {isUpcoming ? 'Upcoming' : 'Past'}
                          </span>
                        </div>

                        <p className="text-muted-foreground text-xs font-medium mb-4">
                          {formatShortDate(invitation.event_date)}
                          {invitation.event_time && ` • ${invitation.event_time}`}
                        </p>
                      </div>
                    </Link>

                    <div className="p-6 pt-2">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 bg-muted/30 p-3 rounded-md">
                        <span className="text-foreground font-semibold flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-green-500" />
                          {rsvpStats.attendingCount} Attending
                        </span>
                        <span className="text-muted-foreground font-medium text-xs">
                          {rsvpStats.maybe} Maybe • {rsvpStats.no} No
                        </span>
                      </div>

                      <div className="flex flex-col gap-3 mt-auto">
                        <ShareLinkGroup 
                          shareToken={invitation.share_token} 
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
