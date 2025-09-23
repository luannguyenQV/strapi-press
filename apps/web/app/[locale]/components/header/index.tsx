import { ModeToggle } from '@repo/design-system/components/mode-toggle';
import { Button } from '@repo/design-system/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@repo/design-system/components/ui/navigation-menu';
import { MoveRight } from 'lucide-react';
import Link from 'next/link';

import type { Dictionary } from '@repo/internationalization';
import Image from 'next/image';
import { LanguageSwitcher } from './language-switcher';
import { getMainNavigationItems } from './main-navigation-items';
import { MobileMenu } from './mobile-menu';
import Logo from './logo.svg';
import { CategoriesMenu } from './categories-menu';
import { GithubMenu } from './github-menu';

type HeaderProps = {
  dictionary: Dictionary;
};

export const Header = async ({ dictionary }: HeaderProps) => {
  const navigationItems = getMainNavigationItems(dictionary);

  return (
    <header className="sticky top-0 left-0 z-40 w-full border-b bg-background">
      <div className="container relative mx-auto flex min-h-12 flex-row items-center gap-4 lg:grid lg:grid-cols-3">
        <div className="hidden flex-row items-center justify-start gap-4 lg:flex">
          <NavigationMenu className="flex items-start justify-start">
            <NavigationMenuList className="flex flex-row justify-start gap-4">
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.title}>
                  {item.href ? (
                    <>
                      <NavigationMenuLink asChild>
                        <Button variant="ghost" asChild>
                          <Link href={item.href}>{item.title}</Link>
                        </Button>
                      </NavigationMenuLink>
                    </>
                  ) : (
                    <>
                      <NavigationMenuTrigger className="font-medium text-sm">
                        {item.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="!w-[450px] p-4">
                        <div className="flex grid-cols-2 flex-col gap-4 lg:grid">
                          <div className="flex h-full flex-col justify-between">
                            <div className="flex flex-col">
                              <p className="text-base">{item.title}</p>
                              <p className="text-muted-foreground text-sm">
                                {item.description}
                              </p>
                            </div>
                            <Button size="sm" className="mt-10" asChild>
                              <Link href="/contact">
                                {dictionary.web.global.primaryCta}
                              </Link>
                            </Button>
                          </div>
                          <div className="flex h-full flex-col justify-end text-sm">
                            {item.items?.map((subItem, idx) => (
                              <NavigationMenuLink
                                href={subItem.href}
                                key={idx}
                                className="flex flex-row items-center justify-between rounded px-4 py-2 hover:bg-muted"
                              >
                                <span>{subItem.title}</span>
                                <MoveRight className="h-4 w-4 text-muted-foreground" />
                              </NavigationMenuLink>
                            ))}
                          </div>
                        </div>
                      </NavigationMenuContent>
                    </>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <Link href="/" className="flex items-center gap-2 lg:justify-center">
          <Image
            src={Logo}
            alt="Logo"
            width={24}
            height={24}
            className="dark:invert"
          />
          <p className="whitespace-nowrap font-semibold">StrapiPress</p>
        </Link>
        <div className="flex w-full justify-end gap-2">
          <GithubMenu />
          <LanguageSwitcher />
          <div className="hidden md:inline">
            <ModeToggle />
          </div>
        </div>
        <MobileMenu navigationItems={navigationItems} />
      </div>
      {/* Categories Menu */}
      <div className="border-t bg-gray-50/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 py-2">
          <CategoriesMenu />
        </div>
      </div>
    </header>
  );
};
