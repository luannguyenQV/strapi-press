/**
 * Custom 404 Not Found Page
 *
 * Professional error page with navigation recovery options
 * Provides search, popular categories, and helpful links
 */

import {
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyMuted,
  TypographyP,
} from '@repo/design-system';
import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent } from '@repo/design-system/components/ui/card';
import { type Category, cachedFind } from '@repo/strapi-client';
import { ArrowLeft, Home, Search } from 'lucide-react';
import Link from 'next/link';

export default async function NotFound() {
  // Fetch popular categories to help users navigate
  let categories: Category[] = [];
  try {
    const response = await cachedFind(
      'categories',
      {
        fields: ['name', 'slug', 'description'],
        pagination: { pageSize: 6 },
        sort: ['name:asc'],
      },
      {
        revalidate: 3600, // 1 hour cache
        tags: ['categories', '404'],
      }
    );
    categories =
      (response?.data as unknown as Category[]) || ([] as Category[]);
  } catch (error) {
    console.error('[404] Error fetching categories:', error);
  }

  return (
    <div className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center px-4 py-16">
      <div className="max-w-2xl text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <TypographyH1 className="text-9xl text-muted-foreground/20">
            404
          </TypographyH1>
        </div>

        {/* Error Message */}
        <div className="mb-8 space-y-4">
          <TypographyH2 className="md:text-4xl">Page Not Found</TypographyH2>
          <TypographyP className="text-lg text-muted-foreground [&:not(:first-child)]:mt-0">
            Sorry, we couldn't find the page you're looking for. It might have
            been moved, deleted, or never existed.
          </TypographyP>
        </div>

        {/* Action Buttons */}
        <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Browse Articles
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Link href="/search">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Link>
          </Button>
        </div>

        {/* Helpful Categories */}
        {categories.length > 0 && (
          <div className="mt-12">
            <TypographyH3 className="mb-6 text-xl">
              Explore Popular Categories
            </TypographyH3>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="block"
                >
                  <Card className="transition-all hover:shadow-md">
                    <CardContent className="p-4">
                      <TypographyH4 className="capitalize">
                        {category.name}
                      </TypographyH4>
                      {category.description && (
                        <TypographyMuted className="mt-2 line-clamp-2 [&:not(:first-child)]:mt-2">
                          {category.description}
                        </TypographyMuted>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-12">
          <TypographyMuted className="[&:not(:first-child)]:mt-0">
            If you believe this is an error, please{' '}
            <Link
              href="/contact"
              className="underline underline-offset-4 hover:text-foreground"
            >
              contact us
            </Link>
            .
          </TypographyMuted>
        </div>
      </div>
    </div>
  );
}
