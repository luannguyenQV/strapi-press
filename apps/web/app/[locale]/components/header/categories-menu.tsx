import Link from 'next/link';
import { categoryService } from '@repo/strapi-client';

export async function CategoriesMenu() {
  let categories = [];

  try {
    const response = await categoryService.getAll({
      sort: ['name:asc'],
      pagination: { limit: 10 }, // Limit to 10 categories for header
    });
    categories = response.data;
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
        {categories.map((category) => (
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