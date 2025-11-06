import type { Dictionary } from '@repo/internationalization';
import { TypographyH2, TypographyH3, TypographyP } from '@repo/design-system';
import { Search } from 'lucide-react';
import Link from 'next/link';

/**
 * SearchEmptyState - Displayed when no search query is provided
 *
 * Features:
 * - Helpful message
 * - Popular categories
 * - Recent articles link
 */
export function SearchEmptyState({ dictionary }: { dictionary: Dictionary }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Search className="mb-4 h-12 w-12 text-muted-foreground" />
      <TypographyH2 className="mb-2">{dictionary.web.search.page.searchArticles}</TypographyH2>
      <TypographyP className="mb-8 max-w-md text-muted-foreground [&:not(:first-child)]:mt-0">
        {dictionary.web.search.page.enterSearchTerm}
      </TypographyP>

      <div className="space-y-4">
        <TypographyH3 className="text-sm">{dictionary.web.search.page.popularTopics}</TypographyH3>
        <div className="flex flex-wrap justify-center gap-2">
          <Link
            href="/search?q=next.js"
            className="rounded-full border bg-secondary px-4 py-2 text-sm transition-colors hover:bg-secondary/80"
          >
            Next.js
          </Link>
          <Link
            href="/search?q=react"
            className="rounded-full border bg-secondary px-4 py-2 text-sm transition-colors hover:bg-secondary/80"
          >
            React
          </Link>
          <Link
            href="/search?q=typescript"
            className="rounded-full border bg-secondary px-4 py-2 text-sm transition-colors hover:bg-secondary/80"
          >
            TypeScript
          </Link>
          <Link
            href="/search?q=performance"
            className="rounded-full border bg-secondary px-4 py-2 text-sm transition-colors hover:bg-secondary/80"
          >
            Performance
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <Link href="/blog" className="text-primary text-sm hover:underline">
          {dictionary.web.search.page.browseAllArticles} →
        </Link>
      </div>
    </div>
  );
}
