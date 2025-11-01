import { Badge } from '@repo/design-system/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { getDictionary } from '@repo/internationalization';
import { createMetadata } from '@repo/seo/metadata';
import { type Article, type Category, cachedFind } from '@repo/strapi-client';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type CategoryPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export const generateMetadata = async ({
  params,
}: CategoryPageProps): Promise<Metadata> => {
  const { locale, slug } = await params;
  const dictionary = await getDictionary(locale);

  try {
    const response = await cachedFind('categories', {
      filters: { slug: { $eq: slug } }
    }, {
      revalidate: 600, // 10 minutes - category metadata changes infrequently
      tags: ['categories', `category-${slug}`, 'metadata']
    });
    const category = response?.data?.[0] as unknown as Category | undefined;

    if (!category) {
      return createMetadata({
        title: `Category Not Found | ${dictionary.web.common.siteName}`,
        description: 'The requested category could not be found.',
      });
    }

    return createMetadata({
      title: `${category.name} | ${dictionary.web.common.siteName}`,
      description: category.description || `Articles in the ${category.name} category`,
    });
  } catch (error) {
    return createMetadata({
      title: `Category | ${dictionary.web.common.siteName}`,
      description: 'Browse articles by category',
    });
  }
};

const CategoryPage = async ({ params }: CategoryPageProps): Promise<React.JSX.Element> => {
  const { locale, slug } = await params;
  const dictionary = await getDictionary(locale);

  try {
    // Get category details
    const categoryResponse = await cachedFind('categories', {
      filters: { slug: { $eq: slug } }
    }, {
      revalidate: 600, // 10 minutes - category data changes infrequently
      tags: ['categories', `category-${slug}`, 'category-page']
    });
    const category = categoryResponse?.data?.[0] as unknown as Category | undefined;

    if (!category) {
      notFound();
    }

    // Get articles for this category
    const articlesResponse = await cachedFind('articles', {
      filters: {
        category: {
          slug: { $eq: slug }
        }
      },
      sort: ['publishedAt:desc'],
      pagination: { pageSize: 12 },
      populate: {
        author: true,
        category: true,
        cover: true,
      }
    }, {
      revalidate: 300, // 5 minutes - articles change moderately
      tags: ['articles', `category-${slug}`, 'category-articles']
    });

    const categoryArticles = (articlesResponse?.data as unknown as Article[]) || [];

    return (
      <div className="container mx-auto px-4 py-8">
        {/* Category Header */}
        <div className='mb-12 text-center'>
          <Badge variant="secondary" className='mb-4 px-4 py-2 text-lg capitalize'>
            {category.name}
          </Badge>
          <h1 className='mb-4 font-bold text-4xl tracking-tight'>
            {category.name} Articles
          </h1>
          {category.description && (
            <p className='mx-auto max-w-2xl text-muted-foreground text-xl'>
              {category.description}
            </p>
          )}
        </div>

        {/* Articles Grid */}
        {categoryArticles && categoryArticles.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categoryArticles.map((article: Article) => (
              <Link
                key={article.id}
                href={`/${locale}/blog/${article.slug}`}
                className="group"
              >
                <Card className='h-full transition-all duration-200 hover:shadow-lg group-hover:scale-[1.02]'>
                  {article.cover?.url && (
                    <div className="relative aspect-video overflow-hidden rounded-t-lg">
                      <Image
                        src={`http://localhost:1337${article.cover.url}`}
                        alt={article.cover.alternativeText || article.title}
                        fill
                        className="object-cover transition-transform duration-200 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className='line-clamp-2 transition-colors group-hover:text-primary'>
                      {article.title}
                    </CardTitle>
                    {article.description && (
                      <CardDescription className="line-clamp-3">
                        {article.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className='flex items-center text-muted-foreground text-sm'>
                      {article.author?.name && (
                        <>
                          <span>{article.author.name}</span>
                          <span className="mx-2">•</span>
                        </>
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
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className='py-12 text-center'>
            <h3 className='mb-4 font-semibold text-2xl'>No articles found</h3>
            <p className='mb-6 text-muted-foreground'>
              There are no articles in the {category.name} category yet.
            </p>
            <Link
              href={`/${locale}`}
              className='inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'
            >
              Browse All Articles
            </Link>
          </div>
        )}

        {/* Back to Categories */}
        <div className="mt-12 text-center">
          <Link
            href={`/${locale}#categories`}
            className='inline-flex items-center text-muted-foreground text-sm transition-colors hover:text-primary'
          >
            ← Back to all categories
          </Link>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading category page:', error);
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className='mb-4 font-bold text-2xl'>Error Loading Category</h1>
        <p className='mb-6 text-muted-foreground'>
          We encountered an error while loading this category. Please try again later.
        </p>
        <Link
          href={`/${locale}`}
          className='inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm shadow transition-colors hover:bg-primary/90'
        >
          Go Home
        </Link>
      </div>
    );
  }
};

export default CategoryPage;