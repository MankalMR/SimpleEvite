const fs = require('fs');

let content = fs.readFileSync('src/lib/database-supabase.ts', 'utf8');

content = content.replace(
    /rsvps \(\n    id,\n    name,\n    response,\n    comment,\n    created_at\n  \)/g,
    `rsvps (
    id,
    name,
    response,
    guest_count,
    comment,
    created_at
  )`
);

fs.writeFileSync('src/lib/database-supabase.ts', content);
