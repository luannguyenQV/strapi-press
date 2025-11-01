import { Skeleton } from '@repo/design-system/components/ui/skeleton';
import { ArticleListItemSkeleton } from '.';

/**
 * ArticlesListSkeleton - Loading state for Articles component
 *
 * Displays skeleton placeholders matching the Articles section layout:
 * - Section header with title and description
 * - 3 ArticleListItemSkeleton components
 * - View All Articles button skeleton
 */
export function ArticlesListSkeleton() {
  return (
    <div className='w-full py-12'>
      <div className="container mx-auto">
        {/* Section Header Skeleton */}
        <div className="mb-8 flex flex-col gap-2">
          <Skeleton className="h-10 w-64" /> {/* Title */}
          <Skeleton className="h-6 w-96" /> {/* Description */}
        </div>

        {/* Articles List Skeleton - 3 cards */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <ArticleListItemSkeleton key={i} />
          ))}
        </div>

        {/* Button Skeleton */}
        <div className="mt-12 flex justify-center">
          <Skeleton className="h-11 w-40" />
        </div>
      </div>
    </div>
  );
}
