# Testing Documentation

This directory contains comprehensive automated tests for the Admin API endpoints.

## 🧪 Test Structure

```
tests/
├── controllers/admin/
│   └── adminController.test.ts    # Unit tests for admin controller
├── integration/
│   └── adminRoutes.test.ts        # Integration tests for API endpoints
├── validations/
│   └── admin.test.ts              # Validation schema tests
├── utils/
│   └── testDb.ts                  # Test database utilities
├── setup.ts                       # Jest setup configuration
└── README.md                      # This file
```

## 🚀 Running Tests

### All Tests

```bash
npm test
```

### Watch Mode (Development)

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:coverage
```

### Integration Tests Only

```bash
npm run test:integration
```

### Unit Tests Only

```bash
npm run test:unit
```

## 📋 Test Categories

### 1. Unit Tests (`tests/controllers/admin/adminController.test.ts`)

- **Purpose**: Test individual controller methods in isolation
- **Scope**: Business logic, validation, error handling
- **Mocking**: Prisma client, external dependencies
- **Coverage**: All controller methods with edge cases

**Example Test Cases:**

- ✅ Successful admin registration
- ✅ Email uniqueness validation
- ✅ Input validation errors
- ✅ Password hashing verification
- ✅ Database error handling

### 2. Integration Tests (`tests/integration/adminRoutes.test.ts`)

- **Purpose**: Test complete API endpoints end-to-end
- **Scope**: HTTP requests, database operations, response formats
- **Mocking**: None (uses real database)
- **Coverage**: All API endpoints with real data flow

**Example Test Cases:**

- ✅ POST /api/admin/register - Success scenario
- ✅ POST /api/admin/register - Validation errors
- ✅ GET /api/admin - Pagination and search
- ✅ GET /api/admin/:id - Single admin retrieval
- ✅ Error handling and status codes

### 3. Validation Tests (`tests/validations/admin.test.ts`)

- **Purpose**: Test Zod validation schemas
- **Scope**: Input validation rules, error messages
- **Mocking**: None (pure function testing)
- **Coverage**: All validation rules and edge cases

**Example Test Cases:**

- ✅ Full name validation (length, characters)
- ✅ Email format validation
- ✅ Password strength requirements
- ✅ Optional field validation

## 🔧 Test Configuration

### Jest Configuration (`jest.config.js`)

```javascript
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  transform: { "^.+\\.ts$": "ts-jest" },
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/server.ts"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  testTimeout: 10000,
};
```

### Test Setup (`tests/setup.ts`)

- Environment configuration
- Console mocking
- Global test timeout
- Database cleanup utilities

### Test Database (`tests/utils/testDb.ts`)

- Database cleanup functions
- Test data creation helpers
- Database query utilities

## 📊 Test Coverage

### Current Coverage Areas:

- ✅ **Admin Registration** (100%)

  - Input validation
  - Password hashing
  - Email uniqueness
  - Error handling
  - Response formatting

- ✅ **Admin Retrieval** (100%)

  - Single admin by ID
  - Paginated admin list
  - Search functionality
  - Filtering by status

- ✅ **Validation Schemas** (100%)
  - Registration validation
  - Login validation
  - Update validation
  - Edge cases and error messages

### Coverage Goals:

- **Statements**: >90%
- **Branches**: >85%
- **Functions**: >95%
- **Lines**: >90%

## 🛠️ Writing New Tests

### Unit Test Template

```typescript
describe("MethodName", () => {
  it("should handle success case", async () => {
    // Arrange
    const mockData = {
      /* test data */
    };

    // Act
    const result = await method(mockData);

    // Assert
    expect(result).toEqual(expectedResult);
  });

  it("should handle error case", async () => {
    // Arrange
    const invalidData = {
      /* invalid data */
    };

    // Act & Assert
    await expect(method(invalidData)).rejects.toThrow();
  });
});
```

### Integration Test Template

```typescript
describe("POST /api/admin/endpoint", () => {
  it("should return success response", async () => {
    const response = await request(app)
      .post("/api/admin/endpoint")
      .send(validData)
      .expect(201);

    expect(response.body).toHaveProperty("expectedField");
  });
});
```

## 🚨 Best Practices

### 1. Test Organization

- Group related tests using `describe` blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Mocking

- Mock external dependencies (database, APIs)
- Use realistic mock data
- Reset mocks between tests

### 3. Database Testing

- Use separate test database
- Clean up data after each test
- Use transactions when possible

### 4. Error Testing

- Test both success and failure scenarios
- Verify error messages and status codes
- Test edge cases and boundary conditions

### 5. Performance

- Keep tests fast and focused
- Use appropriate timeouts
- Avoid unnecessary database operations

## 🔍 Debugging Tests

### Running Single Test

```bash
npm test -- --testNamePattern="should register admin"
```

### Verbose Output

```bash
npm test -- --verbose
```

### Debug Mode

```bash
npm test -- --detectOpenHandles
```

## 📈 Continuous Integration

### GitHub Actions Example

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
          node-version: "18"
      - run: npm ci
      - run: npm run test:coverage
```

## 🎯 Test-Driven Development (TDD)

### Workflow:

1. **Red**: Write failing test
2. **Green**: Write minimal code to pass test
3. **Refactor**: Improve code while keeping tests green

### Benefits:

- Better code coverage
- Improved design
- Regression prevention
- Documentation through tests

## 📝 Test Maintenance

### Regular Tasks:

- Update tests when API changes
- Review and update mock data
- Monitor test performance
- Update dependencies

### Quality Checks:

- Maintain >90% coverage
- Keep tests fast (<30s total)
- Ensure all tests pass
- Review test readability
