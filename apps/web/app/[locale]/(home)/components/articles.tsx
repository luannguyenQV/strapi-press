import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import type { Dictionary } from '@repo/internationalization';
import { articleService } from '@repo/strapi-client/services/article.service';
import { Calendar, Clock, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type ArticlesProps = {
  dictionary: Dictionary;
};

export const Articles = async ({ dictionary }: ArticlesProps) => {
  try {
    // Fetch featured articles from Strapi
    const response = await articleService.getFeaturedArticles(6);
    const articles = response?.data || [];

    if (articles.length === 0) {
      return (
        <div className="w-full py-20 lg:py-40">
          <div className="container mx-auto">
            <div className="flex flex-col gap-10">
              <div className="flex flex-col items-start gap-4">
                <div className="flex flex-col gap-2">
                  <h2 className="max-w-xl text-left font-regular text-3xl tracking-tighter md:text-5xl">
                    Latest Articles
                  </h2>
                  <p className="max-w-xl text-left text-lg text-muted-foreground leading-relaxed tracking-tight md:text-xl">
                    Stay updated with our latest insights and stories.
                  </p>
                </div>
              </div>
              <div className="text-center text-muted-foreground">
                <p>No articles available at the moment. Check back soon!</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full py-20 lg:py-40">
        <div className="container mx-auto">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col items-start gap-4">
              <div className="flex flex-col gap-2">
                <h2 className="max-w-xl text-left font-regular text-3xl tracking-tighter md:text-5xl">
                  Latest Articles
                </h2>
                <p className="max-w-xl text-left text-lg text-muted-foreground leading-relaxed tracking-tight md:text-xl">
                  Stay updated with our latest insights and stories.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => {
                // Strapi v5 returns articles directly, not nested in attributes
                const publishedAt = new Date(article.publishedAt).toLocaleDateString();
                const author = article.author;
                const category = article.category;
                const featuredImage = article.cover;
                const readingTime = article.readingTime || 5;

                return (
                  <Card key={article.id} className="flex flex-col h-full">
                    {featuredImage && (
                      <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
                        <Image
                          src={`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${featuredImage.url}`}
                          alt={featuredImage.alternativeText || article.title}
                          fill
                          className="object-cover transition-transform hover:scale-105"
                        />
                        {category && (
                          <div className="absolute top-4 left-4">
                            <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                              {category.name}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <CardHeader className="flex-1">
                      <CardTitle className="line-clamp-2 text-xl">
                        {article.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3">
                        {article.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {author && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{author.name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{publishedAt}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{readingTime} min read</span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter>
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/blog/${article.slug}`}>
                          Read More
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-center">
              <Button asChild size="lg">
                <Link href="/blog">
                  View All Articles
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading articles:', error);
    
    return (
      <div className="w-full py-20 lg:py-40">
        <div className="container mx-auto">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col items-start gap-4">
              <div className="flex flex-col gap-2">
                <h2 className="max-w-xl text-left font-regular text-3xl tracking-tighter md:text-5xl">
                  Latest Articles
                </h2>
                <p className="max-w-xl text-left text-lg text-muted-foreground leading-relaxed tracking-tight md:text-xl">
                  Stay updated with our latest insights and stories.
                </p>
              </div>
            </div>
            <div className="text-center text-muted-foreground">
              <p>Unable to load articles at the moment. Please try again later.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
};