'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import type { Dictionary } from '@repo/internationalization';
import { useRouter, useSearchParams } from 'next/navigation';

interface SearchFiltersProps {
  currentCategory: string;
  currentSort: string;
  query: string;
  dictionary: Dictionary;
}

/**
 * SearchFilters - Client component for filtering and sorting search results
 *
 * Features:
 * - Category filter dropdown
 * - Sort options (date, title)
 * - Updates URL parameters on change
 */
export function SearchFilters({ currentCategory, currentSort, query, dictionary }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('q', query);
    params.set('category', category);
    params.set('page', '1'); // Reset to page 1 on filter change
    router.push(`/search?${params.toString()}`);
  };

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('q', query);
    params.set('sort', sort);
    params.set('page', '1'); // Reset to page 1 on sort change
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* Category Filter */}
      <Select value={currentCategory} onValueChange={handleCategoryChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={dictionary.web.search.filters.category} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="web-dev">Web Development</SelectItem>
          <SelectItem value="javascript">JavaScript</SelectItem>
          <SelectItem value="typescript">TypeScript</SelectItem>
          <SelectItem value="react">React</SelectItem>
          <SelectItem value="nextjs">Next.js</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort Options */}
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={dictionary.web.search.filters.sort} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date-desc">{dictionary.web.search.filters.sortDateDesc}</SelectItem>
          <SelectItem value="date-asc">{dictionary.web.search.filters.sortDateAsc}</SelectItem>
          <SelectItem value="title-asc">{dictionary.web.search.filters.sortTitleAsc}</SelectItem>
          <SelectItem value="title-desc">{dictionary.web.search.filters.sortTitleDesc}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
