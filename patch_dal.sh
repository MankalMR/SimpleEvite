#!/bin/bash
sed -i "s/response: 'yes' | 'no' | 'maybe';/response: 'yes' | 'no' | 'maybe';\n    guest_count?: number;/g" src/lib/supabase.ts

sed -i "s/response: rsvp.response as 'yes' | 'no' | 'maybe',/response: rsvp.response as 'yes' | 'no' | 'maybe',\n        guest_count: rsvp.guest_count || 1,/g" src/lib/database-supabase.ts
sed -i "s/response: data.response,/response: data.response,\n            guest_count: data.guest_count || 1,/g" src/lib/database-supabase.ts
sed -i "s/const { id, title, event_date, event_time, location } = rsvp.invitations/const { id, title, event_date, event_time, location } = rsvp.invitations/" src/lib/database-supabase.ts
