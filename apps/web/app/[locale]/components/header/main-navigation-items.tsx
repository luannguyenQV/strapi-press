import type { Dictionary } from '@repo/internationalization';

type NavigationItem = {
  title: string;
  href?: string;
  description: string;
  items?: { title: string; href: string }[];
};

export function getMainNavigationItems(dictionary: Dictionary): NavigationItem[] {
  const navigationItems: NavigationItem[] = [
    {
      title: dictionary.web.header.home,
      href: '/',
      description: '',
    }
  ];

  return navigationItems
}