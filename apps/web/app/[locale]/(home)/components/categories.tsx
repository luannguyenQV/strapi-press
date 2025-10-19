import { Badge } from '@repo/design-system/components/ui/badge';
import type { Dictionary } from '@repo/internationalization';
import { type Category, cachedFind } from '@repo/strapi-client';
import Link from 'next/link';
import type React from 'react';

interface CategoriesMenuProps {
  className?: string;
}

export async function CategoriesMenu({ className = '' }: CategoriesMenuProps): Promise<React.JSX.Element | null> {
  try {
    const response = await cachedFind('categories', {
      sort: ['name:asc'],
      pagination: { pageSize: 15 }
    }, {
      revalidate: 600, // 10 minutes - categories change infrequently
      tags: ['categories', 'categories-list', 'navigation']
    });
    const categories = (response?.data as unknown as Category[]) || [];

    if (!categories || categories.length === 0) {
      return null;
    }

    return (
      <aside className={`w-full ${className}`}>
        <div className="sticky top-24 space-y-4">
          <nav className="space-y-2">
            {categories.map((category: Category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className='group block'
              >
                <div className='flex items-center space-x-2 rounded-lg px-3 py-2 transition-colors hover:bg-muted/50'>
                  <span className='font-medium text-sm capitalize transition-colors group-hover:text-primary'>
                    {category.name}xxx
                  </span>
                </div>
              </Link>
            ))}
          </nav>

          {/* Quick Browse Tags */}
          <div className='border-t pt-6'>
            <h4 className='mb-3 font-medium text-muted-foreground text-sm'>Quick Browse</h4>
            <div className="flex flex-wrap gap-1">
              {categories.slice(0, 8).map((category) => (
                <Link key={`tag-${category.id}`} href={`/category/${category.slug}`}>
                  <Badge
                    variant="outline"
                    className='cursor-pointer px-2 py-1 text-xs capitalize transition-colors hover:bg-primary hover:text-primary-foreground'
                  >
                    {category.name}xxxx
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
          <h3 className='mb-4 font-semibold text-lg'>Categories</h3>
          <p className='text-muted-foreground text-sm'>
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
    const response = await cachedFind('categories', {
      sort: ['name:asc'],
      pagination: { pageSize: 10 }
    }, {
      revalidate: 600, // 10 minutes - categories change infrequently
      tags: ['categories', 'categories-grid']
    });
    const categories = (response?.data as unknown as Category[]) || [];

    if (!categories || categories.length === 0) {
      return null;
    }

    return (
      <section className='bg-muted/50 py-16'>
        <div className="container">
          <div className='flex flex-wrap justify-center gap-2'>
            {categories.map((category: Category) => (
              <Link key={`badge-${category.id}`} href={`/category/${category.slug}`}>
                <Badge variant="outline" className='cursor-pointer px-3 py-1 text-sm capitalize transition-colors hover:bg-primary hover:text-primary-foreground'>
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
  dictionary: Dictionary;
}

// Export the sidebar version as the default
export const Categories = CategoriesMenu;