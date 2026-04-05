const fs = require('fs');

let content = fs.readFileSync('src/app/api/rsvp/route.ts', 'utf8');

content = content.replace(
    /guest_count: response === 'yes' && guest_count \? parseInt\(guest_count as string, 10\) : 1,\n              eventTitle: invitation.title,/g,
    "eventTitle: invitation.title,"
);

fs.writeFileSync('src/app/api/rsvp/route.ts', content);
