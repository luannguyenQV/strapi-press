# Content Editor Guide

A comprehensive guide for content creators and editors using the StrapiPress platform. This guide covers the Strapi admin panel, content creation workflows, and best practices for managing your website content.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Admin Panel Overview](#admin-panel-overview)
3. [Creating Articles](#creating-articles)
4. [Managing Media](#managing-media)
5. [Categories & Organization](#categories--organization)
6. [Author Profiles](#author-profiles)
7. [SEO Optimization](#seo-optimization)
8. [Content Workflow](#content-workflow)
9. [Rich Text Editor](#rich-text-editor)
10. [Publishing & Scheduling](#publishing--scheduling)
11. [Best Practices](#best-practices)
12. [Common Tasks](#common-tasks)
13. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Accessing the Admin Panel

**Development**:
- URL: `http://localhost:1337/admin`
- Default credentials: Created during first setup

**Production**:
- URL: `https://your-strapi-instance.com/admin`
- Use your organization credentials

### First-Time Setup

1. **Create Your Account**:
   - Navigate to the admin URL
   - Enter your details (first name, last name, email, password)
   - Click "Let's start"

2. **Initial Configuration**:
   - Set up your profile
   - Upload your avatar
   - Configure notification preferences

3. **Familiarize Yourself with the Interface**:
   - Content Manager (left sidebar)
   - Media Library
   - Content Types
   - Settings

---

## Admin Panel Overview

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────┐
│  Logo                    [Search]    [User Menu]         │
├──────────┬──────────────────────────────────────────────┤
│          │                                               │
│ Content  │                                               │
│ Manager  │                                               │
│          │          Main Content Area                    │
│ • Articles                                               │
│ • Categories                                             │
│ • Authors │                                              │
│          │                                               │
│ Media    │                                               │
│ Library  │                                               │
│          │                                               │
│ Settings │                                               │
│          │                                               │
└──────────┴──────────────────────────────────────────────┘
```

### Main Navigation

| Section | Purpose | Common Tasks |
|---------|---------|--------------|
| **Content Manager** | Create and edit content | Write articles, manage drafts |
| **Media Library** | Upload and organize images | Add article covers, author avatars |
| **Content-Type Builder** | View content structure | (Admin only) |
| **Settings** | Configure global settings | API tokens, webhooks, users |

---

## Creating Articles

### Step-by-Step Guide

#### 1. Start a New Article

1. Click **Content Manager** in the left sidebar
2. Select **Article** (Collection Types)
3. Click **Create new entry** (blue button, top right)

#### 2. Fill in Basic Information

**Title** (Required):
- Clear, descriptive, 60 characters or less
- Example: "Getting Started with Next.js 15"
- ✅ Good: "10 Tips for Better React Performance"
- ❌ Bad: "Some thoughts on coding and stuff"

**Slug** (Auto-generated):
- URL-friendly version of your title
- Automatically created from title
- Can be manually edited if needed
- Example: `getting-started-with-nextjs-15`

**Description** (Optional but Recommended):
- Brief summary of the article (150-160 characters)
- Shows in article previews and search results
- Example: "Learn how to build modern web applications with Next.js 15's latest features including Server Components and the App Router."

#### 3. Add Rich Content

**Content Blocks**:

StrapiPress supports multiple content block types for flexible article layouts:

##### Rich Text Block
Standard text content with formatting.

**To add**:
1. Click **Add a component to blocks**
2. Select **Rich Text**
3. Use the editor toolbar for formatting

**Formatting Options**:
- **Bold**: `**text**` or Ctrl/Cmd + B
- **Italic**: `*text*` or Ctrl/Cmd + I
- **Headings**: `## Heading 2`, `### Heading 3`
- **Lists**: `- Item` (bullet) or `1. Item` (numbered)
- **Links**: `[Link text](https://url.com)`
- **Code**: `` `inline code` `` or ` ``` code block ``` `
- **Blockquotes**: `> Quote text`

##### Media Block
Images and visual content.

**To add**:
1. Click **Add a component to blocks**
2. Select **Media**
3. Click **Upload** to add an image
4. Add optional caption and alt text

**Best Practices**:
- Max file size: 5MB per image
- Recommended formats: JPG (photos), PNG (graphics), WebP (modern browsers)
- Optimal dimensions: 1200x630px (article covers), 800x600px (inline images)
- Always add alt text for accessibility

##### Quote Block
Highlighted quotations.

**To add**:
1. Click **Add a component to blocks**
2. Select **Quote**
3. Enter quote text
4. Add author name (optional)

**Example**:
```
Quote: "The only way to do great work is to love what you do."
Author: Steve Jobs
```

##### Slider Block
Multiple images in a gallery.

**To add**:
1. Click **Add a component to blocks**
2. Select **Slider**
3. Upload multiple images (2-6 recommended)

**Use Cases**:
- Product galleries
- Step-by-step tutorials
- Before/after comparisons

#### 4. Select Category & Author

**Category** (Required):
- Choose from existing categories (Technology, Design, Business, etc.)
- Can only select one category per article
- If needed category doesn't exist, contact your admin

**Author** (Required):
- Select your author profile from the dropdown
- Displays name, avatar, and bio on the article

#### 5. Upload Cover Image

**To add cover image**:
1. Click **Upload** in the Cover field
2. Choose from:
   - **Upload from computer**: Drag & drop or browse
   - **Media Library**: Select existing image

**Cover Image Requirements**:
- **Aspect Ratio**: 16:9 (recommended)
- **Dimensions**: Minimum 1200x630px
- **File Size**: Maximum 5MB
- **Format**: JPG, PNG, or WebP

**Image Variants**:
Strapi automatically generates:
- **Large**: 1000x563px
- **Medium**: 750x422px
- **Small**: 500x281px
- **Thumbnail**: 245x138px

#### 6. Configure SEO Settings

Expand the **SEO** section:

**Meta Title**:
- 50-60 characters
- Include main keyword
- Example: "Getting Started with Next.js 15 | StrapiPress"

**Meta Description**:
- 150-160 characters
- Compelling summary with call-to-action
- Example: "Learn how to build modern web applications with Next.js 15. Step-by-step guide with code examples and best practices."

**Meta Image**:
- Often same as cover image
- Appears when shared on social media
- Recommended: 1200x630px (Open Graph standard)

**Keywords**:
- 5-10 relevant keywords, comma-separated
- Example: "Next.js, React, web development, JavaScript, tutorial"

**Canonical URL** (Optional):
- Only if republishing content from another source
- Prevents duplicate content SEO penalties

---

## Managing Media

### Media Library

Access via **Media Library** in the left sidebar.

### Uploading Images

#### Single Upload

1. Click **Add new assets** (top right)
2. Choose upload method:
   - **From computer**: Drag & drop or browse
   - **From URL**: Enter image URL

3. **Wait for processing**:
   - Strapi generates multiple sizes
   - Processing takes 2-5 seconds per image

#### Bulk Upload

1. Select multiple files (Shift + Click or Ctrl + Click)
2. Drag and drop to upload area
3. All files processed simultaneously

### Organizing Media

#### Folders

**Create folder**:
1. Click **Add new folder** (top right)
2. Name folder (e.g., "Article Covers", "Author Avatars")
3. Drag images into folder

**Recommended folder structure**:
```
Media Library/
├── Article Covers/
│   ├── Technology/
│   ├── Design/
│   └── Business/
├── Inline Images/
├── Author Avatars/
└── Logos/
```

#### Filtering & Search

- **Search**: Use search bar (top right) to find by filename
- **Filter by type**: Images, Videos, Documents
- **Sort**: By upload date, name, or size

### Editing Image Metadata

1. Click on any image
2. Edit fields in the sidebar:
   - **Name**: Filename
   - **Alternative text**: Accessibility description (required for SEO)
   - **Caption**: Optional description shown below image

**Alt Text Best Practices**:
- Describe what's in the image
- Be concise (125 characters or less)
- Don't start with "Image of..." or "Picture of..."
- ✅ Good: "Person coding on laptop with dual monitors"
- ❌ Bad: "Image of a coder"

### Deleting Media

⚠️ **Warning**: Deleting media that's in use will break articles!

**Before deleting**:
1. Check if image is used in any articles
2. Click image → **Details** tab → **Used in** section
3. Only delete if "Used in: 0 entries"

---

## Categories & Organization

### Viewing Categories

1. Click **Content Manager**
2. Select **Category** (Collection Types)
3. View all categories

### Creating a New Category

**When to create**:
- New content topic that doesn't fit existing categories
- Get approval from admin/editor-in-chief first

**How to create**:
1. Click **Create new entry**
2. Fill in fields:
   - **Name**: Category display name (e.g., "Technology")
   - **Slug**: URL-friendly name (auto-generated)
   - **Description**: Brief overview of category content

**Category Guidelines**:
- Keep to 5-10 main categories
- Use broad topics, not niche subjects
- Maintain consistency with existing taxonomy

---

## Author Profiles

### Viewing Your Profile

1. Click **Content Manager**
2. Select **Author**
3. Find and click your name

### Editing Your Profile

**Name**:
- Full name as you want it displayed
- Example: "John Doe"

**Email**:
- Professional email address
- Used for notifications and contact

**Bio**:
- 150-300 characters
- Third-person perspective
- Include expertise and background
- Example: "John is a senior web developer with 10 years of experience in React and Node.js. He specializes in building scalable applications and loves teaching others."

**Avatar**:
- Professional headshot
- Recommended: 400x400px, square
- File size: <1MB
- Clear, well-lit photo

**Social Links** (Optional):
- Twitter/X profile URL
- LinkedIn profile URL
- Personal website

---

## SEO Optimization

### Why SEO Matters

Good SEO helps your articles:
- Rank higher in Google search results
- Get more organic traffic
- Appear properly when shared on social media

### SEO Checklist

For each article, ensure:

- [ ] **Title**: 50-60 characters, includes main keyword
- [ ] **Slug**: Clean, descriptive URL
- [ ] **Meta description**: 150-160 characters, compelling summary
- [ ] **Cover image**: High-quality, relevant, with alt text
- [ ] **Headings**: Proper H2/H3 structure in content
- [ ] **Keywords**: 5-10 relevant keywords
- [ ] **Internal links**: Link to 2-3 related articles
- [ ] **Content length**: Minimum 500 words (800-1500 ideal)

### Keyword Strategy

**Where to use keywords**:
1. **Title**: Once, naturally
2. **First paragraph**: Within first 100 words
3. **Headings**: At least one H2 or H3
4. **Throughout content**: Natural placement, 1-2% density
5. **Image alt text**: If relevant

**Example**:
- Keyword: "Next.js performance optimization"
- Title: "10 Proven Next.js Performance Optimization Techniques"
- First paragraph: "Next.js performance optimization is crucial for delivering fast web applications..."

### Social Media Preview

**Open Graph Tags** (automatically generated from SEO fields):
- Title → og:title
- Description → og:description
- Cover image → og:image

**Preview tools**:
- Facebook: https://developers.facebook.com/tools/debug/
- Twitter: https://cards-dev.twitter.com/validator
- LinkedIn: https://www.linkedin.com/post-inspector/

---

## Content Workflow

### Article Lifecycle

```
Draft → Review → Published → Updated
  ↓       ↓         ↓          ↓
Save    Preview   Live      Archive
```

### Workflow Stages

#### 1. Draft

**Status**: Not published, invisible to public

**Actions available**:
- Save draft
- Continue editing
- Preview (if configured)
- Submit for review

**Best for**:
- Initial writing
- Research and outlining
- Incomplete content

#### 2. Review

**Status**: Submitted for editorial review

**Process**:
1. Writer clicks **Submit for review**
2. Editor receives notification
3. Editor reviews and provides feedback
4. Writer revises based on feedback
5. Repeat until approved

**Common feedback**:
- Grammar and spelling
- Factual accuracy
- SEO optimization
- Image quality
- Content structure

#### 3. Published

**Status**: Live on website, visible to public

**Before publishing**:
- [ ] All content complete
- [ ] Images uploaded and optimized
- [ ] SEO fields filled
- [ ] Category and author assigned
- [ ] Proofread for errors
- [ ] Preview in multiple devices

**To publish**:
1. Click **Publish** (top right)
2. Confirm publication
3. Content goes live immediately

**After publishing**:
- Automatic cache revalidation (via webhook)
- Appears on homepage (if featured)
- Added to category pages
- Available in search

#### 4. Updated

**When to update**:
- Fix errors or typos
- Add new information
- Improve SEO
- Refresh outdated content

**To update**:
1. Edit published article
2. Make changes
3. Click **Save** (updates live immediately)

**Note**: Updates trigger automatic cache revalidation.

#### 5. Unpublish/Archive

**To unpublish**:
1. Open published article
2. Click **Unpublish**
3. Article removed from public site
4. Still available in admin panel

**When to unpublish**:
- Outdated information
- Legal/compliance issues
- Temporary removal for major updates

---

## Rich Text Editor

### Toolbar Overview

```
[B] [I] [H2▼] [Link] [Image] [List] [Quote] [Code] [More...]
```

### Formatting Options

#### Text Formatting

**Bold**:
- Click **B** or press Ctrl/Cmd + B
- Use for emphasis: "This is **important**"

**Italic**:
- Click **I** or press Ctrl/Cmd + I
- Use for emphasis: "This is *interesting*"

**Strikethrough**:
- Click **S** or use `~~text~~`
- Use for corrections: "The price is ~~$100~~ $80"

#### Headings

**Heading 2** (H2):
- Main section headings
- Markdown: `## Main Section`

**Heading 3** (H3):
- Sub-section headings
- Markdown: `### Sub Section`

**Heading 4** (H4):
- Minor headings
- Markdown: `#### Minor Heading`

**Best practices**:
- Only one H1 (article title)
- Use H2 for main sections
- Use H3 for subsections
- Don't skip heading levels (H2 → H4)

#### Lists

**Bullet List**:
```
- First item
- Second item
- Third item
```

**Numbered List**:
```
1. First step
2. Second step
3. Third step
```

**Nested Lists**:
```
- Main item
  - Sub item
  - Another sub item
- Another main item
```

#### Links

**To add link**:
1. Select text
2. Click **Link** icon
3. Enter URL
4. Click **Insert**

**Link types**:
- **Internal**: `/blog/article-slug` (relative URL)
- **External**: `https://example.com` (full URL)

**Best practices**:
- Use descriptive link text
- ✅ Good: "Learn more about [Next.js performance optimization]"
- ❌ Bad: "Click [here] to learn more"
- Open external links in new tab (optional)

#### Code

**Inline code**:
```
Use `const myVar = 'value'` for inline code
```

**Code block**:
````
```javascript
function hello() {
  console.log('Hello World');
}
```
````

**Language options**: javascript, typescript, python, html, css, bash, json

#### Blockquotes

**To add quote**:
```
> This is a quoted text.
> It can span multiple lines.
```

**Renders as**:
> This is a quoted text.
> It can span multiple lines.

#### Horizontal Rule

**To add separator**:
```
---
```

Creates a horizontal line to separate sections.

### Markdown Shortcuts

| Result | Markdown | Shortcut |
|--------|----------|----------|
| **Bold** | `**text**` | Ctrl/Cmd + B |
| *Italic* | `*text*` | Ctrl/Cmd + I |
| [Link](url) | `[text](url)` | Ctrl/Cmd + K |
| `Code` | `` `code` `` | Ctrl/Cmd + E |
| # Heading | `## Heading` | Type `##` + Space |

---

## Publishing & Scheduling

### Immediate Publishing

**To publish now**:
1. Complete all content
2. Click **Publish** (top right)
3. Content goes live immediately

**Automatic actions**:
- Webhook triggers cache revalidation
- Article appears on homepage (if featured)
- Added to category pages
- Available in sitemap
- Searchable on site

### Scheduling (Future Feature)

⚠️ **Note**: Scheduling is currently a planned feature. For now, use these workarounds:

**Workaround 1: Save as Draft**
1. Write article completely
2. Save as draft
3. Manually publish at desired time

**Workaround 2: Set Future Published Date**
1. Set `publishedAt` to future date
2. Publish the article
3. Article shows future date but is live
4. Consider filtering by date in frontend

---

## Best Practices

### Writing Guidelines

#### Content Quality

**Minimum standards**:
- **Length**: 500+ words (800-1500 ideal for SEO)
- **Grammar**: Proofread with Grammarly or similar
- **Readability**: Aim for Grade 8-10 reading level
- **Accuracy**: Fact-check all claims
- **Originality**: No plagiarism, cite sources

#### Structure

**Effective article structure**:
1. **Introduction** (100-150 words):
   - Hook reader with compelling opening
   - State article's purpose
   - Preview main points

2. **Body** (main content):
   - Use H2/H3 headings for sections
   - Short paragraphs (3-5 sentences)
   - Mix text with visuals
   - Include code examples if technical

3. **Conclusion** (50-100 words):
   - Summarize key takeaways
   - Call to action (subscribe, share, comment)

#### Readability Tips

- **Short sentences**: 15-20 words average
- **Active voice**: "We implemented..." not "It was implemented..."
- **Simple words**: "Use" not "utilize"
- **White space**: Break up text with headings, lists, images
- **Scannable**: Use bullet points and numbered lists

### Image Guidelines

#### Technical Requirements

**File formats**:
- **JPG**: Photos and complex images (best compression)
- **PNG**: Graphics with transparency, logos
- **WebP**: Modern format, best quality-to-size ratio

**Optimization**:
- **Before upload**: Compress images with TinyPNG or ImageOptim
- **Target size**: <200KB per image
- **Dimensions**: No larger than needed (1200px width for article covers)

#### Visual Guidelines

**Quality standards**:
- High resolution, not pixelated
- Well-lit, clear subject
- Relevant to content
- Professional appearance

**Avoid**:
- Watermarked stock photos
- Blurry or low-quality images
- Copyrighted images without permission
- Misleading or clickbait images

#### Copyright & Licensing

**Safe image sources**:
- **Free stock photos**:
  - Unsplash (https://unsplash.com)
  - Pexels (https://pexels.com)
  - Pixabay (https://pixabay.com)

- **Attribution required**:
  - Creative Commons (specify license)
  - Wikimedia Commons (check license)

- **Always acceptable**:
  - Your own photos
  - Custom graphics/screenshots
  - Properly licensed stock photos

**Credit images when required**:
```
Photo by [Photographer Name] on [Source]
```

### SEO Best Practices

#### On-Page SEO

**Title optimization**:
- Include main keyword
- Front-load important words
- Keep under 60 characters
- Make it compelling, not just descriptive

**Content optimization**:
- Use keyword naturally (don't stuff)
- Include related keywords (LSI keywords)
- Link to 2-3 related articles (internal linking)
- Add external links to authoritative sources
- Use descriptive anchor text for links

**Image SEO**:
- Descriptive filenames: `nextjs-performance-tips.jpg` not `IMG_1234.jpg`
- Alt text on all images
- Compress for fast loading
- Use WebP format when possible

#### Technical SEO

**URL structure**:
- ✅ Good: `/blog/nextjs-performance-optimization`
- ❌ Bad: `/blog/post-123` or `/article?id=abc`

**Meta data**:
- Unique title and description per article
- Include target keyword in both
- Don't duplicate across articles

**Content freshness**:
- Update outdated articles regularly
- Add "Last updated: [date]" for evergreen content
- Refresh statistics and examples annually

---

## Common Tasks

### Duplicating an Article

**Use case**: Creating similar content or templates

1. Open existing article
2. Click **...** (three dots, top right)
3. Select **Duplicate**
4. Edit title and slug
5. Modify content as needed

### Finding Your Articles

**Quick search**:
1. Go to **Content Manager → Article**
2. Use search bar (top right)
3. Search by title, slug, or content

**Filter by author**:
1. Go to **Content Manager → Article**
2. Click **Filters**
3. Select your name under **Author**

### Bulk Actions

**Publish multiple articles**:
1. Go to **Content Manager → Article**
2. Check boxes next to articles
3. Click **Bulk Actions** → **Publish**

**Delete multiple articles**:
1. Select articles
2. Click **Bulk Actions** → **Delete**
3. Confirm deletion

⚠️ **Warning**: Bulk delete cannot be undone!

### Recovering Deleted Content

⚠️ **Strapi does not have a recycle bin**.

**Prevention**:
- Double-check before deleting
- Use "Unpublish" instead of "Delete" for temporary removal
- Keep backups of important content in external docs

**Recovery options**:
1. **Database backup**: Contact admin to restore from backup
2. **Manual recovery**: If deleted recently, admin may recover from database

---

## Troubleshooting

### Common Issues

#### "Cannot upload image"

**Causes**:
- File too large (>5MB)
- Unsupported format
- Storage limit reached

**Solutions**:
1. Compress image to <2MB
2. Convert to JPG or PNG
3. Contact admin about storage limits

#### "Slug already exists"

**Cause**: Another article has the same URL slug

**Solution**:
1. Click into **Slug** field
2. Modify to make unique (add year, number, etc.)
   - Example: `my-article-2024` or `my-article-2`

#### "Article not appearing on website"

**Checklist**:
- [ ] Article is published (not draft)
- [ ] Category is assigned
- [ ] Author is assigned
- [ ] `publishedAt` date is in the past
- [ ] Cache has revalidated (wait 5 minutes or trigger manual revalidation)

**Force revalidation**:
Contact your admin to trigger manual cache revalidation.

#### "Images not loading on website"

**Causes**:
- Image deleted from Media Library
- Incorrect Strapi URL configuration
- Image processing failed

**Solutions**:
1. Re-upload image
2. Check if image shows in Media Library
3. Contact admin about configuration

#### "Lost unsaved changes"

**Cause**: Browser closed or crashed before saving

**Prevention**:
- Save frequently (Ctrl/Cmd + S)
- Keep article open in single tab
- Use browser auto-save (if available)

**Recovery**: Strapi has auto-save every 30 seconds. Reload the article to see last auto-saved version.

---

## Getting Help

### Support Channels

**Documentation**:
- This guide (start here)
- Strapi official docs: https://docs.strapi.io

**Internal support**:
- Contact your admin/editor-in-chief
- Team Slack/Discord channel
- Email support team

**External resources**:
- Strapi community Discord
- Strapi forum: https://forum.strapi.io
- Stack Overflow (tag: strapi)

### Reporting Bugs

**Before reporting**:
1. Check this troubleshooting section
2. Try reproducing the issue
3. Clear browser cache and retry

**What to include**:
- Steps to reproduce
- Expected vs. actual behavior
- Screenshots or screen recording
- Browser and OS details
- When the issue started

---

## Quick Reference

### Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Save | Ctrl + S | Cmd + S |
| Bold | Ctrl + B | Cmd + B |
| Italic | Ctrl + I | Cmd + I |
| Link | Ctrl + K | Cmd + K |
| Undo | Ctrl + Z | Cmd + Z |
| Redo | Ctrl + Y | Cmd + Shift + Z |
| Search | Ctrl + F | Cmd + F |

### Content Checklist

**Before publishing**:
- [ ] Title: Clear, keyword-rich, <60 characters
- [ ] Slug: Clean, descriptive URL
- [ ] Description: Compelling summary, 150-160 characters
- [ ] Content: >500 words, well-structured
- [ ] Cover image: High-quality, relevant, <2MB, with alt text
- [ ] Category: Assigned and appropriate
- [ ] Author: Your profile selected
- [ ] SEO: Meta title, description, keywords filled
- [ ] Links: All internal/external links working
- [ ] Formatting: Proper headings (H2/H3), lists, emphasis
- [ ] Proofread: No spelling or grammar errors
- [ ] Preview: Checked on multiple devices (if available)

---

## Appendix

### Glossary

**Slug**: URL-friendly version of title (e.g., `my-article-title`)

**Meta tags**: HTML tags providing information to search engines

**Alt text**: Accessibility description for images

**Draft**: Unpublished article saved for later

**Populate**: Loading related content (author, category, etc.)

**Webhook**: Automated notification sent when content changes

**Cache**: Temporary storage for faster page loading

**Revalidation**: Refreshing cached content with latest data

---

**Last Updated**: October 2024
**Version**: 1.0
**Contact**: admin@yoursite.com
