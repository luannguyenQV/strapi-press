import { BACKEND_URL } from '@/constants';
import { getArticleBySlug } from '@/lib/articles/fetch-article';
import {
  AuthorCard,
  BlockRenderer,
  PageWrapper,
  TypographyH1,
  TypographyH3,
  TypographyLead,
  TypographyMuted,
} from '@repo/design-system';
import { getDictionary } from '@repo/internationalization';
import { JsonLd, createArticleSchema, createMetadata } from '@repo/seo';
import {
  cachedFind,
  safeCastParams,
  validateArticles,
} from '@repo/strapi-client';
import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

type BlogPostProps = {
  readonly params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export const generateMetadata = async ({
  params,
}: BlogPostProps): Promise<Metadata> => {
  const { locale, slug } = await params;
  const dictionary = await getDictionary(locale);

  try {
    // Use shared fetch utility (deduplicated with page component)
    const article = await getArticleBySlug(slug);

    if (!article) {
      return createMetadata({
        title: `Article Not Found | ${dictionary.web.common.siteName}`,
        description: 'The requested article could not be found.',
      });
    }

    // Build cover image URL correctly
    const coverImageUrl = article.cover?.url
      ? `${BACKEND_URL}${article.cover.url}`
      : undefined;

    return createMetadata({
      title: `${article.title} | ${dictionary.web.common.siteName}`,
      description: article.description || '',
      openGraph: coverImageUrl
        ? {
          title: article.title,
          description: article.description || undefined,
          type: 'article',
          publishedTime: article.publishedAt || undefined,
          authors: article.author?.name ? [article.author.name] : undefined,
          images: [
            {
              url: coverImageUrl,
              width: article.cover?.width || 1200,
              height: article.cover?.height || 630,
              alt: article.cover?.alternativeText || article.title,
            },
          ],
        }
        : {
          title: article.title,
          description: article.description || undefined,
          type: 'article',
          publishedTime: article.publishedAt || undefined,
          authors: article.author?.name ? [article.author.name] : undefined,
        },
      twitter: {
        card: 'summary_large_image',
        title: article.title,
        description: article.description || undefined,
        images: coverImageUrl ? [coverImageUrl] : undefined,
      },
    });
  } catch (error) {
    console.error('Error generating metadata for article:', error);
    return createMetadata({
      title: `Blog | ${dictionary.web.common.siteName}`,
      description: 'Read our latest articles',
    });
  }
};

export async function generateStaticParams() {
  try {
    const response = await cachedFind(
      'articles',
      safeCastParams({
        fields: ['slug'],
        pagination: { pageSize: 100 },
      }),
      {
        revalidate: false, // Build-time only
        tags: ['articles', 'static-params'],
      }
    );

    const articles = validateArticles(response?.data || []);

    return articles.map((article) => ({
      slug: article.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

const BlogPost = async ({ params }: BlogPostProps) => {
  const { locale, slug } = await params;

  try {
    // Use shared fetch utility (deduplicated with generateMetadata)
    const article = await getArticleBySlug(slug);

    if (!article) {
      notFound();
    }

    // Generate JSON-LD structured data
    const articleSchema = createArticleSchema({
      title: article.title,
      description: article.description,
      publishedAt: article.publishedAt,
      updatedAt: article.updatedAt,
      author: article.author
        ? {
          name: article.author.name,
          email: article.author.email,
        }
        : undefined,
      coverImage: article.cover
        ? {
          url: article.cover.url,
          width: article.cover.width,
          height: article.cover.height,
          alt: article.cover.alternativeText,
        }
        : undefined,
      url: `${BACKEND_URL}/${locale}/blog/${article.slug}`,
      backendUrl: BACKEND_URL,
    });

    return (
      <PageWrapper>
        <JsonLd code={articleSchema} />
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
              <article className="order-2 lg:order-1">
                <TypographyH1 className="mb-4">{article.title}</TypographyH1>
                {article.description && (
                  <TypographyLead className="mb-6">
                    {article.description}
                  </TypographyLead>
                )}

                {/* Metadata Row */}
                <div className="mb-8 flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
                  {article.author && (
                    <span className="flex items-center gap-2">
                      <span className="text-foreground">
                        {article.author.name}
                      </span>
                    </span>
                  )}
                  {article.publishedAt && (
                    <time dateTime={article.publishedAt}>
                      {new Date(article.publishedAt).toLocaleDateString(
                        locale,
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }
                      )}
                    </time>
                  )}
                </div>

                {/* Cover Image */}
                {article.cover && (
                  <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-lg">
                    <Image
                      src={`${BACKEND_URL}${article.cover.url}`}
                      alt={article.cover.alternativeText || article.title}
                      fill
                      priority
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                    />
                  </div>
                )}

                {/* Article Content - Blocks */}
                <BlockRenderer
                  blocks={article.blocks || []}
                  backendUrl={BACKEND_URL}
                />
              </article>

              <aside className="order-1 space-y-6 lg:order-2">
                {article.author && <AuthorCard author={article.author} />}

                <div className="rounded-lg border bg-card p-6 lg:sticky lg:top-32">
                  <TypographyH3 className="mb-4">
                    Table of Contents
                  </TypographyH3>
                  <TypographyMuted>
                    TOC will be auto-generated from article headings
                  </TypographyMuted>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  } catch (error) {
    // Improved error handling with type differentiation
    console.error('Error loading article:', error);

    // If it's a known error with status code, handle appropriately
    if (error && typeof error === 'object' && 'status' in error) {
      const statusError = error as { status: number };

      // 404 errors should show not found page
      if (statusError.status === 404) {
        notFound();
      }

      // 5xx server errors should bubble up to error boundary
      if (statusError.status >= 500) {
        throw error;
      }
    }

    // Network errors or unknown errors - show not found
    // (Could be enhanced with custom error page in the future)
    notFound();
  }
};

export default BlogPost;
