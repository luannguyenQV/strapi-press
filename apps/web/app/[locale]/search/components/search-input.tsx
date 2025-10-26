'use client';

import { Input } from '@repo/design-system/components/ui/input';
import type { Dictionary } from '@repo/internationalization';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type SearchInputProps = {
  initialQuery?: string;
  dictionary: Dictionary;
};

export const SearchInput = ({ initialQuery = '', dictionary }: SearchInputProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);

  // Sync with URL when navigating
  useEffect(() => {
    const urlQuery = searchParams.get('q') || '';
    if (urlQuery !== query) {
      setQuery(urlQuery);
    }
  }, [searchParams, query]);

  const handleSearch = (value: string) => {
    setQuery(value);

    if (value.trim()) {
      // Update URL with search query
      const params = new URLSearchParams(searchParams.toString());
      params.set('q', value.trim());
      // Reset to page 1 when searching
      params.delete('page');
      router.push(`?${params.toString()}`);
    } else {
      // Clear search params if empty
      router.push('?');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  };

  return (
    <div className="w-full">
      <h1 className="mb-4 font-bold text-2xl md:text-3xl">
        {dictionary.web.search.page.title}
      </h1>
      <div className="relative">
        <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={dictionary.web.search.input.placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => handleSearch(query)}
          className="pl-10"
          aria-label={dictionary.web.search.input.ariaLabel}
        />
      </div>
    </div>
  );
};
