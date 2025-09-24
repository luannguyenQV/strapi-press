import { categoryService, articleService } from '@repo/strapi-client';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { getDictionary } from '@repo/internationalization';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';

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
    const category = await categoryService.getBySlug(slug);
    
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
    const category = await categoryService.getBySlug(slug);
    
    if (!category) {
      notFound();
    }

    // Get articles for this category
    const { data: articles } = await articleService.getFeaturedArticles(12);
    
    // Filter articles by category (you might want to add this filter to the API call)
    const categoryArticles = articles.filter(article => 
      article.category?.name?.toLowerCase() === category.name.toLowerCase()
    );

    return (
      <div className="container mx-auto px-4 py-8">
        {/* Category Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 text-lg px-4 py-2 capitalize">
            {category.name}
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            {category.name} Articles
          </h1>
          {category.description && (
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {category.description}
            </p>
          )}
        </div>

        {/* Articles Grid */}
        {categoryArticles && categoryArticles.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categoryArticles.map((article) => (
              <Link
                key={article.id}
                href={`/${locale}/blog/${article.slug}`}
                className="group"
              >
                <Card className="h-full hover:shadow-lg transition-all duration-200 group-hover:scale-[1.02]">
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
                    <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </CardTitle>
                    {article.description && (
                      <CardDescription className="line-clamp-3">
                        {article.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground">
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
          <div className="text-center py-12">
            <h3 className="text-2xl font-semibold mb-4">No articles found</h3>
            <p className="text-muted-foreground mb-6">
              There are no articles in the {category.name} category yet.
            </p>
            <Link
              href={`/${locale}`}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              Browse All Articles
            </Link>
          </div>
        )}

        {/* Back to Categories */}
        <div className="mt-12 text-center">
          <Link
            href={`/${locale}#categories`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
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
        <h1 className="text-2xl font-bold mb-4">Error Loading Category</h1>
        <p className="text-muted-foreground mb-6">
          We encountered an error while loading this category. Please try again later.
        </p>
        <Link
          href={`/${locale}`}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          Go Home
        </Link>
      </div>
    );
  }
};

export default CategoryPage;