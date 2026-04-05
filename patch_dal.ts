import fs from 'fs';

let content = fs.readFileSync('src/lib/database-supabase.ts', 'utf8');

// Update rowToRSVP
content = content.replace(
    /response: rsvp\.response as 'yes' \| 'no' \| 'maybe',/g,
    "response: rsvp.response as 'yes' | 'no' | 'maybe',\n        guest_count: rsvp.guest_count || 1,"
);

// Update createRSVP
content = content.replace(
    /response: data\.response,/g,
    "response: data.response,\n            guest_count: data.guest_count || 1,"
);

// Add guest_count to query select fields
content = content.replace(
    /export const INVITATION_FULL_SELECT = `\n    id,\n    user_id,\n    title,\n    description,\n    event_date,\n    event_time,\n    location,\n    design_id,\n    share_token,\n    hide_title,\n    hide_description,\n    organizer_notes,\n    text_font_family,\n    created_at,\n    updated_at,\n    designs (\n        id,\n        name,\n        image_url\n    ),\n    rsvps \(\n        id,\n        name,\n        response,\n        comment,\n        created_at\n    \)/g,
    `export const INVITATION_FULL_SELECT = \`
    id,
    user_id,
    title,
    description,
    event_date,
    event_time,
    location,
    design_id,
    share_token,
    hide_title,
    hide_description,
    organizer_notes,
    text_font_family,
    created_at,
    updated_at,
    designs (
        id,
        name,
        image_url
    ),
    rsvps (
        id,
        name,
        response,
        guest_count,
        comment,
        created_at
    )`
);

fs.writeFileSync('src/lib/database-supabase.ts', content);
