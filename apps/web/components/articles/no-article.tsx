import { TypographyH2, TypographyP } from '@repo/design-system';
import { Frown } from 'lucide-react';

interface NoArticleProps {
  searchQuery?: string;
}

/**
 * NoArticle - Empty state component for when no articles are found
 *
 * Displays a friendly message when search returns no results
 * or when there are no articles available.
 */
export function NoArticle({ searchQuery }: NoArticleProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {/* Frown icon */}
      <Frown className="mb-6 h-16 w-16 text-muted-foreground" />

      {/* Message */}
      <TypographyH2 className="mb-2 text-2xl">
        {searchQuery
          ? `We couldn't find any items matching "${searchQuery}"`
          : "We couldn't find any articles"}
      </TypographyH2>

      <TypographyP className="max-w-md text-muted-foreground [&:not(:first-child)]:mt-2">
        {searchQuery
          ? 'Try adjusting your search or browse all articles'
          : 'No articles are currently available'}
      </TypographyP>
    </div>
  );
}
