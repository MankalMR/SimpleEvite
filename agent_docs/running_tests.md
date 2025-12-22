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
- **Integration Tests**: Currently limited; manual verification of API routes is common practice for this stage.
