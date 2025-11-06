import { TypographyH2 } from '@repo/design-system';
import { CircleAlert } from 'lucide-react';

interface NoResultProps {
  message?: string;
}

/**
 * NoResult - Empty state component for when no search results are found
 *
 * Displays a simple message with circle-alert icon when search returns no results.
 */
export function NoResult({ message }: NoResultProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {/* Circle Alert Icon */}
      <CircleAlert className="mb-4 h-12 w-12 text-muted-foreground" />

      {/* No Results Message */}
      <TypographyH2 className="text-muted-foreground text-xl">
        {message
          ? `No search results found for "${message}"`
          : 'No results found'}
      </TypographyH2>
    </div>
  );
}
