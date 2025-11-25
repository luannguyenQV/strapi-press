import type { Dictionary } from '@repo/internationalization';

type NavigationItem = {
  title: string;
  href?: string;
  description: string;
  items?: { title: string; href: string }[];
};

export function getMainNavigationItems(
  dictionary: Dictionary
): NavigationItem[] {
  const navigationItems: NavigationItem[] = [];

  return navigationItems;
}
