# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

**StrapiPress** is a production-ready headless CMS starter that combines Strapi with Next.js. It's designed as a modern WordPress alternative for developers who want quick, cheap, and professional website building capabilities.

This is a hybrid monorepo combining next-forge (a Turborepo template) with Strapi CMS. It provides a headless CMS backend with a modern Next.js frontend, using shared packages for common functionality.

## Key Commands

### Development
- `pnpm dev` - Start all applications in development mode
- `pnpm dev:web` - Start only the Next.js web app (port 3000)
- `pnpm dev:strapi` - Start only the Strapi CMS backend
- `cd apps/strapi && pnpm develop` - Alternative way to start Strapi in development

### Building
- `pnpm build` - Build all applications and packages
- `pnpm build --filter=web` - Build only the web app
- `pnpm build --filter=@repo/strapi` - Build only the Strapi app
- `pnpm analyze` - Analyze bundle sizes (web app)

### Code Quality
- `pnpm lint` - Run Ultracite linting across the entire codebase
- `pnpm format` - Format code using Ultracite (Biome under the hood)
- `pnpm typecheck` - Run TypeScript type checking across all apps

### Testing
- `pnpm test` - Run all tests using Vitest
- `pnpm test --filter=web` - Run tests for web app only
- `pnpm test --filter=@repo/[package]` - Run tests for specific package

### Strapi Specific
- `cd apps/strapi && pnpm seed:example` - Seed Strapi with example data
- `cd apps/strapi && pnpm strapi console` - Open Strapi interactive console
- `cd apps/strapi && pnpm upgrade` - Upgrade Strapi to latest version

### Translation
- `pnpm translate` - Run translation workflows for internationalization

### Utilities
- `pnpm bump-deps` - Update all dependencies to latest versions
- `pnpm bump-ui` - Update shadcn/ui components in design system
- `pnpm boundaries` - Check workspace boundaries and dependencies
- `pnpm clean` - Clean all node_modules and generated files

## Architecture

### Monorepo Structure
The project uses Turborepo with pnpm workspaces:

- **`/apps/*`** - Main applications
  - `strapi/` - Strapi CMS backend with content types, controllers, and API routes
  - `web/` - Next.js frontend with internationalization support

- **`/packages/*`** - Shared packages
  - `auth/` - Authentication components and utilities
  - `design-system/` - UI components built on shadcn/ui and Radix
  - `internationalization/` - i18n dictionaries and utilities
  - `next-config/` - Shared Next.js configuration
  - `payments/` - Payment processing utilities
  - `seo/` - SEO metadata and JSON-LD utilities
  - `storage/` - File storage utilities
  - `strapi-client/` - Strapi API client and services
  - `typescript-config/` - Shared TypeScript configurations

### Technology Stack
- **Frontend**: Next.js 15.3 with React 19, Tailwind CSS v4
- **Backend**: Strapi 5.16.0 (headless CMS)
- **Language**: TypeScript with strict mode
- **Database**: SQLite (development), PostgreSQL (production)
- **Internationalization**: Built-in i18n with multiple language support
- **Styling**: Tailwind CSS with design system components
- **Monorepo**: Turborepo with pnpm workspaces

### Strapi Architecture
- **Content Types**: Article, Author, Category, About, Global (in `apps/strapi/src/api/`)
- **Components**: Shared components like Media, Quote, Rich Text, SEO, Slider
- **Database**: SQLite for development, supports PostgreSQL for production
- **File Storage**: Local uploads with image processing and multiple sizes
- **API**: RESTful API with customizable controllers and services

### Key Patterns
1. **Headless CMS**: Strapi provides content API, Next.js consumes it via `@repo/strapi-client`
2. **Monorepo Packages**: Shared functionality extracted to workspace packages with `@repo/*` naming
3. **Internationalization**: Multi-language support with dictionaries in JSON format
4. **Design System**: Centralized UI components in `@repo/design-system`
5. **Type Safety**: Generated Strapi types and strict TypeScript configuration
6. **Code Quality**: Biome with "ultracite" preset for consistent formatting

### Development Workflow
1. Start Strapi backend first: `pnpm dev:strapi`
2. Start Next.js frontend: `pnpm dev:web`
3. Use Strapi admin panel at `http://localhost:1337/admin` for content management
4. Frontend consumes Strapi API via the `@repo/strapi-client` package
5. All workspace packages referenced as `@repo/*`

### Strapi Content Structure
- **Articles**: Blog posts with rich content, categories, and authors
- **Authors**: Content creators with profile information and social links
- **Categories**: Article categorization system
- **About**: Static page content with flexible components
- **Global**: Site-wide settings and metadata
- **Components**: Reusable content blocks (Media, Quote, Rich Text, SEO, Slider)

### Important Notes
- Node.js version: 18.0.0 to 22.x.x (Strapi requirement)
- Package manager: pnpm (configured in packageManager field)
- Strapi generates TypeScript types automatically in `apps/strapi/types/generated/`
- Content API accessible at `http://localhost:1337/api/` in development
- Upload files stored in `apps/strapi/public/uploads/` with multiple size variants
- Web app runs on port 3001 in development (not 3000)
- Strapi client includes built-in rate limiting and caching for free tier optimization
- Internationalization middleware handles locale routing automatically