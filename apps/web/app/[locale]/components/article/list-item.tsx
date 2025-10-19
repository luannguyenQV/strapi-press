import { Badge } from '@repo/design-system/components/ui/badge';
import { Card } from '@repo/design-system/components/ui/card';
import type { Article } from '@repo/strapi-client';
import { Calendar, Clock, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

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
export function ArticleListItem({ article, locale = 'en' }: ArticleListItemProps) {
    const publishedAt = new Date(article.publishedAt).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <Link href={`/blog/${article.slug}`} className='group block'>
            <Card className="overflow-hidden transition-all">
                <div className="grid gap-0 md:grid-cols-[300px_1fr]">
                    {/* Article Image */}
                    {article.cover?.url && (
                        <div className='relative aspect-[4/3] overflow-hidden md:aspect-auto'>
                            <Image
                                src={`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${article.cover.url}`}
                                alt={article.cover.alternativeText || article.title}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, 300px"
                            />

                            {/* Category Badge - Overlaid on image */}
                            {article.category && (
                                <div className="absolute top-4 left-4">
                                    <Badge
                                        variant="secondary"
                                        className='bg-white/90 capitalize backdrop-blur-sm hover:bg-white/100'
                                    >
                                        {article.category.name}
                                    </Badge>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Article Content */}
                    <div className="flex flex-col justify-between p-6 md:p-8">
                        <div className="space-y-3">
                            {/* Title */}
                            <h3 className='line-clamp-2 font-bold text-xl leading-tight transition-colors group-hover:text-primary md:text-2xl'>
                                {article.title}
                            </h3>

                            {/* Description */}
                            <p className='line-clamp-3 text-muted-foreground text-sm leading-relaxed md:text-base'>
                                {article.description}
                            </p>
                        </div>

                        {/* Metadata */}
                        <div className="mt-4 flex flex-wrap items-center gap-4 text-muted-foreground text-xs md:text-sm">
                            {article.author && (
                                <div className="flex items-center gap-2">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                                        <User className="h-3 w-3" />
                                    </div>
                                    <span className="font-medium">{article.author.name}</span>
                                </div>
                            )}

                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{publishedAt}</span>
                            </div>

                            {article.readingTime && (
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{article.readingTime} min read</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    );
}
