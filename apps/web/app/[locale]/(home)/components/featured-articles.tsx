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
  const recentArticles = articles.slice(1, 4);

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Featured Article */}
          <Card className="lg:row-span-2 overflow-hidden border-2 shadow-lg hover:shadow-xl transition-all">
            {featuredArticle.cover?.url && (
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${featuredArticle.cover.url}`}
                  alt={featuredArticle.cover.alternativeText || featuredArticle.title}
                  fill
                  className="object-cover transition-transform hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-primary text-primary-foreground">
                    Featured
                  </Badge>
                </div>
                {featuredArticle.category && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary">
                      {featuredArticle.category.name}
                    </Badge>
                  </div>
                )}
              </div>
            )}
            
            <CardHeader className="space-y-4">
              <div className="space-y-2">
                <CardTitle className="text-2xl md:text-3xl leading-tight">
                  {featuredArticle.title}
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {featuredArticle.description}
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {featuredArticle.author && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
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
            </CardHeader>

            <CardContent className="pt-0">
              <Button asChild size="lg" className="w-full gap-2">
                <Link href={`/blog/${featuredArticle.slug}`}>
                  Read Featured Article
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Articles List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Recent Posts</h3>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/blog" className="gap-1">
                  View All
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>

            {recentArticles.map((article, index) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {article.cover?.url && (
                      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                        <Image
                          src={`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${article.cover.url}`}
                          alt={article.cover.alternativeText || article.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-semibold line-clamp-2 text-sm">
                          <Link 
                            href={`/blog/${article.slug}`} 
                            className="hover:text-primary transition-colors"
                          >
                            {article.title}
                          </Link>
                        </h4>
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          #{index + 2}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {article.description}
                      </p>
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {article.author && <span>{article.author.name}</span>}
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                        <span>{article.readingTime || 5} min</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

       
      </div>
    </section>
  );
};