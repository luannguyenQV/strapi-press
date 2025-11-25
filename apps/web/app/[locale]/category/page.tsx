/**
 * All Categories Page - Browse Content by Category
 *
 * Displays all available categories with descriptions and article counts
 * Helps users discover content through category navigation
 */
import { NoResult } from '@/components/no-result';
import { PageWrapper, TypographyH1, TypographyP } from '@repo/design-system';
import { Badge } from '@repo/design-system/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { createMetadata } from '@repo/seo/metadata';
import { cachedFind } from '@repo/strapi-client';
import type { Category } from '@repo/strapi-client';
import { FileText } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export async function generateMetadata(): Promise<Metadata> {
  return createMetadata({
    title: 'Browse Categories',
    description:
      'Explore all article categories and discover content that interests you.',
  });
}

export default async function CategoriesPage() {
  try {
    // Fetch all categories with article counts
    const categoriesResponse = await cachedFind(
      'categories',
      {
        fields: ['name', 'slug', 'description'],
        populate: {
          articles: {
            count: true,
          },
        },
        sort: ['name:asc'],
        pagination: { pageSize: 100 },
      },
      {
        revalidate: false, // Build-time only - categories are static taxonomy
        tags: ['categories', 'categories-page'],
      }
    );

    const categories =
      (categoriesResponse?.data as unknown as Category[]) || [];

    // Get article counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category: Category) => {
        const articlesResponse = await cachedFind(
          'articles',
          {
            filters: {
              category: {
                slug: category.slug,
              },
            },
            pagination: { pageSize: 1 },
          },
          {
            revalidate: 600,
            tags: [`category-${category.slug}`, 'articles'],
          }
        );

        return {
          ...category,
          articleCount: articlesResponse?.meta?.pagination?.total || 0,
        };
      })
    );

    if (categories.length === 0) {
      return <NoResult message="No categories found!" />;
    }

    return (
      <PageWrapper>
        {/* Page Header */}
        <div className="mb-12 text-center">
          <TypographyH1>Browse by Category</TypographyH1>
          <TypographyP className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Explore our articles organized by topic. Find the content that
            matters most to you.
          </TypographyP>
        </div>

        {/* Categories Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categoriesWithCounts.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group block transition-transform hover:scale-[1.02]"
            >
              <Card className="h-full transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between">
                    <CardTitle className="capitalize transition-colors group-hover:text-primary">
                      {category.name}
                    </CardTitle>
                    <Badge variant="secondary" className="ml-2">
                      <FileText className="mr-1 h-3 w-3" />
                      {category.articleCount}
                    </Badge>
                  </div>
                  {category.description && (
                    <CardDescription className="line-clamp-3">
                      {category.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="font-medium text-primary text-sm">
                    View articles →
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-16 rounded-lg border bg-muted/50 p-8 text-center">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <p className="font-bold text-3xl">{categories.length}</p>
              <p className="text-muted-foreground text-sm">Categories</p>
            </div>
            <div>
              <p className="font-bold text-3xl">
                {categoriesWithCounts.reduce(
                  (sum, cat) => sum + cat.articleCount,
                  0
                )}
              </p>
              <p className="text-muted-foreground text-sm">Total Articles</p>
            </div>
            <div>
              <p className="font-bold text-3xl">
                {Math.round(
                  categoriesWithCounts.reduce(
                    (sum, cat) => sum + cat.articleCount,
                    0
                  ) / categories.length
                )}
              </p>
              <p className="text-muted-foreground text-sm">Avg. per Category</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <p className="mb-4 text-muted-foreground">
            Can't find what you're looking for?
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/search"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              Try searching our articles
            </Link>
            <span className="text-muted-foreground">or</span>
            <Link
              href="/contact"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              Contact us
            </Link>
          </div>
        </div>
      </PageWrapper>
    );
  } catch {
    return (
      <PageWrapper>
        <NoResult message="No categories found!" />
      </PageWrapper>
    );
  }
}
