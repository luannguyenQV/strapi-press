'use client';

import { TypographyH1 } from '@repo/design-system';
import { Input } from '@repo/design-system/components/ui/input';
import type { Dictionary } from '@repo/internationalization';
import { Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import type React from 'react';
import { useState } from 'react';

type SearchInputProps = {
  initialQuery?: string;
  dictionary: Dictionary;
  locale: string;
};

export const SearchInput = ({ initialQuery = '', dictionary, locale }: SearchInputProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);

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

  const handleCancel = () => {
    router.push(`/${locale}`);
  };

  return (
    <div>
      <TypographyH1 className='hidden'>
        {dictionary.web.search.page.title}
      </TypographyH1>
      <div className="relative">
        <Search className='-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 h-4 w-4 text-muted-foreground' />
        <Input
          type="text"
          placeholder={dictionary.web.search.input.placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => handleSearch(query)}
          className="px-10"
          aria-label={dictionary.web.search.input.ariaLabel}
        />
        <button
          type="button"
          onClick={handleCancel}
          className="-translate-y-1/2 absolute top-1/2 right-3 rounded-full p-1 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          aria-label="Cancel search and return home"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
