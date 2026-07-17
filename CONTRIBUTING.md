# Contributing Guide

## Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 13+
- Git

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd air
```

2. Install dependencies:

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

3. Set up environment variables:

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

4. Initialize database:

```bash
cd backend
npm run migrate:dev
npm run seed
cd ..
```

5. Start development servers:

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Watch tests
cd backend
npm run test:watch
```

## Code Style

### TypeScript Guidelines

- Use strict mode: `"strict": true` in tsconfig.json
- Avoid `any` types; use generics or unions
- Define interfaces for all data structures
- Use enums for fixed value sets

Example:

```typescript
// ✅ Good
interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

// ❌ Avoid
const user: any = getUserData();
const roles = ['admin', 'user']; // Use enum instead
```

### Naming Conventions

- **Files**: kebab-case for features (`weather-widget.tsx`), PascalCase for classes/components
- **Variables/Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Classes**: PascalCase
- **Interfaces**: PascalCase with `I` prefix for non-React interfaces

### Format and Lint

```bash
# Format code
npm run format

# Lint
npm run lint

# Fix lint issues
npm run lint:fix
```

## Commit Guidelines

Use Conventional Commits:

```
type(scope): description

body

footer
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting, missing semicolons)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Test additions/changes
- `chore`: Dependency updates, config changes

Examples:

```bash
git commit -m "feat(weather): add visibility calculation"
git commit -m "fix(auth): resolve JWT validation issue"
git commit -m "docs(deployment): update AWS instructions"
```

## Testing

### Unit Tests

```bash
cd backend
npm run test -- --testPathPattern=decision-support
npm run test -- --coverage
```

### Integration Tests

```bash
npm run test:integration
```

### Frontend Component Tests

```bash
cd frontend
npm run test -- --watch
```

### Test Coverage

Maintain >80% coverage for:
- Services
- Controllers
- Utils

```bash
npm run test -- --coverage --coverageThreshold='{"global":{"branches":80,"functions":80,"lines":80,"statements":80}}'
```

## Pull Request Process

1. Create a feature branch:

```bash
git checkout -b feat/my-feature
```

2. Make changes and commit:

```bash
git add .
git commit -m "feat: add new feature"
```

3. Push and create PR:

```bash
git push origin feat/my-feature
```

4. PR requirements:
   - Passes all tests
   - Code review approval
   - No conflicts with main
   - Updated documentation if needed

5. After approval:

```bash
# Squash commits (optional)
git rebase -i main

# Merge
git merge --no-ff feat/my-feature

# Delete branch
git branch -d feat/my-feature
```

## Architecture Guidelines

### Backend Structure

```
src/
├── adapters/       # Weather data source adapters
├── controllers/    # Request handlers
├── middleware/     # Express middleware
├── models/         # Data models
├── parsers/        # Weather data parsers
├── repositories/   # Data access layer
├── routes/         # API routes
├── services/       # Business logic
├── types/          # TypeScript types
└── utils/          # Helper functions
```

### Frontend Structure

```
src/
├── components/     # Reusable components
├── contexts/       # React contexts
├── layouts/        # Page layouts
├── lib/            # Utilities
├── pages/          # Page components
├── services/       # API clients
├── stores/         # Zustand stores
├── styles/         # Global styles
└── types/          # TypeScript types
```

## Adding Features

### Backend Feature

1. Create model in `prisma/schema.prisma`
2. Generate Prisma client: `npx prisma generate`
3. Create service in `src/services/`
4. Create controller in `src/controllers/`
5. Create routes in `src/routes/`
6. Add tests in `tests/`
7. Update API documentation

### Frontend Feature

1. Create component in `src/components/`
2. Create store in `src/stores/` if needed
3. Add service method in `src/services/api.ts`
4. Create page in `src/pages/`
5. Add route in `src/App.tsx`
6. Add tests in `__tests__/`

## Documentation

- Update README for user-facing changes
- Add JSDoc comments for complex functions
- Update API docs for new endpoints
- Document new environment variables

```typescript
/**
 * Calculate risk score from weather observation
 * @param weather - Canonical weather observation
 * @param risk - Risk assessment
 * @returns Decision support result with recommendations
 */
export function evaluateDecision(
  weather: CanonicalWeatherObservation,
  risk: RiskAssessment
): DecisionSupportResult {
  // Implementation
}
```

## Performance Considerations

### Backend

- Use database indexes for frequently queried fields
- Implement pagination for large datasets
- Cache computationally expensive operations
- Use connection pooling for database

### Frontend

- Code split routes with React.lazy()
- Memoize expensive computations
- Lazy load images and heavy components
- Use React Query for efficient data fetching

## Security

- Never commit secrets or credentials
- Validate all user input
- Use parameterized queries (Prisma handles this)
- Sanitize output in templates
- Keep dependencies updated: `npm audit fix`

## Debugging

### Backend

```bash
# Debug with Node inspector
node --inspect-brk=9229 node_modules/.bin/ts-node src/server.ts

# In Chrome: chrome://inspect
```

### Frontend

- Use React DevTools browser extension
- Use Redux DevTools for state debugging
- Check Network tab for API calls

## Deployment

- Ensure all tests pass: `npm test`
- Verify build succeeds: `npm run build`
- Check for TypeScript errors: `npx tsc --noEmit`
- Review logs for warnings

## Getting Help

- Check existing issues and PRs
- Review API documentation: `/api-docs`
- Check deployment guide: `docs/DEPLOYMENT.md`
- Ask in team communication channels

## License

By contributing, you agree that your contributions will be licensed under the project's license.
