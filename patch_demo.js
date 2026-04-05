const fs = require('fs');
let content = fs.readFileSync('src/app/api/demo/rsvp/route.ts', 'utf8');

content = content.replace(
    /guest_count: response === 'yes' && guest_count \? parseInt\(guest_count, 10\) : 1,\n        guest_count: response === 'yes' && guest_count \? parseInt\(guest_count, 10\) : 1,/g,
    "guest_count: response === 'yes' && guest_count ? parseInt(guest_count, 10) : 1,"
);

fs.writeFileSync('src/app/api/demo/rsvp/route.ts', content);
