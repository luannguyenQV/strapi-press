# Essential Commands for StrapiPress Development

## Development Commands
```bash
# Start all applications in development mode
pnpm dev

# Start only the Next.js web app (port 3001)
pnpm dev:web

# Start only the Strapi CMS backend
pnpm dev:strapi
# Alternative: cd apps/strapi && pnpm develop
```

## Building and Production
```bash
# Build all applications and packages
pnpm build

# Build specific applications
pnpm build --filter=web
pnpm build --filter=@repo/strapi

# Analyze bundle sizes (web app)
pnpm analyze
```

## Code Quality and Testing
```bash
# Run Ultracite linting across entire codebase
pnpm lint

# Format code using Ultracite (Biome)
pnpm format

# Run TypeScript type checking across all apps
pnpm typecheck

# Run all tests using Vitest
pnpm test

# Run tests for specific workspace
pnpm test --filter=web
pnpm test --filter=@repo/[package]
```

## Strapi Specific Commands
```bash
# Seed Strapi with example data
cd apps/strapi && pnpm seed:example

# Open Strapi interactive console
cd apps/strapi && pnpm strapi console

# Upgrade Strapi to latest version
cd apps/strapi && pnpm upgrade

# Start Strapi in development mode
cd apps/strapi && pnpm develop
```

## Internationalization
```bash
# Run translation workflows
pnpm translate
```

## Maintenance and Utilities
```bash
# Update all dependencies to latest versions
pnpm bump-deps

# Update shadcn/ui components in design system
pnpm bump-ui

# Check workspace boundaries and dependencies
pnpm boundaries

# Clean all node_modules and generated files
pnpm clean
```

## System Commands (macOS/Darwin)
```bash
# File operations
ls -la                    # List files with details
find . -name "*.ts"       # Find TypeScript files
grep -r "search" .        # Search in files
cd apps/web              # Change directory

# Git operations
git status               # Check repository status
git add .               # Stage changes
git commit -m "message" # Commit changes
git log --oneline       # View commit history

# Process management
ps aux | grep node      # Find Node.js processes
kill -9 <pid>          # Kill process by ID
```

## Quick Development Workflow
1. `pnpm dev` - Start both Strapi and Next.js
2. Visit `http://localhost:1337/admin` for Strapi admin
3. Visit `http://localhost:3001` for Next.js frontend
4. `pnpm lint && pnpm typecheck` - Quality checks before commit
5. `pnpm test` - Run tests before deployment