# Task Completion Workflow

## Before Committing Code
1. **Code Quality Checks**
   ```bash
   pnpm lint           # Run Ultracite linting
   pnpm format         # Format code with Biome
   pnpm typecheck      # TypeScript type checking
   ```

2. **Testing**
   ```bash
   pnpm test           # Run all tests
   pnpm test --filter=web  # Test specific workspace if needed
   ```

3. **Build Verification**
   ```bash
   pnpm build          # Ensure everything builds successfully
   ```

## Development Workflow
1. **Start Development Environment**
   ```bash
   pnpm dev            # Start both Strapi and Next.js
   ```

2. **Make Changes**
   - Edit code in appropriate workspace (apps/* or packages/*)
   - Follow TypeScript strict mode requirements
   - Use workspace packages via @repo/* imports

3. **Quality Assurance**
   - Run linting and formatting continuously
   - Check TypeScript errors in IDE
   - Test functionality in browser

4. **Pre-commit Validation**
   - Run complete quality check suite
   - Verify builds pass
   - Test critical user flows

## Strapi-Specific Tasks
When working with Strapi content:
1. **Start Strapi Backend**
   ```bash
   pnpm dev:strapi
   ```

2. **Access Admin Panel**
   - Visit http://localhost:1337/admin
   - Make content structure changes

3. **Update Types**
   - Strapi generates types automatically in apps/strapi/types/generated/
   - Update strapi-client package if API changes

4. **Test Integration**
   - Verify frontend consumes API correctly
   - Check data flow through strapi-client

## Deployment Preparation
1. **Build Production Assets**
   ```bash
   pnpm build
   ```

2. **Environment Configuration**
   - Ensure production database configured
   - Verify environment variables set

3. **Final Validation**
   - Test production build locally
   - Verify all workspace dependencies resolve