'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components/ui/tabs';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Button } from '@repo/design-system/components/ui/button';
import { TrendingUp, Clock, MessageSquare, Star } from 'lucide-react';
import Link from 'next/link';
import type { Dictionary } from '@repo/internationalization';

type ContentTabsProps = {
  dictionary: Dictionary;
  articles: any[];
};

export const ContentTabs = ({ dictionary, articles }: ContentTabsProps) => {
  // Sort articles for different tabs
  const latestArticles = [...articles]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 6);

  const topArticles = [...articles]
    .filter(article => article.featured || Math.random() > 0.5) // Mock "top" logic
    .slice(0, 6);

  const discussionArticles = [...articles]
    .filter(article => article.category?.name !== 'announcement')
    .slice(0, 6);

  const renderArticleList = (articles: any[], showMetrics = false) => (
    <div className="space-y-4">
      {articles.map((article, index) => (
        <Card key={article.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {showMetrics && (
                <div className="flex flex-col items-center text-sm text-muted-foreground min-w-[60px]">
                  <TrendingUp className="h-4 w-4 text-primary mb-1" />
                  <span className="font-medium">{Math.floor(Math.random() * 100)}↑</span>
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {index < 3 && (
                    <Badge variant="secondary" className="text-xs">
                      {index === 0 ? '🔥 Hot' : index === 1 ? '⭐ Top' : '📈 Trending'}
                    </Badge>
                  )}
                  {article.category && (
                    <Badge variant="outline" className="text-xs">
                      {article.category.name}
                    </Badge>
                  )}
                </div>
                
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                  <Link 
                    href={`/blog/${article.slug}`} 
                    className="hover:text-primary transition-colors"
                  >
                    {article.title}
                  </Link>
                </h3>
                
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                  {article.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    {article.author && (
                      <span>{article.author.name}</span>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      <span>{Math.floor(Math.random() * 50)} comments</span>
                    </div>
                  </div>
                  {showMetrics && (
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="h-3 w-3 fill-current" />
                      <span>{(Math.random() * 5).toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {articles.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No articles found in this category yet.</p>
        </div>
      )}
    </div>
  );

  return (
    <section className="py-16">
      <div className="container mx-auto">
        <Tabs defaultValue="latest" className="w-full">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">
                Engineering Content
              </h2>
              <p className="text-muted-foreground">
                Discover the latest insights, trending topics, and community discussions
              </p>
            </div>
            
            <TabsList className="grid w-[400px] grid-cols-3">
              <TabsTrigger value="latest" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Latest
              </TabsTrigger>
              <TabsTrigger value="top" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Top
              </TabsTrigger>
              <TabsTrigger value="discussions" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Discussions
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="latest" className="mt-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-muted-foreground">
                Latest Articles • {latestArticles.length} posts
              </h3>
            </div>
            {renderArticleList(latestArticles)}
          </TabsContent>

          <TabsContent value="top" className="mt-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-muted-foreground">
                Top Rated • {topArticles.length} posts
              </h3>
            </div>
            {renderArticleList(topArticles, true)}
          </TabsContent>

          <TabsContent value="discussions" className="mt-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-muted-foreground">
                Community Discussions • {discussionArticles.length} posts
              </h3>
            </div>
            {renderArticleList(discussionArticles)}
          </TabsContent>
        </Tabs>

        <div className="text-center mt-12">
          <Button asChild size="lg" variant="outline">
            <Link href="/blog">
              View All Articles
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};