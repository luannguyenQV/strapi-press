'use client';

import { Button } from '@repo/design-system/components/ui/button';
import type { Dictionary } from '@repo/internationalization';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface SearchPaginationProps {
  currentPage: number;
  totalPages: number;
  query: string;
  category: string;
  sort: string;
  dictionary: Dictionary;
}

/**
 * SearchPagination - Client component for navigating search result pages
 *
 * Features:
 * - Previous/Next buttons
 * - Page numbers with ellipsis for many pages
 * - Maintains query and filter parameters
 */
export function SearchPagination({
  currentPage,
  totalPages,
  query,
  category,
  sort,
  dictionary,
}: SearchPaginationProps) {
  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      category,
      sort,
    });
    return `/search?${params.toString()}`;
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7; // Show max 7 page buttons

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Previous button */}
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === 1}
        asChild={currentPage > 1}
      >
        {currentPage > 1 ? (
          <Link href={buildPageUrl(currentPage - 1)} aria-label={dictionary.web.search.pagination.previous}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : (
          <span>
            <ChevronLeft className="h-4 w-4" />
          </span>
        )}
      </Button>

      {/* Page numbers */}
      {pageNumbers.map((page, index) =>
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
            ...
          </span>
        ) : (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            size="icon"
            asChild={currentPage !== page}
          >
            {currentPage === page ? (
              <span>{page}</span>
            ) : (
              <Link href={buildPageUrl(page as number)} aria-label={`${dictionary.web.search.pagination.page} ${page}`}>
                {page}
              </Link>
            )}
          </Button>
        )
      )}

      {/* Next button */}
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === totalPages}
        asChild={currentPage < totalPages}
      >
        {currentPage < totalPages ? (
          <Link href={buildPageUrl(currentPage + 1)} aria-label={dictionary.web.search.pagination.next}>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span>
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </Button>
    </div>
  );
}
