import { ArticleListItemSkeleton } from './list-item.skeleton';

interface ArticleListItemsSkeletonProps {
  count?: number;
}

/**
 * ArticleListItemsSkeleton - Renders multiple ArticleListItemSkeleton components
 *
 * Features:
 * - Displays a configurable number of skeleton loading states
 * - Uses the ArticleListItemSkeleton component for consistency
 * - Default count: 10 skeletons
 * - Vertical stack layout with spacing
 */
export function ArticleListItemsSkeleton({
  count = 10,
}: ArticleListItemsSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <ArticleListItemSkeleton key={i} />
      ))}
    </div>
  );
}
