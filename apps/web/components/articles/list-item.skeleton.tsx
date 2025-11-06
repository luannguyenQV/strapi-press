import { Card } from '@repo/design-system/components/ui/card';
import { Skeleton } from '@repo/design-system/components/ui/skeleton';

/**
 * ArticleListItemSkeleton - Loading state for ArticleListItem component
 *
 * Features:
 * - Matches horizontal card layout of ArticleListItem
 * - Image placeholder on left (300px fixed width on desktop)
 * - Content placeholders on right (title, description, metadata)
 * - Responsive design matching the actual component
 */
export function ArticleListItemSkeleton() {
  return (
    <Card className="overflow-hidden py-0 transition-all">
      <div className="grid grid-cols-[20%_1fr] items-center gap-4 md:grid-cols-[30%_1fr]">
        {/* Image Skeleton */}
        <Skeleton className="aspect-square overflow-hidden rounded-sm md:aspect-[16/9] md:rounded-md" />

        {/* Content Skeleton */}
        <div className="flex flex-col justify-between md:p-4">
          <div>
            {/* Title Skeleton - 2 lines */}
            <div className="mb-2 space-y-2">
              <Skeleton className="h-5 w-full md:h-6" />
              <Skeleton className="h-5 w-3/4 md:h-6" />
            </div>

            {/* Description Skeleton - 3 lines, hidden on mobile */}
            <div className="hidden space-y-2 md:block">
              <Skeleton className="h-4 w-full md:h-5" />
              <Skeleton className="h-4 w-full md:h-5" />
              <Skeleton className="h-4 w-2/3 md:h-5" />
            </div>
          </div>

          {/* Metadata Skeleton */}
          <div className="mt-0 flex flex-wrap items-center gap-5 text-xs md:mt-4 md:text-sm">
            {/* Author */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>

            {/* Date */}
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
    </Card>
  );
}
