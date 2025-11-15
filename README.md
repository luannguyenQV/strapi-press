# StrapiPress

> **The Modern WordPress Alternative** - Build professional websites with Strapi + Next.js in minutes, not hours.

## 🚀 Overview

**StrapiPress** is a production-ready, headless CMS starter that combines the power of Strapi with the performance of Next.js. Perfect for developers who want WordPress functionality without the WordPress complexity.

### ⚡ **Quick & Cheap Website Building**
- **Setup Time**: 5 minutes to running site
- **Cost**: $0 hosting for first 6-12 months (free tiers)
- **Performance**: Sub-3 second load times
- **SEO**: Built-in optimization and meta management

## 🏗️ **Tech Stack**

- **Backend**: Strapi 5.16.0 (Headless CMS)
- **Frontend**: Next.js 15 + React 19
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Deployment**: Vercel + Strapi Cloud (free tiers)

## 📁 **Applications**

- `apps/strapi`: Strapi CMS backend with content types, media management, and admin panel
- `apps/web`: Next.js frontend with internationalization, SEO, and responsive design

## 🎯 **Perfect For**

### ✅ **Developers Who Want**
- WordPress functionality without PHP
- Modern React-based frontend
- Type-safe development experience
- Scalable architecture from day one

### ✅ **Agencies Who Need**
- Quick client site deployment
- Cost-effective hosting solutions
- Professional, maintainable codebases
- SEO-optimized performance

### ✅ **Startups Building**
- News/blog platforms
- Corporate websites
- Content marketing sites
- Multi-language sites

## 🚀 **Get Started**

```bash
# Clone and install
git clone https://github.com/luannguyenQV/strapi-press strapipress
cd strapipress

# Install workspace dependencies
pnpm install

# Install Strapi dependencies (separate from workspace)
pnpm install:strapi
# or: cd apps/strapi && pnpm install

# Start both apps (recommended)
pnpm dev

# Or start individually:
pnpm dev:web      # Next.js frontend only
pnpm dev:strapi   # Strapi CMS only

# Visit:
# Frontend: http://localhost:3001
# Strapi Admin: http://localhost:1337/admin
```

## 📚 **Documentation**

- 📖 **[Quick Start Guide](./QUICK_START.md)** - Get running in 5 minutes
- 🗺️ **[Implementation Plan](./docs/plan/index.md)** - Full development roadmap
- 🚀 **[Deployment Guide](./docs/deployment-guide.md)** - Free tier hosting setup
- 🧩 **[Component Architecture](./docs/component-architecture.md)** - Frontend structure

## 🌟 **Why Choose StrapiPress?**

| Feature | WordPress | StrapiPress |
|---------|-----------|-------------|
| **Setup Time** | 30+ minutes | 5 minutes |
| **Performance** | 3-8 seconds | <3 seconds |
| **Security** | Plugin vulnerabilities | Headless architecture |
| **Developer Experience** | PHP/MySQL | TypeScript/Modern stack |
| **Hosting Cost** | $5-20/month | $0 (free tiers) |
| **Scalability** | Limited by server | Cloud-native |

---

**Ready to build something amazing?** Start with `pnpm dev` and launch your site! 🎉
