import React from 'react';
import { categoryService } from '@repo/strapi-client';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';

interface CategoriesProps {
  dictionary: any;
}

export async function Categories({ dictionary }: CategoriesProps): Promise<React.JSX.Element | null> {
  try {
    const { data: categories } = await categoryService.getAll({
      sort: ['name:asc'],
      pagination: { limit: 10 }
    });

    if (!categories || categories.length === 0) {
      return null
    }

    return (
      <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                href={`/category/${category.slug}`}
                className="transition-transform hover:scale-105"
              >
                <Card className="h-full hover:shadow-lg transition-all">
                  <CardContent className="p-6 text-center">
                    {category.image && (
                      <div className="w-16 h-16 mx-auto mb-4 relative rounded-full overflow-hidden bg-muted">
                        <Image
                          src={category.image.url}
                          alt={category.image.alternativeText || category.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    )}
                    <Badge variant="secondary" className="mb-2 capitalize">
                      {category.name}
                    </Badge>
                    {category.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {category.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Alternative: Simple Badge List */}
          <div className="mt-12">
            <h3 className="text-lg font-semibold text-center mb-6">Quick Browse</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Link key={`badge-${category.id}`} href={`/category/${category.slug}`}>
                  <Badge variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer text-sm py-1 px-3 capitalize">
                    {category.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error('Error fetching categories:', error);
    return (
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">
            Categories
          </h2>
          <p className="text-center text-muted-foreground">
            Unable to load categories at the moment. Please try again later.
          </p>
        </div>
      </section>
    );
  }
}