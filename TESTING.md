# 🧪 Simple Evite Testing Guide

## Overview

This project uses a comprehensive testing strategy with tests co-located next to their corresponding modules. This approach ensures tests stay up-to-date with code changes and makes it easy to find and maintain tests.

## 📁 Test Structure

```
src/
├── lib/
│   ├── auth.ts
│   ├── auth.test.ts              # Authentication tests
│   ├── database-supabase.ts
│   ├── database-supabase.test.ts # Database layer tests
│   ├── date-utils.ts
│   └── date-utils.test.ts        # Date utility tests
├── app/
│   └── api/
│       ├── invitations/
│       │   ├── route.ts
│       │   └── route.test.ts     # API route tests
│       └── designs/
│           ├── route.ts
│           └── route.test.ts     # API route tests
└── __tests__/                    # Integration tests (future)
```

## 🎯 Test Coverage Priorities

### Phase 1: Critical Foundation (✅ COMPLETED)
- **Database Layer** (`src/lib/database-supabase.test.ts`)
  - All CRUD operations for invitations, designs, RSVPs
  - Error handling and edge cases
  - Data transformation functions

### Phase 2: Security & API (✅ COMPLETED)
- **Authentication** (`src/lib/auth.test.ts`)
  - Session management
  - JWT token handling
  - User authentication flow

- **API Routes** (`src/app/api/*/route.test.ts`)
  - Request validation
  - Authentication checks
  - Error responses
  - Data transformation

### Phase 3: Utilities (✅ COMPLETED)
- **Date Utils** (`src/lib/date-utils.test.ts`)
  - Timezone handling
  - Date formatting
  - Input validation

## 🚀 Running Tests

### Option 1: Simple Test Runner (No Dependencies)
```bash
node run-tests.js
```

### Option 2: Jest (When Dependencies are Installed)
```bash
# Install dependencies first
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

## 📊 Test Categories

### 1. Unit Tests
- **Purpose**: Test individual functions in isolation
- **Location**: Next to the module being tested
- **Examples**: `date-utils.test.ts`, `auth.test.ts`

### 2. Integration Tests
- **Purpose**: Test how modules work together
- **Location**: `src/__tests__/` (future)
- **Examples**: API endpoint to database integration

### 3. API Tests
- **Purpose**: Test HTTP endpoints and request/response handling
- **Location**: Next to API route files
- **Examples**: `route.test.ts` files

## 🔧 Test Patterns

### Mocking Strategy
```typescript
// Mock external dependencies
jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}));

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: [],
            error: null
          }))
        }))
      }))
    }))
  }
}));
```

### Test Structure
```typescript
describe('ModuleName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('functionName', () => {
    it('should handle success case', async () => {
      // Arrange
      const input = 'test input';
      const expected = 'expected output';

      // Act
      const result = await functionName(input);

      // Assert
      expect(result).toBe(expected);
    });

    it('should handle error case', async () => {
      // Arrange
      const input = 'invalid input';

      // Act & Assert
      await expect(functionName(input)).rejects.toThrow('Error message');
    });
  });
});
```

## 📈 Coverage Goals

| Module | Target Coverage | Current Status |
|--------|----------------|----------------|
| Database Layer | 90%+ | ✅ Complete |
| Authentication | 85%+ | ✅ Complete |
| API Routes | 80%+ | ✅ Complete |
| Date Utils | 90%+ | ✅ Complete |
| **Overall** | **85%+** | **✅ Complete** |

## 🛠️ Adding New Tests

### 1. Create Test File
Create a `.test.ts` file next to the module you want to test:
```bash
touch src/lib/new-module.test.ts
```

### 2. Write Tests
Follow the established patterns:
```typescript
import { functionToTest } from './new-module';

describe('new-module', () => {
  it('should work correctly', () => {
    expect(functionToTest()).toBe('expected result');
  });
});
```

### 3. Run Tests
```bash
node run-tests.js
```

## 🐛 Debugging Tests

### Common Issues
1. **Mock not working**: Check mock setup and `jest.clearAllMocks()`
2. **Async test failing**: Use `await` and `async/await` properly
3. **Import errors**: Check module paths and dependencies

### Debug Mode
```bash
# Run with verbose output
node run-tests.js --verbose

# Run specific test file
node -e "require('./src/lib/date-utils.test.ts')"
```

## 🔄 CI/CD Integration

### GitHub Actions (Future)
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '22'
      - run: npm install
      - run: npm run test:ci
```

## 📚 Best Practices

### 1. Test Naming
- Use descriptive test names
- Follow pattern: "should [expected behavior] when [condition]"
- Example: "should return user invitations when user is authenticated"

### 2. Test Organization
- Group related tests with `describe` blocks
- Use `beforeEach` for setup
- Keep tests independent and isolated

### 3. Assertions
- Use specific assertions (`toBe`, `toEqual`, `toContain`)
- Test both success and error cases
- Verify mock calls when testing interactions

### 4. Mocking
- Mock external dependencies
- Don't mock the code under test
- Reset mocks between tests

## 🎉 Benefits

### 1. Confidence
- Catch bugs before they reach production
- Refactor safely with test coverage
- Document expected behavior

### 2. Maintainability
- Tests serve as living documentation
- Easy to find and update tests
- Co-location reduces context switching

### 3. Development Speed
- Faster debugging with focused tests
- Immediate feedback on changes
- Reduced manual testing time

## 📝 Test Checklist

When adding new features:

- [ ] Unit tests for business logic
- [ ] API tests for new endpoints
- [ ] Error handling tests
- [ ] Edge case tests
- [ ] Integration tests (if needed)
- [ ] Update test documentation

## 🤝 Contributing

1. Write tests for new features
2. Ensure all tests pass
3. Maintain or improve coverage
4. Update this documentation if needed

---

**Remember**: Good tests are an investment in code quality and developer productivity. They pay dividends in reduced bugs, faster development, and easier maintenance.

