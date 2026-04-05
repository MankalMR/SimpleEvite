const fs = require('fs');
let content = fs.readFileSync('src/lib/rsvp-utils.test.ts', 'utf8');

// Replace any array with explicit RSVP type and ignore errors where guest_count doesn't perfectly match all mocks
content = content.replace(
    /const mockRSVPs: any\[\] = \[/g,
    "const mockRSVPs: RSVP[] = ["
);

fs.writeFileSync('src/lib/rsvp-utils.test.ts', content);

let uiContent = fs.readFileSync('src/app/demo/i/[token]/page.tsx', 'utf8');
uiContent = uiContent.replace(
    /import \{ RSVP \} from '@\/lib\/supabase';\n/g,
    ""
);
fs.writeFileSync('src/app/demo/i/[token]/page.tsx', uiContent);
