import { BACKEND_URL } from '@/constants';
import { PageWrapper } from '@repo/design-system';
import { getDictionary } from '@repo/internationalization';
import { createMetadata } from '@repo/seo/metadata';
import { type Article, type Data, type QueryParams, cachedFind, safeCastParams } from '@repo/strapi-client';
import type { Metadata } from 'next';
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
    const response = await cachedFind(
      'articles',
      safeCastParams({
        filters: { slug: { $eq: slug } },
        populate: {
          author: {
            populate: ['avatar'],
          },
          category: true,
          cover: true,
        },
      } as QueryParams),
      {
        revalidate: 300, // 5 minutes ISR
        tags: ['articles', `article-${slug}`, 'metadata'],
      }
    );

    const article = response?.data?.[0] as unknown as Article | undefined;

    if (!article) {
      return createMetadata({
        title: `Article Not Found | ${dictionary.web.common.siteName}`,
        description: 'The requested article could not be found.',
      });
    }


    return createMetadata({
      title: `${article.title} | ${dictionary.web.common.siteName}`,
      description: article.description || '',
      openGraph: BACKEND_URL
        ? {
          title: article.title,
          description: article.description || undefined,
          type: 'article',
          publishedTime: article.publishedAt || undefined,
          authors: article.author?.name ? [article.author.name] : undefined,
          images: [
            {
              url: BACKEND_URL,
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
        images: BACKEND_URL ? [BACKEND_URL] : undefined,
      },
    });
  } catch {
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

    const articles = (response?.data || []) as unknown as Article[];

    return articles.map((article) => ({
      slug: article.slug,
    }));
  } catch {
    return [];
  }
}

const BlogPost = async ({ params }: BlogPostProps) => {
  const { locale, slug } = await params;

  try {
    const response = await cachedFind(
      'articles',
      safeCastParams({
        filters: { slug: { $eq: slug } },
        populate: {
          author: {
            populate: ['avatar'],
          },
          category: true,
          cover: true,
          blocks: {
            populate: '*',
          },
        },
      }),
      {
        revalidate: 300, // 5 minutes ISR
        tags: ['articles', `article-${slug}`],
      }
    );

    const article = response?.data?.[0] as unknown as Article | undefined;

    if (!article) {
      notFound();
    }

    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-7xl">
            {/* 2-column responsive grid: main content + sidebar */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
              {/* Main Content Area - Order 2 on mobile, 1 on desktop */}
              <article className="order-2 lg:order-1">
                <h1 className='mb-4 font-bold text-4xl'>{article.title}</h1>
                {article.description && (
                  <p className='mb-6 text-muted-foreground text-xl'>
                    {article.description}
                  </p>
                )}

                {/* Metadata Row */}
                <div className='mb-8 flex flex-wrap items-center gap-4 text-muted-foreground text-sm'>
                  {article.category && (
                    <span className="rounded-md bg-primary/10 px-3 py-1 font-medium text-primary">
                      {article.category.name}
                    </span>
                  )}
                  {article.author && (
                    <span className="flex items-center gap-2">
                      <span className="text-foreground">{article.author.name}</span>
                    </span>
                  )}
                  {article.publishedAt && (
                    <time dateTime={article.publishedAt}>
                      {new Date(article.publishedAt).toLocaleDateString(locale, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  )}
                </div>

                {/* Cover Image */}
                {article.cover && (
                  <div className="mb-8">
                    <img
                      src={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:1337'}${article.cover.url}`}
                      alt={article.cover.alternativeText || article.title}
                      className="h-auto w-full rounded-lg object-cover"
                    />
                  </div>
                )}

                {/* Article Content - Blocks */}
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  {article.blocks?.map((block, index) => {
                    const component = block.__component;

                    if (component === 'shared.rich-text') {
                      const richTextBlock = block as Data.Component<'shared.rich-text'>;
                      return (
                        <div
                          key={index}
                          dangerouslySetInnerHTML={{ __html: richTextBlock.body }}
                        />
                      );
                    }

                    if (component === 'shared.media') {
                      const mediaBlock = block as Data.Component<'shared.media'>;
                      const file = mediaBlock.file;
                      return (
                        <div key={index} className="my-8">
                          <img
                            src={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:1337'}${file.url}`}
                            alt={file.alternativeText || ''}
                            className="h-auto w-full rounded-lg"
                          />
                        </div>
                      );
                    }

                    if (component === 'shared.quote') {
                      const quoteBlock = block as Data.Component<'shared.quote'>;
                      return (
                        <blockquote
                          key={index}
                          className='my-8 border-primary border-l-4 pl-6 italic'
                        >
                          <p className="text-lg">{quoteBlock.body}</p>
                          {quoteBlock.title && (
                            <footer className='mt-2 font-medium text-sm'>
                              — {quoteBlock.title}
                            </footer>
                          )}
                        </blockquote>
                      );
                    }

                    return null;
                  })}
                </div>
              </article>

              {/* Sidebar - Order 1 on mobile, 2 on desktop */}
              <aside className='order-1 lg:sticky lg:top-4 lg:order-2 lg:self-start'>
                <div className="space-y-6">
                  {/* Author Card Placeholder */}
                  {article.author && (
                    <div className="rounded-lg border bg-card p-6">
                      <h3 className="mb-4 font-semibold">About the Author</h3>
                      <div className="flex items-center gap-3">
                        {article.author.name && (
                          <div className='flex size-12 items-center justify-center rounded-full bg-primary/10 font-semibold text-lg text-primary'>
                            {article.author.name[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{article.author.name}</p>
                          {article.author.email && (
                            <p className='text-muted-foreground text-sm'>
                              {article.author.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Table of Contents Placeholder */}
                  <div className="rounded-lg border bg-card p-6">
                    <h3 className="mb-4 font-semibold">Table of Contents</h3>
                    <p className='text-muted-foreground text-sm'>
                      TOC will be auto-generated from article headings
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  } catch (error) {
    console.error('Error loading article:', error);
    notFound();
  }
};

export default BlogPost;
