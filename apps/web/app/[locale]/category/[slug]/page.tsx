import { Articles } from '@/components/articles/articles';
import { ArticlesListSkeleton } from '@/components/articles/articles-skeleton';
import { PageWrapper } from '@repo/design-system';
import { } from '@repo/design-system/components/ui/card';
import { getDictionary } from '@repo/internationalization';
import { createMetadata } from '@repo/seo/metadata';
import { type Category, cachedFind } from '@repo/strapi-client';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import NotFound from '../../not-found';

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
      revalidate: false, // Build-time only - category metadata is static
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
  } catch {
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
    return (
      <PageWrapper>
        <Suspense
          key={slug}
          fallback={<ArticlesListSkeleton />}
        >
          <Articles
            dictionary={dictionary}
            categorySlug={slug}
          // sortBy={sortBy}
          />
        </Suspense>
      </PageWrapper>
    );
  } catch {
    return (
      <NotFound />
    )
  }
};

export default CategoryPage;