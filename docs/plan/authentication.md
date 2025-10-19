# Authentication Implementation Plan - Better Auth

## Overview

Implement complete authentication system for `apps/web/` using **Better Auth** with:
- Email/password authentication
- Google OAuth social login
- Facebook OAuth social login
- Protected routes and session management
- Type-safe authentication with full TypeScript support

## Why Better Auth?

**Better Auth** is a modern, framework-agnostic authentication library specifically designed for TypeScript applications.

### Key Advantages
- ✅ **Framework-Agnostic**: Works seamlessly with Next.js, no vendor lock-in
- ✅ **Type-Safe**: Full TypeScript support with auto-generated types
- ✅ **Modern Architecture**: Built for React Server Components and App Router
- ✅ **Built-in OAuth**: Native support for 50+ providers including Google, Facebook
- ✅ **Plugin Ecosystem**: Extensible with plugins (2FA, magic links, passkeys, etc.)
- ✅ **Database Agnostic**: Works with PostgreSQL, MySQL, SQLite, etc.
- ✅ **Edge Compatible**: Runs on Vercel Edge, Cloudflare Workers
- ✅ **httpOnly Cookies**: Secure session management out of the box
- ✅ **Better Auth UI**: Ready-made shadcn/ui components available

### Comparison to Alternatives
- **vs NextAuth/Auth.js**: Better TypeScript support, simpler API, modern architecture
- **vs Custom Strapi Auth**: Type-safe, better DX, built-in OAuth providers
- **vs Clerk**: Self-hosted, no vendor lock-in, free tier friendly

## Architecture Decision

**Approach**: Pure Better Auth with PostgreSQL database

### Authentication Flow

#### 1. Email/Password Flow
```
User Input → Better Auth API Route → Database
← Session Cookie (httpOnly) ← Redirect to Dashboard
```

#### 2. OAuth Flow (Google/Facebook)
```
Button Click → Better Auth OAuth → Provider Auth
→ Better Auth Callback ← OAuth Token
→ Create/Link Account → Database ← Session Cookie ← Dashboard
```

#### 3. Protected Routes
```
Request → Middleware → Validate Session Cookie → Allow/Redirect
```

## Current State Analysis

### Existing Infrastructure
- ✅ Next.js 15.3 with App Router
- ✅ PostgreSQL database (via Strapi, but can be shared)
- ✅ TanStack Query for data fetching
- ✅ shadcn/ui design system
- ✅ Internationalization middleware
- ✅ TypeScript with strict mode

### Needs Implementation
- ⚠️ Better Auth installation and configuration
- ⚠️ Database schema (Better Auth tables)
- ⚠️ OAuth provider setup (Google, Facebook)
- ⚠️ API routes for authentication
- ⚠️ Login/Register UI components
- ⚠️ Protected route middleware
- ⚠️ Auth state management with React hooks

## Implementation Phases

### Phase 1: Installation & Database Setup (2-3 hours)

#### 1.1 Install Better Auth

```bash
cd apps/web
pnpm add better-auth
pnpm add -D @better-auth/cli
```

#### 1.2 Database Decision

**Option A: Use Strapi's PostgreSQL Database** (Recommended)
- Pros: Single database, simpler infrastructure
- Cons: Better Auth and Strapi share same DB

**Option B: Separate PostgreSQL Database**
- Pros: Complete separation, cleaner architecture
- Cons: Additional database to manage

**Recommendation**: Start with Option A (shared database), migrate to separate DB if needed.

#### 1.3 Configure Database Connection

**File**: `apps/web/lib/auth/db.ts`

```typescript
import { Pool } from 'pg';

// Use the same DATABASE_URL as Strapi (or separate one)
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
```

#### 1.4 Generate Database Schema

```bash
cd apps/web
pnpm better-auth migrate
```

This creates Better Auth tables:
- `user` - User accounts
- `session` - Active sessions
- `account` - OAuth provider accounts
- `verification` - Email verification tokens

#### 1.5 Environment Variables

**File**: `apps/web/.env`

```bash
# Database (can share with Strapi or use separate)
DATABASE_URL=postgresql://user:password@localhost:5432/strapi

# Better Auth
BETTER_AUTH_SECRET=[generate with: openssl rand -base64 32]
BETTER_AUTH_URL=http://localhost:3001

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
```

---

### Phase 2: Better Auth Configuration (2-3 hours)

#### 2.1 Create Auth Instance

**File**: `apps/web/lib/auth/auth.ts`

```typescript
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { pool } from "./db";

export const auth = betterAuth({
  database: pool,

  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true for production
  },

  // Social OAuth providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`,
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/facebook`,
    },
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache session in cookie for 5 minutes
    },
  },

  // Next.js integration - must be last plugin
  plugins: [nextCookies()],
});

// Export types for TypeScript
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
```

#### 2.2 Create Auth API Route

**File**: `apps/web/app/api/auth/[...all]/route.ts`

```typescript
import { auth } from "@/lib/auth/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Export GET and POST handlers
export const { GET, POST } = toNextJsHandler(auth);
```

This single route handles ALL Better Auth endpoints:
- `/api/auth/sign-in/email` - Email/password sign in
- `/api/auth/sign-up/email` - Email/password sign up
- `/api/auth/sign-in/social` - OAuth sign in
- `/api/auth/callback/google` - Google OAuth callback
- `/api/auth/callback/facebook` - Facebook OAuth callback
- `/api/auth/sign-out` - Sign out
- `/api/auth/get-session` - Get current session

---

### Phase 3: OAuth Provider Setup (1-2 hours)

#### 3.1 Google OAuth Setup

**Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable **Google+ API**
4. Navigate to: **Credentials → Create Credentials → OAuth 2.0 Client ID**
5. Configure OAuth consent screen:
   - User Type: External
   - Add test users for development
6. Application type: **Web application**
7. Authorized JavaScript origins: `http://localhost:3001`
8. Authorized redirect URIs: `http://localhost:3001/api/auth/callback/google`
9. Copy **Client ID** and **Client Secret**
10. Add to `apps/web/.env`:
    ```bash
    GOOGLE_CLIENT_ID=your-client-id-here
    GOOGLE_CLIENT_SECRET=your-client-secret-here
    ```

#### 3.2 Facebook OAuth Setup

**Steps:**
1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create new app → **Consumer**
3. Add **Facebook Login** product
4. Settings → Basic:
   - Copy **App ID** and **App Secret**
5. Facebook Login → Settings:
   - Valid OAuth Redirect URIs: `http://localhost:3001/api/auth/callback/facebook`
6. Add to `apps/web/.env`:
    ```bash
    FACEBOOK_CLIENT_ID=your-app-id-here
    FACEBOOK_CLIENT_SECRET=your-app-secret-here
    ```

---

### Phase 4: React Client Setup (2-3 hours)

#### 4.1 Create Auth Client

**File**: `apps/web/lib/auth/client.ts`

```typescript
"use client";

import { createAuthClient } from "better-auth/react";
import type { Session, User } from "./auth";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

// Export hooks with proper types
export { authClient };

// Typed session hook
export const useSession = () => {
  return authClient.useSession() as {
    data: Session | null;
    isPending: boolean;
    error: Error | null;
  };
};
```

#### 4.2 Update Root Layout with Auth Provider

**File**: `apps/web/app/[locale]/layout.tsx`

Add the session provider from Better Auth:

```typescript
import { SessionProvider } from "better-auth/react";
import { Providers } from "@/lib/providers";

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <html lang={locale}>
      <body>
        <SessionProvider>
          <Providers>
            {children}
          </Providers>
        </SessionProvider>
      </body>
    </html>
  );
}
```

---

### Phase 5: Authentication UI (6-8 hours)

#### 5.1 Login Page

**File**: `apps/web/app/[locale]/login/page.tsx`

```typescript
import { Suspense } from 'react';
import { getDictionary } from '@repo/internationalization';
import { LoginForm } from './components/login-form';
import { OAuthButtons } from './components/oauth-buttons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';

export default async function LoginPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{dictionary.auth.login.title}</CardTitle>
          <CardDescription>
            {dictionary.auth.login.subtitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Suspense fallback={<div>Loading...</div>}>
            <LoginForm dictionary={dictionary} />
            <OAuthButtons dictionary={dictionary} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 5.2 Login Form Component

**File**: `apps/web/app/[locale]/login/components/login-form.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { authClient } from '@/lib/auth/client';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Alert, AlertDescription } from '@repo/design-system/components/ui/alert';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm({ dictionary }: { dictionary: any }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');

    try {
      await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || dictionary.auth.errors.invalidCredentials);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">{dictionary.auth.login.emailLabel}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...register('email')}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{dictionary.auth.login.passwordLabel}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register('password')}
          disabled={isLoading}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? dictionary.auth.login.loggingIn : dictionary.auth.login.submit}
      </Button>
    </form>
  );
}
```

#### 5.3 OAuth Buttons Component

**File**: `apps/web/app/[locale]/login/components/oauth-buttons.tsx`

```typescript
'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth/client';
import { Button } from '@repo/design-system/components/ui/button';
import { Separator } from '@repo/design-system/components/ui/separator';

export function OAuthButtons({ dictionary }: { dictionary: any }) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    setIsLoading(provider);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: '/dashboard',
      });
    } catch (error) {
      console.error('OAuth login failed:', error);
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {dictionary.auth.login.orContinueWith}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleOAuthLogin('google')}
          disabled={isLoading !== null}
        >
          {isLoading === 'google' ? (
            <span className="mr-2 h-4 w-4 animate-spin">⏳</span>
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          Google
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => handleOAuthLogin('facebook')}
          disabled={isLoading !== null}
        >
          {isLoading === 'facebook' ? (
            <span className="mr-2 h-4 w-4 animate-spin">⏳</span>
          ) : (
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          )}
          Facebook
        </Button>
      </div>
    </div>
  );
}
```

#### 5.4 Register Page

**File**: `apps/web/app/[locale]/register/page.tsx`

```typescript
import { Suspense } from 'react';
import { getDictionary } from '@repo/internationalization';
import { RegisterForm } from './components/register-form';
import { OAuthButtons } from '../login/components/oauth-buttons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';

export default async function RegisterPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{dictionary.auth.register.title}</CardTitle>
          <CardDescription>
            {dictionary.auth.register.subtitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Suspense fallback={<div>Loading...</div>}>
            <RegisterForm dictionary={dictionary} />
            <OAuthButtons dictionary={dictionary} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 5.5 Register Form Component

**File**: `apps/web/app/[locale]/register/components/register-form.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { authClient } from '@/lib/auth/client';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Alert, AlertDescription } from '@repo/design-system/components/ui/alert';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm({ dictionary }: { dictionary: any }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError('');

    try {
      await authClient.signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || dictionary.auth.errors.userExists);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">{dictionary.auth.register.nameLabel}</Label>
        <Input
          id="name"
          type="text"
          autoComplete="name"
          {...register('name')}
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{dictionary.auth.register.emailLabel}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...register('email')}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{dictionary.auth.register.passwordLabel}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register('password')}
          disabled={isLoading}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">
          {dictionary.auth.register.confirmPasswordLabel}
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...register('confirmPassword')}
          disabled={isLoading}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? dictionary.auth.register.registering : dictionary.auth.register.submit}
      </Button>
    </form>
  );
}
```

---

### Phase 6: Middleware & Route Protection (2-3 hours)

#### 6.1 Update Middleware

**File**: `apps/web/middleware.ts`

```typescript
import { internationalizationMiddleware } from '@repo/internationalization/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};

const protectedRoutes = ['/dashboard', '/profile', '/account', '/settings'];
const authRoutes = ['/login', '/register'];

async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route) || pathname.includes(route)
  );

  // Check if route is auth route (login/register)
  const isAuthRoute = authRoutes.some(route => pathname.includes(route));

  // For protected routes, check session
  if (isProtectedRoute) {
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session) {
        const url = new URL('/login', request.url);
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
      }
    } catch (error) {
      // Session validation failed, redirect to login
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute) {
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (session) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch {
      // Not authenticated, allow access to auth routes
    }
  }

  return NextResponse.next();
}

const middleware = async (request: NextRequest) => {
  // First apply i18n middleware
  const i18nResponse = internationalizationMiddleware(request);

  // Then apply auth middleware
  const authResponse = await authMiddleware(request);

  // Return auth response if redirecting, otherwise i18n response
  return authResponse.status === 307 ? authResponse : i18nResponse;
};

export default middleware;
```

---

### Phase 7: Dashboard & User Components (3-4 hours)

#### 7.1 Protected Dashboard Page

**File**: `apps/web/app/[locale]/dashboard/page.tsx`

```typescript
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserButton } from './components/user-button';

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session.user.name}!
          </p>
        </div>
        <UserButton user={session.user} />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold">Profile</h2>
          <dl className="mt-4 space-y-2">
            <div>
              <dt className="text-sm text-muted-foreground">Name</dt>
              <dd className="font-medium">{session.user.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Email</dt>
              <dd className="font-medium">{session.user.email}</dd>
            </div>
          </dl>
        </div>

        {/* Add more dashboard cards as needed */}
      </div>
    </div>
  );
}
```

#### 7.2 User Button Component

**File**: `apps/web/app/[locale]/dashboard/components/user-button.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import { Button } from '@repo/design-system/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/design-system/components/ui/avatar';

interface UserButtonProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
}

export function UserButton({ user }: UserButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await authClient.signOut();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Sign out failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            {user.image && <AvatarImage src={user.image} alt={user.name} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/profile')}>
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/settings')}>
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} disabled={isLoading}>
          {isLoading ? 'Signing out...' : 'Sign out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

### Phase 8: Internationalization (2-3 hours)

#### 8.1 Add Auth Translations

**File**: `packages/internationalization/dictionaries/en.json`

Add this section:

```json
{
  "auth": {
    "login": {
      "title": "Welcome Back",
      "subtitle": "Sign in to your account",
      "emailLabel": "Email",
      "passwordLabel": "Password",
      "submit": "Sign In",
      "loggingIn": "Signing in...",
      "orContinueWith": "Or continue with",
      "noAccount": "Don't have an account?",
      "signUp": "Sign up",
      "forgotPassword": "Forgot password?"
    },
    "register": {
      "title": "Create Account",
      "subtitle": "Get started with your free account",
      "nameLabel": "Full Name",
      "emailLabel": "Email",
      "passwordLabel": "Password",
      "confirmPasswordLabel": "Confirm Password",
      "submit": "Create Account",
      "registering": "Creating account...",
      "hasAccount": "Already have an account?",
      "signIn": "Sign in"
    },
    "errors": {
      "invalidCredentials": "Invalid email or password",
      "userExists": "User already exists with this email",
      "weakPassword": "Password is too weak",
      "emailInvalid": "Please enter a valid email",
      "passwordMismatch": "Passwords do not match",
      "oauthFailed": "Authentication failed. Please try again."
    }
  }
}
```

Repeat for other language files with appropriate translations.

---

## Environment Variables Reference

### Next.js Frontend (`apps/web/.env`)

```bash
# Database (can share with Strapi or use separate)
DATABASE_URL=postgresql://user:password@localhost:5432/strapi

# Better Auth Configuration
BETTER_AUTH_SECRET=[generate with: openssl rand -base64 32]
BETTER_AUTH_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3001

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret

# Strapi (existing)
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
```

---

## File Structure Summary

### New Files to Create

```
apps/web/
├── lib/auth/
│   ├── auth.ts              # Better Auth instance
│   ├── client.ts            # React client hooks
│   └── db.ts                # Database connection
├── app/api/auth/[...all]/
│   └── route.ts             # Auth API handler
├── app/[locale]/login/
│   ├── page.tsx
│   └── components/
│       ├── login-form.tsx
│       └── oauth-buttons.tsx
├── app/[locale]/register/
│   ├── page.tsx
│   └── components/
│       └── register-form.tsx
└── app/[locale]/dashboard/
    ├── page.tsx
    └── components/
        └── user-button.tsx
```

### Files to Modify

```
apps/web/middleware.ts                              # Add auth middleware
apps/web/app/[locale]/layout.tsx                    # Add SessionProvider
packages/internationalization/dictionaries/*.json   # Add auth translations
```

---

## Testing Strategy

### Manual Testing Checklist

- [ ] Email/password registration creates user in database
- [ ] Email/password login works and creates session
- [ ] Google OAuth login works and redirects properly
- [ ] Facebook OAuth login works and redirects properly
- [ ] Protected routes redirect to login when not authenticated
- [ ] Authenticated users can't access /login or /register
- [ ] Logout clears session and redirects to login
- [ ] Session persists across page refreshes
- [ ] Error messages display correctly
- [ ] Mobile UI is usable and responsive
- [ ] Keyboard navigation works properly
- [ ] Form validation works (email, password strength)
- [ ] Loading states display during async operations

### Database Verification

```sql
-- Check users table
SELECT * FROM user;

-- Check sessions table
SELECT * FROM session;

-- Check OAuth accounts
SELECT * FROM account WHERE provider IN ('google', 'facebook');
```

---

## Security Best Practices

### Implemented Security Measures

1. **Session Security**
   - httpOnly cookies (prevents XSS)
   - Secure flag in production (HTTPS only)
   - SameSite=Lax (prevents CSRF)
   - 7-day session expiration
   - Session refresh every 24 hours

2. **Password Security**
   - Minimum 8 characters (configurable)
   - Bcrypt hashing (Better Auth default)
   - Password confirmation on registration

3. **OAuth Security**
   - State parameter validation (Better Auth handles)
   - PKCE support for public clients
   - Redirect URI validation
   - HTTPS required in production

4. **Database Security**
   - Prepared statements (SQL injection prevention)
   - Connection pooling
   - SSL/TLS in production

---

## Implementation Timeline

| Phase | Description | Estimated Time |
|-------|-------------|----------------|
| 1 | Installation & Database Setup | 2-3 hours |
| 2 | Better Auth Configuration | 2-3 hours |
| 3 | OAuth Provider Setup | 1-2 hours |
| 4 | React Client Setup | 2-3 hours |
| 5 | Authentication UI | 6-8 hours |
| 6 | Middleware & Protection | 2-3 hours |
| 7 | Dashboard & User Components | 3-4 hours |
| 8 | Internationalization | 2-3 hours |
| Testing | Manual & Integration Tests | 4-6 hours |
| **Total** | | **24-35 hours** |

**Estimated Duration**: 1-1.5 weeks for single developer

---

## Success Criteria

### Must Have (MVP)
- ✅ Email/password authentication
- ✅ Google OAuth login
- ✅ Facebook OAuth login
- ✅ User registration with validation
- ✅ Protected routes with middleware
- ✅ Session management (login/logout)
- ✅ User dashboard
- ✅ Mobile responsive UI
- ✅ Basic error handling

### Should Have
- Email verification
- Password reset flow
- Session refresh mechanism
- Rate limiting
- Comprehensive tests
- Accessibility compliance (WCAG 2.1 AA)

### Nice to Have
- Two-factor authentication (2FA plugin)
- Magic link login (plugin)
- Passkey/WebAuthn (plugin)
- Account linking (multiple OAuth)
- Admin panel integration

---

## Potential Challenges & Solutions

### Challenge 1: Database Schema Conflicts
**Issue**: Better Auth tables might conflict with Strapi tables
**Solution**: Use separate PostgreSQL schema or database. Update connection string:
```typescript
// Use schema parameter
const pool = new Pool({
  connectionString: `${process.env.DATABASE_URL}?schema=better_auth`,
});
```

### Challenge 2: Session Cookie Domain
**Issue**: Cookies not working across subdomains
**Solution**: Configure cookie domain in Better Auth:
```typescript
session: {
  cookieOptions: {
    domain: '.yourdomain.com', // Works for all subdomains
  },
}
```

### Challenge 3: OAuth Callback in Development
**Issue**: OAuth providers reject localhost callbacks
**Solution**: Use OAuth proxy plugin or ngrok:
```typescript
import { oAuthProxy } from "better-auth/plugins";

plugins: [
  oAuthProxy({
    currentURL: "http://localhost:3001",
  }),
]
```

### Challenge 4: TypeScript Type Errors
**Issue**: Session type not inferred correctly
**Solution**: Explicitly type the session:
```typescript
import type { Session } from '@/lib/auth/auth';

const session = (await auth.api.getSession()) as Session | null;
```

---

## Migration Path from Current Setup

### If Using NextAuth (packages/auth/)

1. **Keep existing auth package** for reference
2. **Run Better Auth in parallel** during transition
3. **Migrate users**:
   ```sql
   -- Copy users from NextAuth to Better Auth schema
   INSERT INTO user (id, email, name, created_at)
   SELECT id, email, name, created_at FROM next_auth_users;
   ```
4. **Update all auth calls** from NextAuth to Better Auth
5. **Remove NextAuth** once migration complete

---

## Advanced Features (Future)

Better Auth supports these through plugins:

### Email Verification
```typescript
import { emailVerification } from "better-auth/plugins";

plugins: [
  emailVerification({
    sendVerificationEmail: async ({ email, token }) => {
      // Send email with token
    },
  }),
]
```

### Two-Factor Authentication
```typescript
import { twoFactor } from "better-auth/plugins";

plugins: [
  twoFactor({
    issuer: "YourApp",
  }),
]
```

### Magic Links
```typescript
import { magicLink } from "better-auth/plugins";

plugins: [
  magicLink({
    sendMagicLink: async ({ email, token }) => {
      // Send magic link email
    },
  }),
]
```

### Passkeys/WebAuthn
```typescript
import { passkey } from "better-auth/plugins";

plugins: [
  passkey({
    rpName: "Your App Name",
    rpID: "yourdomain.com",
  }),
]
```

---

## Next Steps

1. ✅ Review this plan and confirm approach
2. ⚠️ **Decision**: Shared DB vs. Separate DB for Better Auth
3. ⚠️ Set up OAuth credentials (Google, Facebook)
4. ⏳ Begin Phase 1: Installation & Database Setup
5. ⏳ Implement incrementally following phases
6. ⏳ Test thoroughly at each phase
7. ⏳ Document as you go

---

## References

- [Better Auth Documentation](https://better-auth.com)
- [Better Auth GitHub](https://github.com/better-auth/better-auth)
- [Better Auth Next.js Integration](https://better-auth.com/docs/integrations/next)
- [Better Auth Plugins](https://better-auth.com/docs/plugins)
- [Google OAuth Setup](https://console.cloud.google.com)
- [Facebook OAuth Setup](https://developers.facebook.com)

---

**Last Updated**: 2025-10-19
**Status**: Plan Ready - Awaiting Implementation
**Technology**: Better Auth v1.2.9+ with Next.js 15.3
