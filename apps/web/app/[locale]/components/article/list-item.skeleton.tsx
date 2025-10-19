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
    <Card className="overflow-hidden transition-all">
      <div className="grid gap-0 md:grid-cols-[300px_1fr]">
        {/* Image Skeleton */}
        <Skeleton className="aspect-[4/3] w-full md:aspect-auto md:h-full" />

        {/* Content Skeleton */}
        <div className="flex flex-col justify-between p-6 md:p-8">
          <div className="space-y-3">
            {/* Title Skeleton - 2 lines */}
            <div className="space-y-2">
              <Skeleton className="h-7 w-full md:h-8" />
              <Skeleton className="h-7 w-3/4 md:h-8" />
            </div>

            {/* Description Skeleton - 3 lines */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full md:h-5" />
              <Skeleton className="h-4 w-full md:h-5" />
              <Skeleton className="h-4 w-2/3 md:h-5" />
            </div>
          </div>

          {/* Metadata Skeleton */}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            {/* Author */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>

            {/* Date */}
            <Skeleton className="h-4 w-32" />

            {/* Reading time */}
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
    </Card>
  );
}
