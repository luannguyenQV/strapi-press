import { getDictionary } from '@repo/internationalization';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchEmptyState } from './components/search-empty-state';
import { SearchInput } from './components/search-input';
import { SearchResults } from './components/search-results';
import { SearchResultsSkeleton } from './components/search-results-skeleton';

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

export async function generateMetadata({ params, searchParams }: SearchPageProps): Promise<Metadata> {
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
    description: dictionary.web.search.meta.descriptionWithQuery.replace('{query}', query),
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Input - Static shell */}
      <div className="mb-8">
        <SearchInput initialQuery={query} dictionary={dictionary} />
      </div>

      {/* Dynamic content with PPR */}
      {query ? (
        <Suspense
          key={`${query}-${page}-${category}-${sort}`}
          fallback={<SearchResultsSkeleton />}
        >
          <SearchResults
            query={query}
            page={page}
            category={category}
            sort={sort}
            dictionary={dictionary}
          />
        </Suspense>
      ) : (
        <SearchEmptyState dictionary={dictionary} />
      )}
    </div>
  );
};

export default SearchPage;
