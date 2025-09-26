# Auth Package Context (@repo/auth)

## Package Overview
- **Name**: `@repo/auth`
- **Purpose**: Authentication components and utilities for Next.js web app
- **Technology**: NextAuth.js v5.0.0 (beta) with Next.js 15.3

## Architecture

### Core Dependencies
- **next-auth**: 5.0.0-beta.29 (main auth provider)
- **@t3-oss/env-nextjs**: Environment validation
- **zod**: Schema validation
- **next-themes**: Theme management integration
- **server-only**: Server-side utilities

### File Structure
```
packages/auth/
├── index.ts           # Main exports (auth, authKit, handlers, signIn, signOut)
├── server.ts          # Server-side auth utilities (currentUser, types)
├── client.tsx         # Client components (UserButton, OrganizationSwitcher)
├── provider.tsx       # Auth provider wrapper
├── middleware.ts      # Auth middleware
├── keys.ts           # Auth configuration keys
├── components/
│   ├── sign-in.tsx   # Sign-in component
│   └── sign-up.tsx   # Sign-up component
└── package.json      # Package configuration
```

## Key Symbols

### index.ts Exports
- `auth`: Main auth function with session handling
- `authKit`: Core NextAuth configuration
- `handlers`: Auth route handlers
- `signIn`/`signOut`: Authentication actions

### server.ts Types & Functions
- `currentUser`: Server-side user retrieval
- Type definitions: `UserJSON`, `OrganizationJSON`, `OrganizationMembership`, etc.
- Webhook types: `WebhookEvent`, `DeletedObjectJSON`

### client.tsx Components  
- `UserButton`: User profile/menu component
- `OrganizationSwitcher`: Organization selection component
- `useUser`: Client-side user hook

## Implementation Notes

### Auth Flow
1. Uses NextAuth.js v5 beta with modern App Router support
2. Integrates placeholder organization system ("default-org")
3. Provides redirect functionality for unauthenticated users
4. Server-side and client-side utilities for different contexts

### Integration Points
- Middleware for route protection
- Provider wrapper for React context
- Pre-built sign-in/sign-up components
- Organization-aware auth structure (future multi-tenant support)

### Development Status
- Uses beta version of NextAuth.js (5.0.0-beta.29)
- Placeholder organization system implemented
- Ready for integration with web app authentication flows