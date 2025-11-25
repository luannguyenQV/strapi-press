import { ArticleListItemSkeleton } from '.';

/**
 * ArticlesListSkeleton - Loading state for Articles component
 *
 */
export function ArticlesListSkeleton() {
  return (
    <div className="w-full py-4">
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <ArticleListItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
