# Technology Stack

## Core Technologies
- **Frontend**: Next.js 15.3.2 with React 19.1.0
- **Backend**: Strapi 5.16.0 (headless CMS)
- **Language**: TypeScript 5.8.3 with strict mode enabled
- **Package Manager**: pnpm 10.13.1
- **Monorepo**: Turborepo 2.5.3 with pnpm workspaces

## Development Environment
- **Node.js**: >=18.0.0 <=22.x.x (Strapi requirement)
- **Database**: SQLite (development), PostgreSQL (production)
- **Code Quality**: Biome 1.9.4 with "ultracite" preset
- **Testing**: Vitest 3.1.4
- **Styling**: Tailwind CSS v4.1.7

## Key Dependencies
### Frontend (Next.js app)
- **UI Components**: Radix UI primitives, Lucide React icons
- **Internationalization**: Built-in i18n support
- **SEO**: Built-in metadata and JSON-LD utilities
- **MDX**: mdx-bundler for rich content
- **Date Handling**: date-fns
- **Schema Validation**: Zod

### Backend (Strapi)
- **CMS Framework**: Strapi 5.16.0
- **Database**: PostgreSQL (pg 8.8.0) for production
- **File Storage**: Local uploads with image processing
- **Authentication**: Built-in users-permissions plugin

### Shared Packages
- **Design System**: shadcn/ui components with Radix primitives
- **Strapi Client**: Custom API client with caching and rate limiting
- **Internationalization**: Multi-language dictionaries
- **SEO**: Metadata and structured data utilities
- **Authentication**: Shared auth components
- **Storage**: File handling utilities
- **Payments**: Payment processing utilities

## Build Tools
- **Monorepo Management**: Turborepo with task orchestration
- **Code Formatting**: Biome (ultracite preset)
- **Type Checking**: TypeScript with strict configuration
- **Bundle Analysis**: Next.js analyzer
- **Dependency Management**: pnpm with workspace protocol