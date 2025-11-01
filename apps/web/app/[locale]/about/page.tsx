/**
 * About Page - Company/Blog Information
 *
 * Fetches content from Strapi "About" single type
 * Displays mission, team, and company information
 */

import { createMetadata } from '@repo/seo/metadata';
import { cachedFindSingleType } from '@repo/strapi-client';
import type { Metadata } from 'next';
import Image from 'next/image';

type AboutProps = {
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata({ params }: AboutProps): Promise<Metadata> {
  const { locale } = await params;

  return createMetadata({
    title: 'About Us',
    description: 'Learn more about StrapiPress and our mission to help businesses succeed.',
  });
}

export default async function AboutPage({ params }: AboutProps) {
  const { locale } = await params;

  try {
    // Fetch About content from Strapi
    const response = await cachedFindSingleType('about', {
      populate: {
        blocks: {
          populate: '*', // Populate all block components
        },
      },
    }, {
      revalidate: 1800, // 30 minutes cache
      tags: ['about', 'pages']
    });

    const aboutData = response?.data;

    if (!aboutData) {
      // Fallback content if Strapi data not available
      return <DefaultAboutContent />;
    }

    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl">
          {/* Hero Section */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 font-bold text-4xl tracking-tight md:text-5xl">
              About StrapiPress
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed md:text-xl">
              Your modern blogging platform powered by Strapi and Next.js
            </p>
          </div>

          {/* Dynamic Content Blocks */}
          {aboutData.blocks && Array.isArray(aboutData.blocks) && aboutData.blocks.length > 0 ? (
            <div className="space-y-12">
              {aboutData.blocks.map((block: any, index: number) => (
                <ContentBlock key={index} block={block} />
              ))}
            </div>
          ) : (
            <DefaultAboutContent />
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('[About Page] Error fetching about content:', error);
    return <DefaultAboutContent />;
  }
}

// Content Block Component (renders different block types)
function ContentBlock({ block }: { block: any }) {
  switch (block.__component) {
    case 'shared.rich-text':
      return (
        <div
          className='prose prose-lg dark:prose-invert mx-auto'
          dangerouslySetInnerHTML={{ __html: block.content }}
        />
      );

    case 'shared.media':
      return block.file?.url ? (
        <div className="relative mx-auto aspect-video max-w-3xl overflow-hidden rounded-lg">
          <Image
            src={`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${block.file.url}`}
            alt={block.file.alternativeText || 'About us'}
            fill
            className="object-cover"
          />
        </div>
      ) : null;

    case 'shared.quote':
      return (
        <blockquote className='border-primary border-l-4 pl-6 text-lg italic'>
          <p className="mb-2">{block.quote}</p>
          {block.author && (
            <footer className="text-muted-foreground text-sm">
              — {block.author}
            </footer>
          )}
        </blockquote>
      );

    default:
      return null;
  }
}

// Default About Content (when Strapi data unavailable)
function DefaultAboutContent() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-bold text-4xl tracking-tight md:text-5xl">
            About StrapiPress
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed md:text-xl">
            A modern, production-ready blogging platform
          </p>
        </div>

        <div className='prose prose-lg dark:prose-invert mx-auto'>
          <h2>Our Mission</h2>
          <p>
            StrapiPress combines the power of Strapi CMS with Next.js to deliver a fast,
            flexible, and developer-friendly blogging platform. We believe in building tools
            that make content management simple and enjoyable.
          </p>

          <h2>What We Offer</h2>
          <ul>
            <li>
              <strong>Headless CMS:</strong> Strapi provides a powerful backend with full
              content management capabilities
            </li>
            <li>
              <strong>Modern Frontend:</strong> Next.js 15 with App Router, React Server
              Components, and Partial Prerendering
            </li>
            <li>
              <strong>Performance First:</strong> Edge caching, ISR, and optimized image
              delivery for blazing-fast load times
            </li>
            <li>
              <strong>Developer Experience:</strong> TypeScript, monorepo architecture, and
              comprehensive documentation
            </li>
          </ul>

          <h2>Technology Stack</h2>
          <p>
            Built with modern web technologies including Next.js 15, React 19, Tailwind CSS v4,
            Strapi 5, and TypeScript. Optimized for deployment on Vercel Edge Network.
          </p>

          <h2>Get Started</h2>
          <p>
            Ready to start blogging? Check out our documentation or get in touch with our team
            to learn how StrapiPress can power your content platform.
          </p>
        </div>
      </div>
    </div>
  );
}
