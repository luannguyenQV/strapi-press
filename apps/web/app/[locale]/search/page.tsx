import { Articles } from '@/components/articles/articles';
import { ArticlesListSkeleton } from '@/components/articles/articles-skeleton';
import { SearchEmptyState } from '@/components/search/search-empty-state';
import { SearchFilters } from '@/components/search/search-filters';
import { PageWrapper } from '@repo/design-system/components/ui/page-wrapper';
import { getDictionary } from '@repo/internationalization';
import { createMetadata } from '@repo/seo/metadata';
import { type Category, cachedFind } from '@repo/strapi-client';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchInput } from '../../../components/search/search-input';

type SearchPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    q?: string;
    page?: string;
    category?: string;
    sort?: string;
  }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  const searchParamsResolved = await searchParams;
  const query = searchParamsResolved.q || '';

  if (!query) {
    return createMetadata({
      title: dictionary.web.search.meta.title,
      description: dictionary.web.search.meta.description,
    });
  }

  return {
    title: `${dictionary.web.search.meta.titleWithQuery.replace('{query}', query)} | StrapiPress`,
    description: dictionary.web.search.meta.descriptionWithQuery.replace(
      '{query}',
      query
    ),
    robots: 'noindex, follow', // Don't index dynamic search pages
  };
}

/**
 * Search Page - Implements Partial Prerendering (PPR)
 *
 * The page shell renders immediately with:
 * - Static layout (header, container)
 * - Loading skeleton for search results
 *
 * Dynamic content streams in:
 * - Search results based on query
 * - Filtered and sorted articles
 *
 * This provides instant page load while fetching search results in the background.
 */
export const experimental_ppr = true;

const SearchPage = async ({ params, searchParams }: SearchPageProps) => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  const searchParamsResolved = await searchParams;
  const query = searchParamsResolved.q || '';
  const page = searchParamsResolved.page || '1';
  const category = searchParamsResolved.category || 'all';
  const sort = searchParamsResolved.sort || 'date-desc';

  // Fetch categories from backend with ISR cache
  const categoriesResponse = await cachedFind(
    'categories',
    {
      sort: ['name:asc'],
      pagination: { pageSize: 100 },
    },
    {
      revalidate: 600, // 10 minutes - categories change infrequently
      tags: ['categories'],
    }
  );
  const categories = (categoriesResponse?.data as unknown as Category[]) || [];

  // Parse sort parameter (date-desc → 'desc', date-asc → 'asc')
  const sortBy = sort.includes('asc') ? 'asc' : 'desc';

  return (
    <PageWrapper>
      <SearchInput
        initialQuery={query}
        dictionary={dictionary}
        locale={locale}
      />

      {query ? (
        <>
          {/* Search Filters */}
          <div className="mb-6">
            <SearchFilters
              currentCategory={category}
              currentSort={sort}
              query={query}
              dictionary={dictionary}
              categories={categories}
            />
          </div>

          {/* Search Results */}
          <Suspense
            key={`${query}-${page}-${category}-${sort}`}
            fallback={<ArticlesListSkeleton />}
          >
            <Articles
              dictionary={dictionary}
              searchQuery={query}
              categorySlug={category !== 'all' ? category : undefined}
              sortBy={sortBy}
            />
          </Suspense>
        </>
      ) : (
        <SearchEmptyState dictionary={dictionary} />
      )}
    </PageWrapper>
  );
};

export default SearchPage;
