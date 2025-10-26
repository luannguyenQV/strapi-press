import type { Dictionary } from '@repo/internationalization';
import { type Article, DEFAULT_PAGE_SIZE } from '@repo/strapi-client';
import { SearchFilters } from './search-filters';
import { SearchPagination } from './search-pagination';
import { SearchResultCard } from './search-result-card';

interface SearchResultsProps {
  query: string;
  page: string;
  category: string;
  sort: string;
  dictionary: Dictionary;
}

interface SearchResponse {
  query: string;
  results: Article[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    pageCount: number;
  };
  filters: {
    category: string;
    sort: string;
  };
}

/**
 * SearchResults - Server Component for displaying search results
 *
 * Features:
 * - Fetches results from search API
 * - Displays results in grid layout
 * - Shows pagination
 * - Includes filters and sorting
 */
export async function SearchResults({ query, page, category, sort, dictionary }: SearchResultsProps) {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/api/search?`
    // Fetch search results from API
    const res = await fetch(
      apiUrl +
      new URLSearchParams({
        q: query,
        page: page,
        limit: `${DEFAULT_PAGE_SIZE}`,
        category: category,
        sort: sort
      }),
      {
        cache: 'no-store', // Always fetch fresh results for dynamic searches
      }
    );

    if (!res.ok) {
      throw new Error('Search failed');
    }

    const data: SearchResponse = await res.json();

    // No results found
    if (!data.results || data.results.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="mb-4 text-center">
            <h2 className="mb-2 font-semibold text-2xl">{dictionary.web.search.results.noResultsTitle}</h2>
            <p className="text-muted-foreground">
              {dictionary.web.search.results.noResultsDescription}
            </p>
          </div>
          <SearchFilters
            currentCategory={category}
            currentSort={sort}
            query={query}
            dictionary={dictionary}
          />
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Results count and filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-muted-foreground text-sm">
            {dictionary.web.search.results.found} <span className="font-semibold">{data.pagination.total}</span> {dictionary.web.search.results.results}
          </p>
          <SearchFilters
            currentCategory={category}
            currentSort={sort}
            query={query}
            dictionary={dictionary}
          />
        </div>

        {/* Results grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.results.map((article) => (
            <SearchResultCard key={article.id} article={article} query={query} />
          ))}
        </div>

        {/* Pagination */}
        {data.pagination.pageCount > 1 && (
          <SearchPagination
            currentPage={data.pagination.page}
            totalPages={data.pagination.pageCount}
            query={query}
            category={category}
            sort={sort}
            dictionary={dictionary}
          />
        )}
      </div>
    );
  } catch (error) {
    console.error('[SearchResults] Error:', error);

    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <h2 className="mb-2 font-semibold text-2xl">{dictionary.web.search.results.errorTitle}</h2>
          <p className="text-muted-foreground">
            {dictionary.web.search.results.errorDescription}
          </p>
        </div>
      </div>
    );
  }
}
