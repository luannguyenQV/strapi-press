# next-forge Quick Start Guide

**Get up and running with next-forge in minutes**

## 🚀 Installation

```bash
# Create a new project
npx next-forge@latest init

# Navigate to project
cd your-project-name

# Install dependencies (done automatically)
# pnpm install
```

## ⚡ Development

### Start All Applications
```bash
# Start everything in development mode
pnpm dev

# Applications will be available at:
# - Main App: http://localhost:3000
# - Web/Marketing: http://localhost:3001  
# - API: http://localhost:3002
# - Docs: http://localhost:3003
```

### Start Individual Applications
```bash
# Main authenticated app only
pnpm dev --filter=app

# Marketing website only
pnpm dev --filter=web

# API service only
pnpm dev --filter=api

# Documentation site only
pnpm dev --filter=docs
```

## 🗄️ Database Setup

```bash
# Set up database (PostgreSQL required)
pnpm migrate

# This runs:
# - prisma format (format schema)
# - prisma generate (generate client)
# - prisma db push (sync database)
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests for specific app
pnpm test --filter=app

# Run tests in watch mode
pnpm test --watch
```

## 🔍 Code Quality

```bash
# Lint all code
pnpm lint

# Format all code
pnpm format

# Type check (run in individual apps)
cd apps/app && pnpm typecheck
```

## 📦 Building

```bash
# Build all applications
pnpm build

# Build specific application
pnpm build --filter=app

# Analyze bundle sizes
pnpm analyze
```

## 🛠️ Essential Configuration

### Environment Variables
1. Copy `.env.example` files in each app
2. Configure required variables:
   ```bash
   # Database
   DATABASE_URL="postgresql://..."
   
   # Authentication (Clerk)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
   CLERK_SECRET_KEY="sk_..."
   
   # Observability (Sentry)
   SENTRY_DSN="https://..."
   ```

### Database Configuration
- **Database**: PostgreSQL (local or hosted)
- **ORM**: Prisma with generated client
- **Location**: `packages/database/`
- **Schema**: `packages/database/schema.prisma`

## 📁 Project Structure

```
your-project/
├── apps/
│   ├── app/           # Main application (port 3000)
│   ├── web/           # Marketing site (port 3001)
│   ├── api/           # Backend API (port 3002)
│   └── docs/          # Documentation (port 3003)
├── packages/
│   ├── design-system/ # UI components
│   ├── database/      # Prisma + PostgreSQL
│   ├── auth/          # Authentication
│   └── [more]/        # 20+ shared packages
└── scripts/           # Build utilities
```

## 🎯 Key Features Out of the Box

### ✅ Authentication
- Clerk integration with sign-in/sign-up
- Protected routes and middleware
- User management and sessions

### ✅ Database
- PostgreSQL with Prisma ORM
- Type-safe database client
- Migration system

### ✅ UI Components
- 30+ shadcn/ui components
- Tailwind CSS v4
- Storybook documentation

### ✅ Real-time Features
- Liveblocks collaboration
- Live cursors and presence
- Real-time data sync

### ✅ Developer Experience
- TypeScript strict mode
- Hot reload with Turbopack
- Comprehensive testing setup
- Code formatting and linting

## 🚨 Common Issues & Solutions

### Database Connection
```bash
# If database connection fails:
1. Ensure PostgreSQL is running
2. Check DATABASE_URL in .env files
3. Run: pnpm migrate
```

### Port Conflicts
```bash
# If ports are in use:
1. Kill processes: lsof -ti:3000 | xargs kill -9
2. Or change ports in package.json dev scripts
```

### Build Errors
```bash
# If build fails:
1. Clean cache: pnpm clean
2. Reinstall: rm -rf node_modules && pnpm install
3. Rebuild: pnpm build
```

## 📚 Next Steps

1. **Explore the Main App**: Navigate to http://localhost:3000
2. **Check the Documentation**: Visit http://localhost:3003  
3. **Review Components**: Open Storybook at configured port
4. **Read the Full Guide**: See `PROJECT_INDEX.md` for comprehensive documentation
5. **Join the Community**: Visit [next-forge GitHub](https://github.com/vercel/next-forge)

## 🔗 Useful Links

- **Documentation**: https://www.next-forge.com/docs
- **GitHub**: https://github.com/vercel/next-forge
- **Examples**: Check `apps/` directory for implementation patterns
- **Components**: Browse `packages/design-system/` for UI components

---

**Ready to build something amazing? Start with `pnpm dev` and explore!** 🎉