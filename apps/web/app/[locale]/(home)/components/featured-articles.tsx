import { Badge } from '@repo/design-system/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Button } from '@repo/design-system/components/ui/button';
import { Calendar, Clock, User, ArrowRight, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Dictionary } from '@repo/internationalization';

type FeaturedArticlesProps = {
  dictionary: Dictionary;
  articles: any[];
};

export const FeaturedArticles = ({ dictionary, articles }: FeaturedArticlesProps) => {
  if (!articles || articles.length === 0) {
    return null;
  }

  const featuredArticle = articles[0];
  const recentArticles = articles.slice(1, 6);

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden hover:shadow-lg transition-all border-0 shadow-md">
        <div className="grid md:grid-cols-2 gap-0">
          {featuredArticle.cover?.url && (
            <div className="relative aspect-[4/3] md:aspect-square overflow-hidden">
              <Image
                src={`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${featuredArticle.cover.url}`}
                alt={featuredArticle.cover.alternativeText || featuredArticle.title}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          
          <div className="p-8 flex flex-col justify-center">
            {featuredArticle.category && (
              <Badge variant="secondary" className="w-fit mb-4 capitalize">
                {featuredArticle.category.name}
              </Badge>
            )}
            
            <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-4 hover:text-primary transition-colors">
              <Link href={`/blog/${featuredArticle.slug}`}>
                {featuredArticle.title}
              </Link>
            </h1>
            
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {featuredArticle.description}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
              {featuredArticle.author && (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-3 w-3" />
                  </div>
                  <span className="font-medium">{featuredArticle.author.name}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(featuredArticle.publishedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{featuredArticle.readingTime || 8} min read</span>
              </div>
            </div>

            <Button asChild className="w-fit gap-2">
              <Link href={`/blog/${featuredArticle.slug}`}>
                Read Article
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      {/* Secondary Articles - Smaller Cards */}
      {recentArticles.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Latest Articles</h2>
            <Button variant="outline" size="sm" asChild>
              <Link href="/blog" className="gap-1">
                View All
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {recentArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-md transition-all border-0 shadow-sm">
                <CardContent className="p-0">
                  {article.cover?.url && (
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${article.cover.url}`}
                        alt={article.cover.alternativeText || article.title}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                      {article.category && (
                        <div className="absolute top-3 left-3">
                          <Badge variant="secondary" className="text-xs capitalize">
                            {article.category.name}
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="p-6">
                    <h3 className="font-semibold text-lg leading-tight mb-3 hover:text-primary transition-colors">
                      <Link href={`/blog/${article.slug}`}>
                        {article.title}
                      </Link>
                    </h3>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                      {article.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {article.author && <span>{article.author.name}</span>}
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{article.readingTime || 5} min</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};