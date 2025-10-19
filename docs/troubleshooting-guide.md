# Troubleshooting Guide

Comprehensive troubleshooting guide for the StrapiPress platform. This guide covers common issues, diagnostic steps, and solutions for developers, administrators, and content editors.

---

## Table of Contents

1. [Quick Diagnosis](#quick-diagnosis)
2. [Development Environment](#development-environment)
3. [Production Issues](#production-issues)
4. [Strapi Backend](#strapi-backend)
5. [Next.js Frontend](#nextjs-frontend)
6. [Content & Media](#content--media)
7. [Caching & Performance](#caching--performance)
8. [Database Issues](#database-issues)
9. [API & Integration](#api--integration)
10. [Deployment Problems](#deployment-problems)
11. [Error Reference](#error-reference)
12. [Prevention & Monitoring](#prevention--monitoring)

---

## Quick Diagnosis

### Problem Identification Checklist

When encountering an issue, quickly identify the problem area:

**Environment**:
- [ ] Development (localhost:1337/localhost:3000)
- [ ] Production (live site)
- [ ] Both

**Affected Area**:
- [ ] Strapi admin panel
- [ ] Strapi API
- [ ] Next.js frontend
- [ ] Content rendering
- [ ] Media/images
- [ ] Database
- [ ] Deployment

**Impact Level**:
- [ ] **Critical**: Site down, data loss
- [ ] **High**: Major feature broken
- [ ] **Medium**: Minor feature issue
- [ ] **Low**: Cosmetic or performance issue

**Recent Changes**:
- [ ] Code deployment
- [ ] Content update
- [ ] Configuration change
- [ ] Dependencies updated
- [ ] Infrastructure change

---

## Development Environment

### Issue: "Cannot start Strapi development server"

#### Error Message
```bash
$ pnpm dev:strapi
Error: Cannot find module 'strapi'
```

#### Diagnosis
Missing dependencies or incorrect installation.

#### Solutions

**1. Reinstall dependencies**:
```bash
cd apps/strapi
rm -rf node_modules
pnpm install
```

**2. Clear package manager cache**:
```bash
pnpm store prune
rm -rf ~/.pnpm-store
pnpm install
```

**3. Verify Node.js version**:
```bash
node --version  # Should be 18.x - 22.x
```

If using nvm:
```bash
nvm install 20
nvm use 20
```

**4. Check database file**:
```bash
# SQLite database should exist
ls -la apps/strapi/.tmp/data.db

# If missing, Strapi will create on first start
```

---

### Issue: "Port already in use"

#### Error Message
```bash
Error: listen EADDRINUSE: address already in use :::1337
```

#### Diagnosis
Another process is using port 1337 or 3000.

#### Solutions

**Find and kill process**:
```bash
# macOS/Linux
lsof -ti:1337 | xargs kill -9
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :1337
taskkill /PID [process_id] /F
```

**Change port temporarily**:
```bash
# apps/strapi/.env
PORT=1338

# apps/web/package.json
"dev": "next dev --port 3001"
```

---

### Issue: "Module not found" errors

#### Error Message
```bash
Error: Cannot find module '@repo/strapi-client'
```

#### Diagnosis
Monorepo workspace not properly linked.

#### Solutions

**1. Rebuild workspace**:
```bash
# From root
pnpm install
pnpm build
```

**2. Clear Next.js cache**:
```bash
cd apps/web
rm -rf .next
pnpm dev
```

**3. Check turbo cache**:
```bash
# From root
pnpm clean
pnpm install
pnpm build
```

**4. Verify package.json references**:
```json
// apps/web/package.json
{
  "dependencies": {
    "@repo/strapi-client": "workspace:*"
  }
}
```

---

### Issue: "TypeScript errors in IDE"

#### Symptoms
- Red squiggly lines in VSCode
- "Cannot find module" for @repo/* packages
- Type errors for Strapi types

#### Solutions

**1. Restart TypeScript server**:
- VSCode: Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

**2. Regenerate Strapi types**:
```bash
cd apps/strapi
pnpm strapi ts:generate-types
```

**3. Check tsconfig.json paths**:
```json
// apps/web/tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@repo/*": ["../../packages/*/src"]
    }
  }
}
```

**4. Build packages**:
```bash
# From root
pnpm build --filter='@repo/*'
```

---

## Production Issues

### Issue: "500 Internal Server Error"

#### Symptoms
- Website shows generic error page
- API returns 500 status
- Blank white screen

#### Diagnosis Steps

**1. Check server logs**:
```bash
# Vercel
vercel logs [deployment-url]

# Strapi Cloud
# Navigate to Dashboard → Logs
```

**2. Verify environment variables**:
```bash
# Check if all required env vars are set
# Vercel: Settings → Environment Variables
# Strapi Cloud: Settings → Environment Variables

# Required for Next.js:
NEXT_PUBLIC_STRAPI_URL
STRAPI_API_TOKEN
REVALIDATION_SECRET

# Required for Strapi:
DATABASE_URL (production)
API_TOKEN_SALT
ADMIN_JWT_SECRET
JWT_SECRET
APP_KEYS
```

**3. Check API connectivity**:
```bash
curl https://your-strapi.com/api/articles
# Should return JSON, not error page
```

#### Solutions

**Missing environment variables**:
1. Add to Vercel/Strapi dashboard
2. Redeploy application
3. Verify with test request

**Database connection error**:
1. Check DATABASE_URL format
2. Verify database is accessible
3. Check connection limits

**Code errors**:
1. Review deployment logs for stack traces
2. Test locally with production environment
3. Rollback to last working deployment

---

### Issue: "Site shows stale content"

#### Symptoms
- Published articles not appearing
- Updated content not showing
- Old images still visible

#### Diagnosis
Cache revalidation not working.

#### Solutions

**1. Verify webhook is configured**:
```bash
# Strapi Admin
# Settings → Webhooks
# Should have webhook pointing to:
https://yoursite.com/api/revalidate?secret=YOUR_SECRET

# Test webhook
curl -X POST "https://yoursite.com/api/revalidate?secret=YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"model": "article", "entry": {"slug": "test"}}'
```

**2. Manual revalidation**:
```bash
# Trigger full site revalidation
curl -X POST "https://yoursite.com/api/revalidate?secret=YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"model": "global"}'
```

**3. Check revalidation logs**:
```typescript
// apps/web/app/api/revalidate/route.ts
// Add console.log to verify webhook receipt
console.log('[Webhook] Received:', body);
```

**4. Redeploy frontend**:
- Vercel: Deployments → ... → Redeploy
- This clears all cached data

---

### Issue: "404 Not Found for images"

#### Symptoms
- Article cover images broken
- Author avatars not loading
- Media returns 404

#### Diagnosis

**Check image URL**:
```javascript
// Should be:
https://your-strapi.com/uploads/image_abc123.jpg

// Not:
http://localhost:1337/uploads/image_abc123.jpg
```

#### Solutions

**1. Verify NEXT_PUBLIC_STRAPI_URL**:
```bash
# Must be public URL, not localhost
NEXT_PUBLIC_STRAPI_URL=https://your-strapi.com

# Redeploy after changing
```

**2. Check Strapi file upload provider**:
```javascript
// apps/strapi/config/plugins.ts
module.exports = {
  upload: {
    config: {
      provider: 'cloudinary', // or 'local'
      providerOptions: {
        // Cloudinary config
      },
    },
  },
};
```

**3. Verify file exists**:
```bash
# For local provider
ls apps/strapi/public/uploads/

# For Cloudinary
# Check Cloudinary dashboard
```

**4. CORS issues**:
```javascript
// apps/strapi/config/middlewares.ts
module.exports = [
  'strapi::cors', // Ensure this is enabled
  // ...
];
```

---

## Strapi Backend

### Issue: "Cannot access admin panel"

#### Symptoms
- Admin panel blank white screen
- Login page not loading
- "Failed to fetch" error

#### Solutions

**1. Check Strapi is running**:
```bash
# Development
cd apps/strapi
pnpm develop

# Production
# Check Strapi Cloud dashboard status
```

**2. Clear browser cache**:
- Hard reload: Ctrl/Cmd + Shift + R
- Clear site data: DevTools → Application → Clear storage

**3. Check admin build**:
```bash
cd apps/strapi
rm -rf build
pnpm build
pnpm start
```

**4. Verify database connection**:
```bash
# SQLite
ls -la apps/strapi/.tmp/data.db

# PostgreSQL
psql $DATABASE_URL -c "SELECT 1"
```

---

### Issue: "Strapi database reset/data loss"

#### Symptoms
- All content missing
- Admin user gone
- Database appears empty

#### Diagnosis
Database file deleted or misconfigured.

#### Solutions

**Development (SQLite)**:
```bash
# Check if database exists
ls apps/strapi/.tmp/data.db

# If missing, restore from backup
cp apps/strapi/.tmp/data.db.backup apps/strapi/.tmp/data.db

# Or re-seed
cd apps/strapi
pnpm seed:example
```

**Production (PostgreSQL)**:
```bash
# Restore from backup
# Strapi Cloud: Settings → Backups → Restore

# Manual restore
pg_restore -d $DATABASE_URL backup.dump
```

**Prevention**:
- Enable automatic backups (Strapi Cloud)
- Regular manual backups
- Version control for database schema
- Test restore process

---

### Issue: "Strapi API returning 401 Unauthorized"

#### Symptoms
- Frontend cannot fetch content
- API returns "Unauthorized" error
- Articles not loading

#### Diagnosis
API token invalid or missing.

#### Solutions

**1. Verify API token**:
```bash
# apps/web/.env.local
STRAPI_API_TOKEN=abc123...

# Test token
curl -H "Authorization: Bearer $STRAPI_API_TOKEN" \
  https://your-strapi.com/api/articles
```

**2. Regenerate API token**:
```
Strapi Admin:
1. Settings → API Tokens
2. Delete old token
3. Create new token (Full access or Read-only)
4. Copy token
5. Update STRAPI_API_TOKEN in environment variables
6. Redeploy
```

**3. Check token permissions**:
```
API Token settings:
- Token type: Read-only (for frontend)
- Token duration: Unlimited
- Permissions: All content types marked as accessible
```

**4. Public API access**:
```
Settings → Users & Permissions → Roles → Public:
- Find "Article"
- Enable: find, findOne
- Save
```

---

## Next.js Frontend

### Issue: "Hydration errors"

#### Error Message
```
Error: Hydration failed because the initial UI does not match what was rendered on the server.
```

#### Causes
- Server and client render different content
- Using browser-only APIs in server components
- Date/time formatting inconsistencies

#### Solutions

**1. Check server/client component usage**:
```typescript
// ❌ Bad - using browser API in server component
export default function Page() {
  const locale = window.navigator.language; // Error!
  return <div>{locale}</div>;
}

// ✅ Good - use client component
'use client';
export default function Page() {
  const locale = window.navigator.language;
  return <div>{locale}</div>;
}
```

**2. Suppress hydration warnings (use sparingly)**:
```typescript
<div suppressHydrationWarning>
  {new Date().toLocaleDateString()}
</div>
```

**3. Use useEffect for browser-only code**:
```typescript
'use client';
import { useEffect, useState } from 'react';

export default function Component() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <div>{/* Browser-only content */}</div>;
}
```

---

### Issue: "Articles not showing on homepage"

#### Diagnosis Steps

**1. Check if articles exist**:
```bash
curl https://your-strapi.com/api/articles
# Should return articles array
```

**2. Verify fetch in page component**:
```typescript
// apps/web/app/[locale]/(home)/page.tsx
export default async function HomePage() {
  const articles = await getArticles();
  console.log('Articles:', articles); // Debug log
  return <Articles articles={articles} />;
}
```

**3. Check cache revalidation**:
```bash
# Trigger manual revalidation
curl -X POST "https://yoursite.com/api/revalidate?secret=SECRET" \
  -d '{"model": "article"}'
```

#### Solutions

**No articles returned**:
- Verify articles are published (not draft)
- Check `publishedAt` is not in future
- Ensure category is assigned

**Cache issue**:
- Wait 5 minutes for automatic revalidation
- Trigger manual revalidation
- Redeploy frontend

**Query error**:
```typescript
// Check populate configuration
const articles = await cachedFind('articles', {
  populate: {
    author: { populate: ['avatar'] },
    category: true,
    cover: true,
  },
  filters: {
    publishedAt: { $notNull: true }, // Only published
  },
});
```

---

### Issue: "Build fails in production"

#### Error Message
```bash
Error: Failed to compile Next.js application
```

#### Common Causes & Solutions

**1. TypeScript errors**:
```bash
# Fix locally first
pnpm typecheck

# Review errors
# Fix all type errors before deploying
```

**2. Missing environment variables**:
```bash
# Build fails if accessing process.env.REQUIRED_VAR
# without fallback

# ✅ Good
const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

# ❌ Bad
const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL; // Undefined in build
```

**3. Import errors**:
```typescript
// ❌ Bad - importing server-only code in client component
'use client';
import { cookies } from 'next/headers'; // Error!

// ✅ Good - use client-safe alternatives
'use client';
import { useState } from 'react';
```

**4. Out of memory**:
```json
// vercel.json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next",
      "config": {
        "maxLambdaSize": "50mb"
      }
    }
  ]
}
```

---

## Content & Media

### Issue: "Cannot upload images in Strapi"

#### Error Messages
- "Upload failed"
- "File too large"
- "Unsupported file type"

#### Solutions

**1. Check file size**:
```
Maximum file size: 5MB (free tier)

Compress images before upload:
- Use TinyPNG (https://tinypng.com)
- Use ImageOptim (macOS)
- Convert to WebP format
```

**2. Verify upload provider**:
```javascript
// apps/strapi/config/plugins.ts
module.exports = {
  upload: {
    config: {
      sizeLimit: 5 * 1024 * 1024, // 5MB
      breakpoints: {
        xlarge: 1920,
        large: 1000,
        medium: 750,
        small: 500,
        xsmall: 64
      },
    },
  },
};
```

**3. Check file permissions**:
```bash
# Local uploads directory
chmod -R 755 apps/strapi/public/uploads/
```

**4. Storage quota exceeded**:
```
Strapi Cloud Free Tier: 5GB total storage

Solutions:
- Delete unused images
- Compress existing images
- Upgrade to paid tier
- Use external service (Cloudinary)
```

---

### Issue: "Uploaded images not appearing"

#### Diagnosis

**1. Check if upload succeeded**:
```
Strapi Admin → Media Library
- Image should appear here
- If not, upload failed
```

**2. Verify image URL**:
```javascript
// Correct format
{
  "url": "/uploads/image_abc123_1234567890.jpg",
  "formats": {
    "large": { "url": "/uploads/large_image_abc123_1234567890.jpg" },
    "medium": { "url": "/uploads/medium_image_abc123_1234567890.jpg" }
  }
}
```

#### Solutions

**Image not processing**:
```bash
# Check Strapi logs for sharp errors
cd apps/strapi
pnpm install sharp --force
```

**CORS issues**:
```javascript
// apps/strapi/config/middlewares.ts
module.exports = [
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      origin: ['http://localhost:3000', 'https://yourdomain.com'],
    },
  },
];
```

**Cloudinary not working**:
```javascript
// apps/strapi/config/plugins.ts
upload: {
  config: {
    provider: 'cloudinary',
    providerOptions: {
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_KEY,
      api_secret: process.env.CLOUDINARY_SECRET,
    },
  },
}

// Verify env vars are set
console.log('Cloudinary:', process.env.CLOUDINARY_NAME); // Should not be undefined
```

---

## Caching & Performance

### Issue: "Site loading slowly"

#### Diagnosis

**1. Check Core Web Vitals**:
```bash
# Use Lighthouse in Chrome DevTools
# Or online: https://pagespeed.web.dev/

Target metrics:
- LCP: <2.5s
- FID: <100ms
- CLS: <0.1
```

**2. Analyze bundle size**:
```bash
cd apps/web
pnpm analyze

# Check for:
- Large packages (>100KB)
- Duplicate dependencies
- Unused imports
```

**3. Check API response times**:
```bash
# Time API requests
time curl https://your-strapi.com/api/articles

# Should be <200ms
```

#### Solutions

**Optimize images**:
```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src={coverUrl}
  alt={alt}
  width={1200}
  height={630}
  loading="lazy" // Lazy load below fold
  placeholder="blur" // Blur-up placeholder
/>
```

**Enable caching**:
```typescript
// Ensure ISR is configured
export const revalidate = 300; // 5 minutes

// Or use unstable_cache
const articles = await getCachedArticles();
```

**Reduce bundle size**:
```bash
# Remove unused dependencies
pnpm depcheck

# Use dynamic imports
const Chart = dynamic(() => import('./Chart'), { ssr: false });
```

---

### Issue: "Cache not invalidating"

#### Symptoms
- Updated content not showing
- Webhook fires but cache persists
- Manual revalidation doesn't work

#### Diagnosis

**1. Check webhook delivery**:
```
Strapi Admin → Settings → Webhooks → [Your webhook] → Triggered
- Should show successful deliveries
- Check response status (200 OK)
```

**2. Verify revalidation handler**:
```typescript
// apps/web/app/api/revalidate/route.ts
export async function POST(request: NextRequest) {
  console.log('[Revalidation] Request received'); // Should log
  const body = await request.json();
  console.log('[Revalidation] Body:', body); // Inspect payload

  // ... revalidation logic
}
```

**3. Check Vercel logs**:
```bash
vercel logs [deployment-url] --follow
# Look for revalidation attempts
```

#### Solutions

**Webhook not reaching endpoint**:
```
1. Verify webhook URL is correct (HTTPS)
2. Check secret matches (case-sensitive)
3. Test webhook manually with curl
```

**Revalidation tags mismatch**:
```typescript
// Ensure tags match between cache and revalidation

// Cache setup
tags: ['articles', 'article-my-slug']

// Revalidation
revalidateTag('articles');
revalidateTag('article-my-slug');
```

**Aggressive browser caching**:
```typescript
// apps/web/next.config.ts
const nextConfig = {
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=0, must-revalidate',
        },
      ],
    },
  ],
};
```

---

## Database Issues

### Issue: "Database connection error"

#### Error Message
```
Error: connect ETIMEDOUT
Error: Connection terminated unexpectedly
```

#### Diagnosis

**Check connection string**:
```bash
# Format should be:
postgres://user:password@host:5432/database

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

#### Solutions

**1. Verify DATABASE_URL**:
```bash
# Check if set
echo $DATABASE_URL

# Format check
# Should have: protocol, user, password, host, port, database
```

**2. Connection pool limits**:
```javascript
// apps/strapi/config/database.ts
module.exports = {
  connection: {
    client: 'postgres',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    },
    pool: {
      min: 0,
      max: 10, // Adjust based on plan limits
      acquireTimeoutMillis: 300000,
      createTimeoutMillis: 300000,
      idleTimeoutMillis: 30000,
    },
  },
};
```

**3. Database server down**:
```bash
# Check database service status
# For managed services, check dashboard

# For self-hosted
systemctl status postgresql
```

---

### Issue: "Database migration failed"

#### Error Message
```
Error: Migration "20240315_update_articles" failed
```

#### Diagnosis
Schema changes conflict with existing data.

#### Solutions

**1. Review migration**:
```bash
cd apps/strapi
ls src/database/migrations/

# Read migration file
cat src/database/migrations/TIMESTAMP_migration_name.js
```

**2. Rollback and retry**:
```bash
# Strapi automatically handles migrations
# If stuck, reset database (dev only!)

# Development (SQLite)
rm apps/strapi/.tmp/data.db
pnpm develop # Creates new database

# Production
# Contact support or restore from backup
```

**3. Manual migration**:
```sql
-- Production: Run SQL manually if migration stuck
-- Backup first!

-- Example: Add column
ALTER TABLE articles ADD COLUMN new_field VARCHAR(255);
```

---

## API & Integration

### Issue: "CORS errors"

#### Error Message
```
Access to fetch at 'https://strapi.com/api/articles' from origin 'https://yoursite.com' has been blocked by CORS policy
```

#### Solutions

**Configure Strapi CORS**:
```javascript
// apps/strapi/config/middlewares.ts
module.exports = [
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://yourdomain.com',
        'https://*.vercel.app', // Vercel preview deployments
      ],
      headers: '*',
    },
  },
  // ... other middlewares
];
```

---

### Issue: "Rate limiting errors (429)"

#### Error Message
```
Error: Too Many Requests (429)
```

#### Diagnosis
Exceeded free tier API limits (1000 calls/day).

#### Solutions

**1. Check current usage**:
```bash
# Monitor API calls
# Strapi Dashboard → Usage

# Or count from logs
grep "API call" logs.txt | wc -l
```

**2. Optimize caching**:
```typescript
// Increase cache duration
export const revalidate = 600; // 10 minutes instead of 5

// Use stale-while-revalidate
const articles = await getCachedArticles({
  revalidate: 300,
  tags: ['articles'],
});
```

**3. Batch requests**:
```typescript
// ❌ Bad - multiple API calls
const articles = await fetch('/api/articles');
const categories = await fetch('/api/categories');
const authors = await fetch('/api/authors');

// ✅ Good - single call with populate
const articles = await fetch('/api/articles?populate[author]=*&populate[category]=*');
```

**4. Implement request throttling**:
```typescript
// Client-side rate limiting
import pLimit from 'p-limit';

const limit = pLimit(2); // Max 2 concurrent requests

const requests = urls.map(url =>
  limit(() => fetch(url))
);

await Promise.all(requests);
```

---

## Deployment Problems

### Issue: "Vercel deployment fails"

#### Error Messages
- "Build exceeded maximum duration"
- "Command failed with exit code 1"
- "Out of memory"

#### Solutions

**Build timeout**:
```json
// vercel.json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next",
      "config": {
        "maxDuration": 900
      }
    }
  ]
}
```

**Out of memory**:
```bash
# Optimize build process
# Remove large dependencies
# Use dynamic imports

# Or upgrade Vercel plan
```

**Build cache issues**:
```bash
# Clear Vercel cache
# Vercel Dashboard → Settings → Clear cache
# Then redeploy
```

---

### Issue: "Environment variables not working in production"

#### Symptoms
- `process.env.VAR` is undefined
- API calls failing
- Features not working

#### Solutions

**1. Add to deployment platform**:
```
Vercel:
1. Settings → Environment Variables
2. Add each variable
3. Select environment (Production/Preview/Development)
4. Redeploy

Strapi Cloud:
1. Settings → Environment Variables
2. Add variables
3. Restart application
```

**2. Verify variable names**:
```
Common mistakes:
- Missing NEXT_PUBLIC_ prefix for client-side vars
- Typos in variable names (case-sensitive)
- Trailing spaces in values
```

**3. Check .env.example**:
```bash
# Compare with required variables
cat apps/web/.env.example
cat apps/strapi/.env.example
```

---

## Error Reference

### Common Error Codes

| Code | Name | Cause | Solution |
|------|------|-------|----------|
| 400 | Bad Request | Invalid query parameters | Check API request format |
| 401 | Unauthorized | Missing/invalid API token | Regenerate and update token |
| 403 | Forbidden | Insufficient permissions | Check role permissions |
| 404 | Not Found | Resource doesn't exist | Verify slug/ID is correct |
| 429 | Too Many Requests | Rate limit exceeded | Implement caching, reduce requests |
| 500 | Internal Server Error | Server-side error | Check logs, database connection |
| 502 | Bad Gateway | Upstream service down | Wait for service recovery |
| 503 | Service Unavailable | Server maintenance | Check status page |

### Error Log Locations

**Development**:
```bash
# Strapi
apps/strapi/[console output]

# Next.js
apps/web/[console output]
```

**Production**:
```bash
# Vercel
vercel logs [deployment-url]

# Strapi Cloud
# Dashboard → Logs tab
```

---

## Prevention & Monitoring

### Preventive Measures

**1. Regular backups**:
```bash
# Database backups
# Enable automatic backups in Strapi Cloud
# Or manual backups:

# SQLite (development)
cp apps/strapi/.tmp/data.db apps/strapi/.tmp/data.db.backup

# PostgreSQL (production)
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

**2. Staging environment**:
```
Production: yoursite.com
Staging: staging.yoursite.com (for testing)
Development: localhost

Always test in staging before production deploy
```

**3. Version control**:
```bash
# Commit frequently
git add .
git commit -m "feat: add new feature"

# Tag releases
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

**4. Dependency updates**:
```bash
# Check outdated packages
pnpm outdated

# Update cautiously (test after each)
pnpm update

# Or update all (risky)
pnpm up --latest
```

### Monitoring

**1. Uptime monitoring**:
- Use UptimeRobot (free)
- Monitor both Strapi and Next.js URLs
- Set up email/SMS alerts

**2. Error tracking**:
```typescript
// apps/web/app/error.tsx
export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  // Log to error tracking service
  console.error('Application error:', error);

  // Optional: Send to Sentry, LogRocket, etc.
  // Sentry.captureException(error);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

**3. Performance monitoring**:
```bash
# Use Vercel Analytics (built-in)
# Or add custom monitoring

# Monitor Core Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getLCP(console.log);
```

**4. API usage tracking**:
```typescript
// packages/strapi-client/client.ts
let apiCallCount = 0;

export async function trackApiCall(url: string) {
  apiCallCount++;

  if (apiCallCount > 900) {
    console.warn('[WARNING] Approaching daily API limit:', apiCallCount);
  }

  console.log(`[API Call #${apiCallCount}] ${url}`);
}
```

---

## Getting Help

### Before Asking for Help

**Gather information**:
1. **Error message**: Full text, not paraphrased
2. **Steps to reproduce**: What you did before error
3. **Environment**: Development or production
4. **Recent changes**: Code, config, deployment
5. **Logs**: Relevant error logs
6. **Screenshots**: If UI issue

### Support Channels

**Documentation**:
- This troubleshooting guide
- Strapi docs: https://docs.strapi.io
- Next.js docs: https://nextjs.org/docs

**Community**:
- Strapi Discord: https://discord.strapi.io
- Next.js discussions: https://github.com/vercel/next.js/discussions

**Professional**:
- Strapi support (paid plans)
- Vercel support
- Custom development support

---

## Quick Reference

### Diagnostic Commands

```bash
# Check Node.js version
node --version

# Check pnpm version
pnpm --version

# Check if Strapi running
curl http://localhost:1337/api/articles

# Check if Next.js running
curl http://localhost:3000

# View Strapi database
cd apps/strapi
sqlite3 .tmp/data.db "SELECT * FROM articles;"

# Check environment variables
printenv | grep STRAPI

# Test API token
curl -H "Authorization: Bearer $STRAPI_API_TOKEN" \
  https://your-strapi.com/api/articles

# Clear all caches
pnpm clean && rm -rf apps/web/.next && rm -rf apps/strapi/build
```

### Emergency Recovery

**Site completely down**:
1. Check service status pages
2. Review recent deployments
3. Rollback to last working version
4. Check environment variables
5. Review error logs
6. Test database connection

**Data loss**:
1. Stop all services immediately
2. Restore from most recent backup
3. Verify data integrity
4. Resume services
5. Investigate root cause
6. Improve backup strategy

---

**Last Updated**: October 2024
**Version**: 1.0
**Contact**: support@yoursite.com
