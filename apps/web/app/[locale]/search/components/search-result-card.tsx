import { Badge } from '@repo/design-system/components/ui/badge';
import { Card, CardContent } from '@repo/design-system/components/ui/card';
import { TypographyH3, TypographyP } from '@repo/design-system';
import type { Article } from '@repo/strapi-client';
import { Calendar, Clock, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface SearchResultCardProps {
  article: Article;
  query: string;
}

/**
 * SearchResultCard - Display individual search result
 *
 * Features:
 * - Article cover image
 * - Title with highlighted search terms (future enhancement)
 * - Description excerpt
 * - Metadata (author, date, reading time, category)
 * - Hover effects
 */
export function SearchResultCard({ article, query }: SearchResultCardProps) {
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

  return (
    <Card className="overflow-hidden border-0 shadow-sm transition-all hover:shadow-md">
      <CardContent className="p-0">
        {/* Cover Image */}
        {article.cover?.url && (
          <Link href={`/blog/${article.slug}`}>
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src={`${strapiUrl}${article.cover.url}`}
                alt={article.cover.alternativeText || article.title}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </Link>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Category Badge */}
          {article.category && (
            <Link href={`/category/${article.category.slug}`}>
              <Badge
                variant="secondary"
                className="mb-3 w-fit cursor-pointer capitalize transition-colors hover:bg-secondary/80"
              >
                {article.category.name}
              </Badge>
            </Link>
          )}

          {/* Title */}
          <TypographyH3 className="mb-3 text-lg transition-colors hover:text-primary">
            <Link href={`/blog/${article.slug}`}>{article.title}</Link>
          </TypographyH3>

          {/* Description */}
          <TypographyP className="mb-4 line-clamp-3 text-muted-foreground text-sm [&:not(:first-child)]:mt-0">
            {article.description}
          </TypographyP>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-xs">
            {article.author && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {article.author.name}
              </span>
            )}
            {article.publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(article.publishedAt).toLocaleDateString()}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article.readingTime || 5} min read
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
