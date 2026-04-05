const fs = require('fs');
let content = fs.readFileSync('src/lib/rsvp-utils.ts', 'utf8');

content = content.replace(
    /if \(rsvp\.response === 'yes'\) stats\.yes \+= Number\(rsvp\.guest_count\) \|\| 1;/g,
    "if (rsvp.response === 'yes') stats.yes += (rsvp.guest_count !== undefined ? Number(rsvp.guest_count) : 1);"
);

content = content.replace(
    /if \(rsvp\.response === 'yes'\) stats\.yes \+= rsvp\.guest_count \|\| 1;/g,
    "if (rsvp.response === 'yes') stats.yes += (rsvp.guest_count !== undefined ? Number(rsvp.guest_count) : 1);"
);

fs.writeFileSync('src/lib/rsvp-utils.ts', content);
