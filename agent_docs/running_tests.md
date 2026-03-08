# Running Tests and Quality Checks

## Test Suite
The project uses **Jest** for unit and integration testing.

```bash
npm test
```

### Watch Mode
For TDD workflows:
```bash
npm run test:watch
```

## Quality Checks
All PRs must pass the following checks:

### Linting
Uses ESLint with Next.js configuration.
```bash
npm run lint
```

### Type Checking
Uses TypeScript compiler to ensure type safety.
```bash
npm run type-check
```

## Testing Strategy
- **Unit Tests**: Focus on `src/lib/*` utilities (e.g., `security.test.ts`, `data-utils.test.ts`).
- **Integration & UI Validation**: ALWAYS use the **Demo App** for manual validation.
  - Navigate to `http://localhost:3008/demo/dashboard` when the dev server is running.
  - This mode bypasses Google Sign-In and uses an isolated, in-memory data store with realistic seed data.
  - Test all UI flows (creating invites, RSVPing, etc.) here before assuming a feature is complete.
