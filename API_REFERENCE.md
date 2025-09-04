# next-forge API Reference

**Comprehensive API documentation for next-forge applications and packages**

## 🌐 API Endpoints

### Authentication API
**Base URL**: `http://localhost:3002/api/auth` (development)

#### POST /api/auth/[...nextauth]
NextAuth.js authentication handler
- **Methods**: GET, POST
- **Description**: Handles authentication flows
- **Integration**: Clerk provider configuration

### Collaboration API  
**Base URL**: `http://localhost:3002/api/collaboration`

#### POST /api/collaboration/auth
Liveblocks authentication endpoint
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Liveblocks access token
- **Purpose**: Real-time collaboration authentication

### Health Monitoring
**Base URL**: `http://localhost:3002`

#### GET /health
API health check endpoint
- **Response**: `{ status: "ok", timestamp: "..." }`
- **Purpose**: Service monitoring and uptime checks

### Webhook Endpoints
**Base URL**: `http://localhost:3002/webhooks`

#### POST /webhooks/auth
Authentication webhook handler
- **Provider**: Clerk webhooks
- **Events**: user.created, user.updated, user.deleted
- **Security**: Webhook signature verification

#### POST /webhooks/payments  
Payment webhook handler
- **Provider**: Payment processor webhooks
- **Events**: payment.succeeded, payment.failed
- **Security**: Webhook signature verification

## 📦 Package APIs

### @repo/auth
Authentication utilities and components

#### Server-side Functions
```typescript
// Get current user
import { currentUser } from '@repo/auth/server'
const user = await currentUser()

// Protect API routes
import { requireAuth } from '@repo/auth/server'
await requireAuth() // Throws if not authenticated
```

#### Client Components
```typescript
// Sign-in component
import { SignIn } from '@repo/auth/components'
<SignIn />

// Sign-up component  
import { SignUp } from '@repo/auth/components'
<SignUp />

// User button with profile
import { UserButton } from '@repo/auth/components'
<UserButton />
```

#### Middleware
```typescript
// Route protection
import { authMiddleware } from '@repo/auth/middleware'
export default authMiddleware()
```

### @repo/database
Prisma database client and utilities

#### Database Client
```typescript
import { db } from '@repo/database'

// Example queries
const users = await db.user.findMany()
const user = await db.user.findUnique({ where: { id } })
```

#### Generated Types
```typescript
// Auto-generated Prisma types
import type { User, Post, Category } from '@repo/database/generated/client'
```

### @repo/design-system
shadcn/ui components and utilities

#### Core Components
```typescript
// Button variants
import { Button } from '@repo/design-system/button'
<Button variant="default | destructive | outline | secondary | ghost | link">

// Form components
import { Input, Label, Textarea } from '@repo/design-system'
import { Select, SelectContent, SelectItem } from '@repo/design-system'

// Layout components
import { Card, CardHeader, CardContent } from '@repo/design-system'
import { Separator } from '@repo/design-system'
```

#### Utility Functions
```typescript
// Class name utilities
import { cn } from '@repo/design-system/lib/utils'
const className = cn("base-class", conditionalClass && "conditional")

// Component variants
import { buttonVariants } from '@repo/design-system/button'
const buttonClass = buttonVariants({ variant: "destructive", size: "sm" })
```

### @repo/analytics
PostHog analytics integration

#### Client-side Tracking
```typescript
// PostHog provider
import { PostHogProvider } from '@repo/analytics/posthog/client'
<PostHogProvider>
  <App />
</PostHogProvider>

// Track events
import { usePostHog } from 'posthog-js/react'
const posthog = usePostHog()
posthog.capture('button_clicked', { button_name: 'signup' })
```

#### Server-side Analytics
```typescript
// Server-side PostHog
import { PostHogServer } from '@repo/analytics/posthog/server'
const posthog = new PostHogServer()
await posthog.capture('server_event', { user_id: userId })
```

### @repo/collaboration
Liveblocks real-time collaboration

#### Room Provider
```typescript
import { CollaborationProvider } from '@repo/collaboration'
<CollaborationProvider roomId="room-123">
  <CollaborativeEditor />
</CollaborationProvider>
```

#### Hooks
```typescript
// User presence
import { useOthers, useSelf } from '@repo/collaboration'
const others = useOthers()
const self = useSelf()

// Live cursors
import { useCursors } from '@repo/collaboration'
const cursors = useCursors()
```

### @repo/payments
Payment processing utilities

#### Stripe Integration
```typescript
// Server-side payment creation
import { createPaymentIntent } from '@repo/payments'
const paymentIntent = await createPaymentIntent({
  amount: 2000, // $20.00
  currency: 'usd'
})

// Client-side components  
import { PaymentForm } from '@repo/payments/components'
<PaymentForm clientSecret={paymentIntent.client_secret} />
```

### @repo/notifications
Notification system

#### Toast Notifications
```typescript
// Toast provider
import { Toaster } from '@repo/notifications'
<Toaster />

// Show notifications
import { toast } from '@repo/notifications'
toast.success("Operation completed")
toast.error("Something went wrong")
toast.loading("Processing...")
```

#### Push Notifications
```typescript
// Register service worker
import { registerPushNotifications } from '@repo/notifications'
await registerPushNotifications()

// Send notification
import { sendPushNotification } from '@repo/notifications/server'
await sendPushNotification(userId, {
  title: "New message",
  body: "You have a new message"
})
```

### @repo/feature-flags
Feature flag management

#### Client Usage
```typescript
import { useFeatureFlag } from '@repo/feature-flags'

function MyComponent() {
  const isEnabled = useFeatureFlag('new-feature')
  return isEnabled ? <NewFeature /> : <OldFeature />
}
```

#### Server Usage
```typescript
import { getFeatureFlag } from '@repo/feature-flags/server'
const isEnabled = await getFeatureFlag('new-feature', userId)
```

### @repo/email
Email templates and sending

#### Email Templates
```typescript
// React email templates
import { WelcomeEmail } from '@repo/email/templates'
<WelcomeEmail userName="John" />
```

#### Sending Emails
```typescript
import { sendEmail } from '@repo/email/server'
await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  template: 'welcome',
  data: { userName: 'John' }
})
```

### @repo/security
Security utilities and middleware

#### Rate Limiting
```typescript
import { rateLimit } from '@repo/security/rate-limit'

// API route protection
export const GET = rateLimit(async (request) => {
  // Your API logic
})
```

#### CSRF Protection
```typescript
import { csrfProtection } from '@repo/security/csrf'
export const POST = csrfProtection(handler)
```

### @repo/observability
Monitoring and error tracking

#### Sentry Integration
```typescript
// Error boundary
import { ErrorBoundary } from '@repo/observability'
<ErrorBoundary fallback={ErrorFallback}>
  <App />
</ErrorBoundary>

// Manual error tracking
import { captureException } from '@repo/observability'
try {
  riskyOperation()
} catch (error) {
  captureException(error)
}
```

#### Performance Monitoring
```typescript
import { withPerformanceMonitoring } from '@repo/observability'
export const handler = withPerformanceMonitoring(async () => {
  // Your code
})
```

## 🔧 Configuration APIs

### Environment Variables
Type-safe environment variable handling

```typescript
// apps/app/env.ts
import { createEnv } from '@t3-oss/env-nextjs'

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    CLECK_SECRET_KEY: z.string()
  },
  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string()
  }
})
```

### Next.js Configuration
Shared Next.js configuration

```typescript
// next.config.ts
import { withNextConfig } from '@repo/next-config'

export default withNextConfig({
  // Your custom config
})
```

### TypeScript Configuration
Shared TypeScript settings

```json
// tsconfig.json
{
  "extends": "@repo/typescript-config/nextjs.json"
}
```

## 🧪 Testing APIs

### Test Utilities
```typescript
// Vitest setup
import { render, screen } from '@repo/testing'
import { expect, test } from 'vitest'

test('renders component', () => {
  render(<MyComponent />)
  expect(screen.getByText('Hello')).toBeInTheDocument()
})
```

### Mock Providers
```typescript
// Test providers
import { TestProviders } from '@repo/testing/providers'
render(
  <TestProviders>
    <ComponentToTest />
  </TestProviders>
)
```

## 📊 Build & Development APIs

### Turborepo Tasks
Available tasks defined in `turbo.json`:

- **build**: Build all applications
- **dev**: Start development servers
- **test**: Run test suites
- **lint**: Code linting
- **clean**: Clean build artifacts

### Package Scripts
Common scripts across packages:

```json
{
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest",
    "lint": "ultracite lint",
    "typecheck": "tsc --noEmit"
  }
}
```

---

*For the latest API documentation, see individual package README files and TypeScript definitions.*