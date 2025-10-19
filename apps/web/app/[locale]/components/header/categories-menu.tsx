import Link from 'next/link';
import { cachedFind, type Category } from '@repo/strapi-client';

export async function CategoriesMenu() {
  let categories: Category[] = [];

  try {
    const response = await cachedFind('categories', {
      sort: ['name:asc'],
      pagination: { pageSize: 10 }, // Limit to 10 categories for header
    }, {
      revalidate: 900, // 15 minutes - header menu changes very infrequently
      tags: ['categories', 'categories-menu', 'header']
    });
    categories = (response?.data as unknown as Category[]) || [];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return null;
  }

  if (!categories.length) {
    return null;
  }

  return (
    <nav className="categories-menu">
      <ul className="flex items-center space-x-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {categories.map((category: Category) => (
          <li key={category.id}>
            <Link
              href={`/category/${category.slug}`}
              className="whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-gray-600 transition-all hover:bg-blue-50 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-blue-950 dark:hover:text-blue-400"
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}