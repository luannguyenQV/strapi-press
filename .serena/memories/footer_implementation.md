# Footer Implementation Overview

## Architecture
- **Strapi Backend**: Single-type content model at `/api/footer` with i18n support
- **Next.js Frontend**: Server component at `/app/[locale]/components/footer/`
- **API Client**: Service in `@repo/strapi-client` with caching (1 min TTL)

## Content Structure
### Footer Schema (apps/strapi/src/api/footer)
- **columns**: Navigation columns with title and links (max 4)
- **socialLinks**: Platform-specific social media links
- **copyright**: Text field with default value
- **bottomLinks**: Footer bottom navigation links

### Components (apps/strapi/src/components/footer/)
- **navigation-column**: Column with title and nested links
- **navigation-link**: Label, URL, isExternal, openInNewTab
- **social-link**: Platform enum, URL, optional label

## Frontend Implementation
- **Footer Component**: RSC with locale prop, fetches data via footerService
- **Social Icons**: Lucide icons mapped to platforms
- **Link Handling**: Next.js Link for internal, anchor for external
- **Styling**: Tailwind CSS with dark mode support
- **Fallback**: Simple copyright text if no Strapi data

## API Integration
- **Endpoint**: GET `/footer` with locale parameter
- **Caching**: Client-side 1-minute cache in footerService
- **Population**: Deep population of columns, links, socialLinks
- **Error Handling**: Returns null on error, component shows fallback

## Key Features
- Multi-language support via i18n
- Dynamic content management via Strapi
- Responsive grid layout (1-4 columns)
- Social media integration with icons
- Internal/external link differentiation
- Bottom links for legal/policy pages