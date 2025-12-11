# Contributing to log.sandipmaity.me

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/githublog.git
   cd githublog
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your values
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

## Code Style

- Use TypeScript for type safety
- Follow the existing code style
- Use Tailwind CSS for styling
- Keep components small and focused
- Add comments for complex logic

## Component Guidelines

### File Organization
```
components/
  ComponentName.tsx    # Component implementation
```

### Component Structure
```typescript
'use client' // Only if client-side features needed

import { useState } from 'react'
import { ComponentProps } from '@/types'

export default function ComponentName({ prop1, prop2 }: ComponentProps) {
  // State and hooks
  const [state, setState] = useState()

  // Event handlers
  const handleClick = () => {
    // ...
  }

  // Render
  return (
    <div className="...">
      {/* JSX */}
    </div>
  )
}
```

## API Routes

- Follow REST conventions
- Use appropriate HTTP methods (GET, POST, PATCH, DELETE)
- Return consistent error responses
- Validate input data
- Use TypeScript types

## Database Changes

If you modify the database schema:
1. Update `supabase/schema.sql`
2. Update TypeScript types in `types/index.ts`
3. Test with sample data from `supabase/seed.sql`
4. Document changes in PR description

## Testing

Before submitting a PR:
1. Test all modified features
2. Check responsive design
3. Verify build succeeds: `npm run build`
4. Run linter: `npm run lint`
5. Test with real GitHub webhooks if possible

## Pull Request Process

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes
3. Commit with clear messages:
   ```bash
   git commit -m "feat: add new feature"
   ```

4. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

5. Open a Pull Request with:
   - Clear title and description
   - Screenshots for UI changes
   - List of changes made
   - Any breaking changes

## Commit Message Format

Use conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

Examples:
```
feat: add search functionality to timeline
fix: resolve mobile navigation issue
docs: update setup instructions
refactor: simplify event normalization logic
```

## Reporting Issues

When reporting issues, include:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (OS, browser, Node version)

## Feature Requests

For feature requests:
- Describe the feature and use case
- Explain why it would be useful
- Suggest implementation approach if possible
- Check existing issues first

## Questions?

Feel free to open an issue for questions or discussions!

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
