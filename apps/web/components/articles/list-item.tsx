import { BACKEND_URL } from '@/constants';
import { TypographyH3, TypographyP } from '@repo/design-system';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Card } from '@repo/design-system/components/ui/card';
import type { Article } from '@repo/strapi-client';
import { Calendar, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ArticleImagePlaceholder } from './article-image-placeholder';

interface ArticleListItemProps {
  article: Article;
  locale?: string;
}

/**
 * ArticleListItem - Horizontal card layout for article listings
 *
 * Features:
 * - Responsive image with aspect ratio
 * - Category badge
 * - Title, description with line clamping
 * - Author, date, reading time metadata
 * - Hover effects and transitions
 */
export function ArticleListItem({
  article,
  locale = 'en',
}: ArticleListItemProps) {
  const publishedAt = article?.publishedAt
    ? new Date(article?.publishedAt).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <Card className="overflow-hidden py-0 transition-all">
      <div className="grid grid-cols-[20%_1fr] items-center gap-4 md:grid-cols-[30%_1fr]">
        <div className="relative aspect-square overflow-hidden rounded-sm md:aspect-[16/9] md:rounded-md">
          {article.cover?.url ? (
            <Link
              href={`/blog/${article.slug}`}
              className="group relative block h-full w-full"
            >
              <Image
                src={`${BACKEND_URL}${article.cover.url}`}
                alt={article.cover.alternativeText || article.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 20vw, 30vw"
              />
            </Link>
          ) : (
            <Link
              href={`/blog/${article.slug}`}
              className="group relative block h-full w-full"
            >
              <ArticleImagePlaceholder title={article.title} />
            </Link>
          )}

          {/* Category Badge - Only visible on desktop */}
          {article.category && (
            <Link
              href={`/category/${article.category.slug}`}
              className="absolute top-2 left-2 z-10 hidden md:block"
            >
              <Badge
                variant="secondary"
                className="cursor-pointer bg-white/90 capitalize backdrop-blur-sm transition-colors hover:bg-white/100 dark:bg-gray-900/90 dark:hover:bg-gray-900/100"
              >
                {article.category.name}
              </Badge>
            </Link>
          )}
        </div>

        {/* Article Content */}
        <div className="flex flex-col justify-between md:p-4 ">
          <div>
            <Link href={`/blog/${article.slug}`} className="group block">
              <TypographyH3 className="mb-2 line-clamp-2 text-lg transition-colors group-hover:text-primary md:text-xl">
                {article.title}
              </TypographyH3>
            </Link>
            {/* Description */}
            <TypographyP className="line-clamp-3 hidden text-muted-foreground text-sm md:block md:text-base [&:not(:first-child)]:mt-0">
              {article.description}
            </TypographyP>
          </div>

          {/* Metadata */}
          <div className="mt-0 flex flex-wrap items-center gap-5 text-muted-foreground text-xs md:mt-4 md:text-sm">
            {article.author && (
              <Link
                href={`/author/${article.author.slug || article.author.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="flex items-center gap-2 transition-colors hover:text-foreground"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                  <User className="h-3 w-3" />
                </div>
                <span className="font-medium">{article.author.name}</span>
              </Link>
            )}

            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{publishedAt}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
