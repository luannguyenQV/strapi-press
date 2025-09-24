# Codebase Structure

## Monorepo Architecture
StrapiPress uses Turborepo with pnpm workspaces in a hybrid monorepo structure.

### Root Level
```
/
├── apps/                 # Main applications
├── packages/            # Shared packages
├── docs/               # Documentation
├── scripts/            # Utility scripts
├── .github/            # GitHub workflows
├── turbo.json          # Turborepo configuration
├── pnpm-workspace.yaml # pnpm workspace configuration
├── package.json        # Root package configuration
└── biome.json          # Code quality configuration
```

## Applications (`/apps/*`)

### `/apps/strapi/` - Strapi CMS Backend
- **Purpose**: Headless CMS providing content API
- **Structure**:
  - `src/api/` - Content types (article, author, category, about, global)
  - `src/components/` - Reusable content components
  - `config/` - Strapi configuration
  - `public/uploads/` - File storage
- **Key Files**:
  - `package.json` - Strapi dependencies
  - `types/generated/` - Auto-generated TypeScript types

### `/apps/web/` - Next.js Frontend
- **Purpose**: React frontend consuming Strapi API
- **Port**: 3001 (development)
- **Structure**:
  - `app/` - Next.js App Router structure
  - `app/[locale]/` - Internationalized routes
  - `components/` - React components
- **Dependencies**: Uses workspace packages extensively

## Shared Packages (`/packages/*`)

### Core Infrastructure
- **`@repo/typescript-config`** - Shared TypeScript configurations
- **`@repo/next-config`** - Next.js configuration utilities

### Content & API
- **`@repo/strapi-client`** - Strapi API client with caching and rate limiting
- **`@repo/seo`** - SEO metadata and JSON-LD utilities
- **`@repo/internationalization`** - i18n dictionaries and utilities

### UI & Design
- **`@repo/design-system`** - UI components (shadcn/ui + Radix)
- **`@repo/auth`** - Authentication components and utilities

### Features
- **`@repo/payments`** - Payment processing utilities
- **`@repo/storage`** - File storage utilities

## Dependency Flow
```
apps/web → packages/* (design-system, strapi-client, seo, etc.)
apps/strapi → (standalone, excluded from workspace)
packages/* → @repo/typescript-config (shared configs)
```

## Special Configurations

### Workspace Exclusion
- `apps/strapi` is excluded from pnpm workspace (independent Strapi installation)
- All other packages use workspace protocol for internal dependencies

### Build Outputs
- `.next/` - Next.js build output
- `dist/` - Package build outputs
- `.strapi/` - Strapi build cache
- `storybook-static/` - Storybook builds

### Content Types (Strapi)
1. **Article** - Blog posts with rich content
2. **Author** - Content creators with profiles
3. **Category** - Article categorization
4. **About** - Static page content
5. **Global** - Site-wide settings
6. **Footer** - Footer configuration