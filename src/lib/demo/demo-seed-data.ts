/**
 * demo-seed-data.ts
 *
 * Realistic seed data for demo sessions: invitations, RSVPs, and templates.
 * Bump SEED_VERSION whenever you change seed data to auto-reseed existing sessions.
 */

import { DefaultTemplate } from '@/lib/supabase';
import { InvitationWithRSVPs } from '@/lib/database-supabase';

export const SEED_VERSION = '2026-03-07-v2';

// Fixed UUIDs for deterministic share tokens
const INVITATION_IDS = {
    bbq: 'demo-inv-bbq-00000001',
    birthday: 'demo-inv-birthday-0001',
    thanksgiving: 'demo-inv-thanks-0001',
};

const SHARE_TOKENS = {
    bbq: 'demo-token-bbq-00000001',
    birthday: 'demo-token-birthday-001',
    thanksgiving: 'demo-token-thanks-001',
};

const PORTFOLIO_USER_ID = 'demo-user';

function futureDate(daysFromNow: number): string {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    return d.toISOString().split('T')[0];
}

function pastDate(daysAgo: number): string {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
}

function makeInvitations(): InvitationWithRSVPs[] {
    const now = new Date().toISOString();

    // --- Event 1: Upcoming Summer BBQ with RSVPs ---
    const bbqInvitation: InvitationWithRSVPs = {
        id: INVITATION_IDS.bbq,
        user_id: PORTFOLIO_USER_ID,
        title: 'Summer BBQ 2026 🌞',
        description: 'Join us for an amazing backyard BBQ with burgers, games, and good vibes! Bring your swimsuit — the pool will be open!',
        event_date: futureDate(21),
        event_time: '16:00',
        rsvp_deadline: futureDate(14),
        location: '123 Oak Lane, Austin, TX',
        design_id: 'demo-template-birthday-vibrant',
        share_token: SHARE_TOKENS.bbq,
        created_at: now,
        updated_at: now,
        hide_title: false,
        hide_description: false,
        organizer_notes: 'Parking is available on the street or in the driveway. Don\'t forget to bring your own towel for the pool!',
        text_font_family: 'inter',
        text_overlay_style: 'vibrant',
        text_position: 'bottom',
        text_size: 'large',
        text_shadow: true,
        text_background: true,
        text_background_opacity: 0.4,
        rsvps: [
            {
                id: 'demo-rsvp-001',
                invitation_id: INVITATION_IDS.bbq,
                name: 'Sarah Chen',
                response: 'yes',
                comment: 'Can\'t wait! I\'ll bring the potato salad 🥗',
                created_at: now,
            },
            {
                id: 'demo-rsvp-002',
                invitation_id: INVITATION_IDS.bbq,
                name: 'Marcus Johnson',
                response: 'yes',
                comment: 'Count me and +1 in!',
                created_at: now,
            },
            {
                id: 'demo-rsvp-003',
                invitation_id: INVITATION_IDS.bbq,
                name: 'Emily Rodriguez',
                response: 'maybe',
                comment: 'Trying to shuffle my schedule. Will confirm soon!',
                created_at: now,
            },
            {
                id: 'demo-rsvp-004',
                invitation_id: INVITATION_IDS.bbq,
                name: 'James Park',
                response: 'yes',
                comment: 'Bringing my famous ribs 🍖',
                created_at: now,
            },
            {
                id: 'demo-rsvp-005',
                invitation_id: INVITATION_IDS.bbq,
                name: 'Lisa Patel',
                response: 'no',
                comment: 'Wish I could make it — I\'ll be traveling that week.',
                created_at: now,
            },
        ],
        default_templates: {
            id: 'demo-template-birthday-vibrant',
            name: 'Fun Birthday Party',
            occasion: 'birthday',
            theme: 'vibrant',
            image_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop&crop=center',
            thumbnail_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop&crop=center',
            description: 'Colorful and playful party invitation',
            tags: ['vibrant', 'birthday', 'colorful', 'fun'],
            is_active: true,
            sort_order: 12,
            created_at: now,
            updated_at: now,
        },
    };

    // --- Event 2: Upcoming Birthday (no RSVPs yet — shows empty state) ---
    const birthdayInvitation: InvitationWithRSVPs = {
        id: INVITATION_IDS.birthday,
        user_id: PORTFOLIO_USER_ID,
        title: 'Ava\'s 5th Birthday Party 🎂',
        description: 'Come celebrate Ava turning 5! Bouncy castle, face painting, and cake!',
        event_date: futureDate(45),
        event_time: '14:00',
        rsvp_deadline: futureDate(30),
        location: '456 Elm Street, Austin, TX',
        design_id: 'demo-template-birthday-elegant',
        share_token: SHARE_TOKENS.birthday,
        created_at: now,
        updated_at: now,
        hide_title: false,
        hide_description: false,
        organizer_notes: undefined,
        text_font_family: 'playfair',
        text_overlay_style: 'elegant',
        text_position: 'center',
        text_size: 'extra-large',
        text_shadow: true,
        text_background: false,
        text_background_opacity: 0.3,
        rsvps: [],
        default_templates: {
            id: 'demo-template-birthday-elegant',
            name: 'Elegant Birthday Celebration',
            occasion: 'birthday',
            theme: 'elegant',
            image_url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=600&fit=crop&crop=center',
            thumbnail_url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop&crop=center',
            description: 'Sophisticated birthday invitation with gold accents',
            tags: ['elegant', 'birthday', 'adult', 'formal'],
            is_active: true,
            sort_order: 11,
            created_at: now,
            updated_at: now,
        },
    };

    // --- Event 3: Past Thanksgiving (shows "Past" badge) ---
    const thanksgivingInvitation: InvitationWithRSVPs = {
        id: INVITATION_IDS.thanksgiving,
        user_id: PORTFOLIO_USER_ID,
        title: 'Thanksgiving Dinner 🦃',
        description: 'Annual Thanksgiving dinner. Turkey, mashed potatoes, and pumpkin pie!',
        event_date: pastDate(90),
        event_time: '17:00',
        rsvp_deadline: pastDate(100),
        location: '789 Maple Drive, Austin, TX',
        design_id: 'demo-template-thanksgiving-elegant',
        share_token: SHARE_TOKENS.thanksgiving,
        created_at: pastDate(120) + 'T00:00:00.000Z',
        updated_at: pastDate(90) + 'T00:00:00.000Z',
        hide_title: true,
        hide_description: true,
        organizer_notes: 'Let me know if you are bringing any extra sides so we can coordinate!',
        text_font_family: 'lora',
        text_overlay_style: 'elegant',
        text_position: 'bottom',
        text_size: 'large',
        text_shadow: true,
        text_background: true,
        text_background_opacity: 0.5,
        rsvps: [
            {
                id: 'demo-rsvp-006',
                invitation_id: INVITATION_IDS.thanksgiving,
                name: 'Grandma Helen',
                response: 'yes',
                comment: 'I\'ll bring my famous pecan pie!',
                created_at: pastDate(100) + 'T00:00:00.000Z',
            },
            {
                id: 'demo-rsvp-007',
                invitation_id: INVITATION_IDS.thanksgiving,
                name: 'Uncle Bob',
                response: 'yes',
                created_at: pastDate(95) + 'T00:00:00.000Z',
            },
        ],
        default_templates: {
            id: 'demo-template-thanksgiving-elegant',
            name: 'Elegant Thanksgiving Dinner',
            occasion: 'thanksgiving',
            theme: 'elegant',
            image_url: 'https://images.unsplash.com/photo-1574972645531-6c1c9e65a6b2?w=800&h=600&fit=crop&crop=center',
            thumbnail_url: 'https://images.unsplash.com/photo-1574972645531-6c1c9e65a6b2?w=400&h=300&fit=crop&crop=center',
            description: 'Warm and sophisticated Thanksgiving gathering',
            tags: ['elegant', 'thanksgiving', 'family', 'autumn'],
            is_active: true,
            sort_order: 41,
            created_at: pastDate(120) + 'T00:00:00.000Z',
            updated_at: pastDate(120) + 'T00:00:00.000Z',
        },
    };

    return [bbqInvitation, birthdayInvitation, thanksgivingInvitation];
}

function makeTemplates(): DefaultTemplate[] {
    const now = new Date().toISOString();
    return [
        {
            id: 'demo-template-birthday-vibrant',
            name: 'Fun Birthday Party',
            occasion: 'birthday',
            theme: 'vibrant',
            image_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop&crop=center',
            thumbnail_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop&crop=center',
            description: 'Colorful and playful birthday party invitation',
            tags: ['vibrant', 'birthday', 'kids', 'colorful', 'fun'],
            is_active: true,
            sort_order: 12,
            created_at: now,
            updated_at: now,
        },
        {
            id: 'demo-template-birthday-elegant',
            name: 'Elegant Birthday Celebration',
            occasion: 'birthday',
            theme: 'elegant',
            image_url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=600&fit=crop&crop=center',
            thumbnail_url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop&crop=center',
            description: 'Sophisticated birthday invitation with gold accents',
            tags: ['elegant', 'birthday', 'adult', 'formal', 'sophisticated'],
            is_active: true,
            sort_order: 11,
            created_at: now,
            updated_at: now,
        },
        {
            id: 'demo-template-christmas-vibrant',
            name: 'Festive Christmas Party',
            occasion: 'christmas',
            theme: 'vibrant',
            image_url: 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=800&h=600&fit=crop&crop=center',
            thumbnail_url: 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=400&h=300&fit=crop&crop=center',
            description: 'Bright and cheerful Christmas party invitation',
            tags: ['vibrant', 'christmas', 'holiday', 'winter', 'colorful'],
            is_active: true,
            sort_order: 22,
            created_at: now,
            updated_at: now,
        },
        {
            id: 'demo-template-thanksgiving-elegant',
            name: 'Elegant Thanksgiving Dinner',
            occasion: 'thanksgiving',
            theme: 'elegant',
            image_url: 'https://images.unsplash.com/photo-1574972645531-6c1c9e65a6b2?w=800&h=600&fit=crop&crop=center',
            thumbnail_url: 'https://images.unsplash.com/photo-1574972645531-6c1c9e65a6b2?w=400&h=300&fit=crop&crop=center',
            description: 'Warm and sophisticated Thanksgiving gathering',
            tags: ['elegant', 'thanksgiving', 'family', 'autumn'],
            is_active: true,
            sort_order: 41,
            created_at: now,
            updated_at: now,
        },
        {
            id: 'demo-template-housewarming-modern',
            name: 'Modern Housewarming Event',
            occasion: 'housewarming',
            theme: 'modern',
            image_url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop&crop=center',
            thumbnail_url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=300&fit=crop&crop=center',
            description: 'Clean and contemporary housewarming design',
            tags: ['modern', 'housewarming', 'home', 'minimalist'],
            is_active: true,
            sort_order: 73,
            created_at: now,
            updated_at: now,
        },
    ];
}

export function buildSeedData() {
    return {
        invitations: makeInvitations(),
        templates: makeTemplates(),
    };
}
