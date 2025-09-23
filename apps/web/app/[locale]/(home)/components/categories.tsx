import React from 'react';
import { categoryService } from '@repo/strapi-client';
import { Badge } from '@repo/design-system/components/ui/badge';
import Link from 'next/link';

interface CategoriesMenuProps {
  className?: string;
}

export async function CategoriesMenu({  className = '' }: CategoriesMenuProps): Promise<React.JSX.Element | null> {
  try {
    const { data: categories } = await categoryService.getAll({
      sort: ['name:asc'],
      pagination: { limit: 15 }
    });

    if (!categories || categories.length === 0) {
      return null;
    }

    return (
      <aside className={`w-full ${className}`}>
        <div className="sticky top-24 space-y-4">
          <nav className="space-y-2">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                href={`/category/${category.slug}`}
                className="block group"
              >
                <div className="flex items-center space-x-2 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <span className="text-sm font-medium capitalize group-hover:text-primary transition-colors">
                    {category.name}
                  </span>
                </div>
              </Link>
            ))}
          </nav>
          
          {/* Quick Browse Tags */}
          <div className="pt-6 border-t">
            <h4 className="font-medium text-sm mb-3 text-muted-foreground">Quick Browse</h4>
            <div className="flex flex-wrap gap-1">
              {categories.slice(0, 8).map((category) => (
                <Link key={`tag-${category.id}`} href={`/category/${category.slug}`}>
                  <Badge 
                    variant="outline" 
                    className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer text-xs px-2 py-1 capitalize"
                  >
                    {category.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </aside>
    );
  } catch (error) {
    console.error('Error fetching categories:', error);
    return (
      <aside className={`w-full ${className}`}>
        <div className="sticky top-24">
          <h3 className="font-semibold text-lg mb-4">Categories</h3>
          <p className="text-sm text-muted-foreground">
            Unable to load categories at the moment.
          </p>
        </div>
      </aside>
    );
  }
}

// Keep the original Categories component as CategoriesGrid for other uses
export async function CategoriesGrid({ dictionary }: CategoriesProps): Promise<React.JSX.Element | null> {
  try {
    const { data: categories } = await categoryService.getAll({
      sort: ['name:asc'],
      pagination: { limit: 10 }
    });

    if (!categories || categories.length === 0) {
      return null;
    }

    return (
      <section className="py-16 bg-muted/50">
        <div className="container">
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
      </section>
    );
  } catch (error) {
    console.error('Error fetching categories:', error);
    return null;
  }
}

interface CategoriesProps {
  dictionary: any;
}

// Export the sidebar version as the default
export const Categories = CategoriesMenu;