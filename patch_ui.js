const fs = require('fs');

let content = fs.readFileSync('src/hooks/usePublicInvitation.ts', 'utf8');

content = content.replace(
    /response: 'yes' \| 'no' \| 'maybe';\n    comment\?: string;/g,
    "response: 'yes' | 'no' | 'maybe';\n    guest_count?: number;\n    comment?: string;"
);

fs.writeFileSync('src/hooks/usePublicInvitation.ts', content);
