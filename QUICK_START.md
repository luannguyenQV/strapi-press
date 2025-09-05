# Headless News Site Quick Start Guide

**Get up and running with Strapi + Next.js news platform in minutes**

## 🚀 Installation

```bash
# Clone or navigate to project
cd strapi

# Install dependencies
pnpm install
```

## ⚡ Development

### Start All Applications
```bash
# Start both frontend and backend
pnpm dev

# Applications will be available at:
# - Frontend (Next.js): http://localhost:3000
# - Backend (Strapi): http://localhost:1337
# - Strapi Admin: http://localhost:1337/admin
```

### Start Individual Applications
```bash
# Next.js frontend only
pnpm dev:web

# Strapi backend only
pnpm dev:strapi

# Alternative Strapi start
cd apps/strapi && pnpm develop
```

## 🗄️ Database Setup

Strapi uses SQLite by default for development:

```bash
# Strapi will auto-create database on first run
pnpm dev:strapi

# For production PostgreSQL setup, see deployment-guide.md
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests for web app only
pnpm test --filter=web

# Type checking across all apps
pnpm typecheck
```

## 🔍 Code Quality

```bash
# Lint all code (uses Ultracite/Biome)
pnpm lint

# Format all code
pnpm format

# Type check all applications
pnpm typecheck
```

## 📦 Building

```bash
# Build all applications
pnpm build

# Build specific application
pnpm build --filter=web
pnpm build --filter=@repo/strapi

# Analyze frontend bundle sizes
pnpm analyze
```

## 🛠️ Essential Configuration

### Environment Variables
Configure environment variables for both apps:

**Frontend (apps/web/.env.local):**
```bash
# Strapi API connection
NEXT_PUBLIC_STRAPI_URL="http://localhost:1337"
STRAPI_API_TOKEN="your-api-token"

# Site configuration
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

**Backend (apps/strapi/.env):**
```bash
# Strapi configuration
HOST=0.0.0.0
PORT=1337
APP_KEYS="your-app-keys"
API_TOKEN_SALT="your-token-salt"
ADMIN_JWT_SECRET="your-admin-secret"
TRANSFER_TOKEN_SALT="your-transfer-salt"

# Database (SQLite for development)
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db
```

### Database Configuration
- **Database**: SQLite (development), PostgreSQL (production)
- **CMS**: Strapi with auto-generated admin panel
- **Location**: `apps/strapi/`
- **Schema**: Auto-managed by Strapi content types

## 📁 Project Structure

```
strapi/
├── apps/
│   ├── strapi/        # Strapi CMS backend (port 1337)
│   │   ├── config/    # Database, plugins, middleware
│   │   ├── src/api/   # Content types & controllers
│   │   └── data/      # Sample data & uploads
│   └── web/           # Next.js frontend (port 3000)
│       ├── app/       # App Router with i18n
│       └── components/# UI components
├── packages/
│   ├── design-system/ # shadcn/ui components
│   ├── strapi-client/ # API client for Strapi
│   ├── internationalization/ # i18n utilities
│   └── [more]/        # Shared workspace packages
└── docs/              # Project documentation
```

## 🎯 Key Features Out of the Box

### ✅ Content Management
- Strapi 5.16.0 headless CMS
- Article, Author, Category content types
- Rich content editor with blocks
- Media management with image processing

### ✅ Frontend Features
- Next.js 15 with App Router
- React 19 with modern patterns
- Internationalization (i18n) support
- SEO optimization and metadata

### ✅ UI Components
- shadcn/ui component library
- Tailwind CSS v4 styling
- Dark/light mode support
- Mobile-responsive design

### ✅ Developer Experience
- TypeScript strict mode
- Hot reload with Turbopack
- Monorepo with Turborepo
- Biome linting and formatting

## 🚨 Common Issues & Solutions

### Strapi Admin Access
```bash
# If you can't access Strapi admin:
1. Ensure Strapi is running: pnpm dev:strapi
2. Visit: http://localhost:1337/admin
3. Create your first admin user on first visit
```

### Port Conflicts
```bash
# If ports are in use:
1. Kill processes: lsof -ti:3000 | xargs kill -9 (frontend)
2. Kill processes: lsof -ti:1337 | xargs kill -9 (backend)
3. Or change ports in package.json dev scripts
```

### Build Errors
```bash
# If build fails:
1. Clean cache: pnpm clean
2. Reinstall: rm -rf node_modules && pnpm install
3. Rebuild: pnpm build
```

### Strapi Content Issues
```bash
# If content doesn't appear:
1. Check Strapi admin: http://localhost:1337/admin
2. Ensure content is published (not draft)
3. Verify API permissions in Settings > API Tokens
4. Check frontend API connection in browser console
```

## 🎯 Content Setup

### Initial Strapi Configuration
1. **Create Admin User**: Visit http://localhost:1337/admin on first run
2. **Seed Sample Data**: Run `cd apps/strapi && pnpm seed:example`
3. **Configure API Tokens**: Settings > API Tokens > Create new token
4. **Set Permissions**: Settings > Roles & Permissions > Public role

### Frontend Integration
1. **Update Environment**: Add Strapi URL and API token to web app
2. **Test Connection**: Check browser network tab for API calls
3. **Verify Content**: Articles should appear on homepage

## 📚 Next Steps

1. **Explore the Frontend**: Navigate to http://localhost:3000
2. **Access Strapi Admin**: Visit http://localhost:1337/admin
3. **Review Documentation**: Check `docs/` directory for detailed guides
4. **Study Content Types**: Examine `apps/strapi/src/api/` for data models
5. **Read Implementation Plan**: See `docs/plan/index.md` for full roadmap

## 🔗 Useful Links

- **Strapi Documentation**: https://strapi.io/documentation
- **Next.js Documentation**: https://nextjs.org/docs
- **Project Documentation**: See `docs/` directory
- **Component Examples**: Browse `packages/design-system/` and `apps/web/components/`

---

**Ready to build your news platform? Start with `pnpm dev` and create content!** 🎉