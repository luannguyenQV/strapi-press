# Footer Implementation Documentation

## Overview

The footer has been implemented as a dynamic, CMS-managed component in the StrapiPress platform. It provides a flexible, multi-column layout with social links, customizable navigation, and full internationalization support.

## Architecture

### Data Flow
```
Strapi CMS (Backend)
    ↓
Footer API Endpoint
    ↓
Strapi Client Service (with caching)
    ↓
Next.js Footer Component
    ↓
Rendered HTML
```

## Backend Implementation (Strapi)

### Content Type Structure
- **Location**: `apps/strapi/src/api/footer/`
- **Type**: Single Type (one footer per locale)
- **Internationalization**: Fully localized

### Schema Definition
```json
{
  "kind": "singleType",
  "collectionName": "footers",
  "info": {
    "singularName": "footer",
    "displayName": "Footer",
    "description": "Footer configuration and widgets"
  }
}
```

### Data Model

#### Main Attributes
1. **columns** (Component, Repeatable, Max: 4)
   - Navigation columns for organizing footer links
   - Each column contains a title and multiple links

2. **socialLinks** (Component, Repeatable)
   - Social media platform links
   - Supports: Facebook, Twitter/X, Instagram, LinkedIn, YouTube, GitHub, Discord, Telegram, TikTok

3. **copyright** (Text)
   - Copyright notice text
   - Default: "© 2024 StrapiPress. All rights reserved."

4. **bottomLinks** (Component, Repeatable)
   - Legal/policy links (Privacy Policy, Terms, etc.)
   - Displayed in the footer's bottom section

### Components Used

#### footer.navigation-column
- `title`: Column heading
- `links`: Array of navigation links

#### footer.navigation-link
- `label`: Link text
- `url`: Link destination
- `isExternal`: Boolean flag for external links
- `openInNewTab`: Boolean for target="_blank"

#### footer.social-link
- `platform`: Social media platform enum
- `url`: Profile/page URL
- `label`: Accessibility label (optional)

## Frontend Implementation (Next.js)

### Component Location
`apps/web/app/[locale]/components/footer/index.tsx`

### Key Features

#### 1. Dynamic Data Fetching
```typescript
const footerData = await footerService.getFooter(locale);
```

#### 2. Graceful Fallback
- Displays minimal footer if Strapi data unavailable
- Ensures footer always renders

#### 3. Social Icons Mapping
```typescript
const socialIcons = {
  github: Github,
  facebook: Facebook,
  twitter: Twitter,
  x: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  discord: MessageCircle,
  telegram: Send,
  tiktok: null,
};
```

#### 4. Layout Structure
- **Grid Layout**: 1-4 columns (responsive)
- **Social Links Section**: Centered icon row
- **Bottom Bar**: Copyright + legal links

#### 5. Link Handling
- Internal links use Next.js `Link` component
- External links use native `<a>` tags
- Configurable `target` and `rel` attributes

## Strapi Client Service

### Location
`packages/strapi-client/services/footer.service.ts`

### Features

#### 1. Type Safety
```typescript
export interface Footer {
  id: number;
  columns?: NavigationColumn[];
  socialLinks?: SocialLink[];
  copyright?: string;
  bottomLinks?: FooterLink[];
  createdAt: string;
  updatedAt: string;
}
```

#### 2. Intelligent Caching
- **Cache Duration**: 60 seconds
- **Cache Key**: Locale-specific (`footer_${locale}`)
- **Benefits**: Reduces API calls, improves performance

#### 3. Population Strategy
```typescript
const params = new URLSearchParams({
  'populate[columns][populate][links]': '*',
  'populate[socialLinks]': '*',
  'populate[bottomLinks]': '*',
});
```

#### 4. Error Handling
- Returns `null` on error
- Logs errors to console
- Component handles null gracefully

## Styling & Design

### Color Scheme
- **Light Mode**: Gray-50 background, gray-600 text
- **Dark Mode**: Gray-900 background, gray-400 text
- **Hover States**: Smooth color transitions

### Responsive Design
- **Mobile**: Single column layout
- **Tablet**: 2 columns
- **Desktop**: Up to 4 columns

### Accessibility
- Semantic HTML structure
- ARIA labels for social links
- Keyboard navigation support
- High contrast for readability

## Internationalization (i18n)

### Features
- All footer content localizable
- Locale-specific data fetching
- Language-aware caching
- Support for RTL languages (ready)

### Implementation
```typescript
export async function Footer({ locale }: FooterProps) {
  const footerData = await footerService.getFooter(locale);
  // ...
}
```

## Performance Optimizations

### 1. Server-Side Rendering
- Footer data fetched during SSR
- No client-side loading states
- SEO-friendly HTML output

### 2. Caching Strategy
- 60-second cache timeout
- Locale-specific cache keys
- Manual cache clearing available

### 3. Efficient Rendering
- Conditional rendering for optional sections
- Icon components lazy-loaded
- Minimal re-renders

## Usage in Strapi Admin

### Managing Footer Content
1. Navigate to **Content Manager** → **Footer**
2. Edit footer sections:
   - Add/edit navigation columns
   - Configure social links
   - Update copyright text
   - Manage bottom links
3. Save changes (no publish needed - single type)

### Adding Navigation Columns
1. Click "Add component" under Columns
2. Enter column title
3. Add navigation links with labels and URLs
4. Configure external/new tab settings

### Setting Up Social Links
1. Add social link component
2. Select platform from dropdown
3. Enter profile/page URL
4. Optionally add accessibility label

## API Endpoints

### Get Footer
```
GET /api/footer
GET /api/footer?locale=es
```

### Response Structure
```json
{
  "data": {
    "id": 1,
    "columns": [...],
    "socialLinks": [...],
    "copyright": "...",
    "bottomLinks": [...],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

## Benefits of This Implementation

1. **CMS-Managed**: Non-developers can update footer content
2. **Type-Safe**: Full TypeScript support throughout
3. **Performance**: Intelligent caching and SSR
4. **Flexible**: Supports various footer layouts
5. **International**: Built-in multi-language support
6. **Maintainable**: Clean separation of concerns
7. **Accessible**: WCAG-compliant implementation
8. **Responsive**: Mobile-first design approach

## Future Enhancements

### Potential Improvements
- Newsletter subscription form integration
- Dynamic widget system
- A/B testing capabilities
- Analytics tracking for link clicks
- Rich text support for copyright
- Theme customization options
- Footer templates/presets

## Summary

The footer implementation provides a robust, flexible, and user-friendly solution for managing website footer content through Strapi CMS. It combines the power of headless CMS with modern React patterns to deliver a performant, accessible, and internationally-ready footer component.