import { Card, CardContent } from '@repo/design-system/components/ui/card';
import { Skeleton } from '@repo/design-system/components/ui/skeleton';

export function FeaturedArticlesSkeleton() {
  return (
    <div className='mb-12 space-y-8'>
      {/* Main Featured Article Skeleton */}
      <Card className='overflow-hidden border-0'>
        <div className='grid gap-0 md:grid-cols-2'>
          {/* Image Skeleton */}
          <div className='flex flex-col justify-center'>
            <Skeleton className="aspect-[16/9] w-full" />
          </div>

          {/* Content Skeleton */}
          <div className='flex flex-col justify-center p-8'>
            <Skeleton className="mb-4 h-6 w-24" /> {/* Category badge */}
            <Skeleton className="mb-4 h-8 w-full" /> {/* Title line 1 */}
            <Skeleton className="mb-4 h-8 w-3/4" /> {/* Title line 2 */}
            <Skeleton className="mb-6 h-4 w-full" /> {/* Description line 1 */}
            <Skeleton className="mb-6 h-4 w-full" /> {/* Description line 2 */}
            <Skeleton className="mb-6 h-4 w-2/3" /> {/* Description line 3 */}

            <div className='mb-6 flex items-center gap-4'>
              <Skeleton className="h-4 w-32" /> {/* Author */}
              <Skeleton className="h-4 w-24" /> {/* Date */}
            </div>
          </div>
        </div>
      </Card>

      {/* Secondary Articles Skeleton */}
      <div className="space-y-6">
        <div className='grid gap-6 md:grid-cols-2'>
          {[1, 2].map((i) => (
            <Card key={i} className='border-0 shadow-sm'>
              <CardContent className="p-0">
                <Skeleton className="aspect-[16/10] w-full rounded-2xl" />

                <div className="p-6">
                  <Skeleton className="mb-3 h-6 w-full" /> {/* Title */}
                  <Skeleton className="mb-3 h-6 w-3/4" /> {/* Title line 2 */}

                  <Skeleton className="mb-1 h-4 w-full" /> {/* Description */}
                  <Skeleton className="mb-1 h-4 w-full" />
                  <Skeleton className="mb-4 h-4 w-2/3" />

                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-32" /> {/* Author + Date */}
                    <Skeleton className="h-3 w-16" /> {/* Reading time */}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
