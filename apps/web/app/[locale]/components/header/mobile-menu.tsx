'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { Menu, MoveRight, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

type NavigationItem = {
  title: string;
  href?: string;
  description: string;
  items?: { title: string; href: string }[];
};

type MobileMenuProps = {
  navigationItems: NavigationItem[];
};

export const MobileMenu = ({ navigationItems }: MobileMenuProps) => {
  const [isOpen, setOpen] = useState(false);

  return (
    <div className="flex w-12 shrink items-end justify-end lg:hidden">
      <Button variant="ghost" onClick={() => setOpen(!isOpen)}>
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      {isOpen && (
        <div className="container absolute top-20 right-0 flex w-full flex-col gap-8 border-t bg-background py-4 shadow-lg">
          {navigationItems.map((item) => (
            <div key={item.title}>
              <div className="flex flex-col gap-2">
                {item.href ? (
                  <Link
                    href={item.href}
                    className="flex items-center justify-between"
                    target={
                      item.href.startsWith('http') ? '_blank' : undefined
                    }
                    rel={
                      item.href.startsWith('http')
                        ? 'noopener noreferrer'
                        : undefined
                    }
                  >
                    <span className="text-lg">{item.title}</span>
                    <MoveRight className="h-4 w-4 stroke-1 text-muted-foreground" />
                  </Link>
                ) : (
                  <p className="text-lg">{item.title}</p>
                )}
                {item.items?.map((subItem) => (
                  <Link
                    key={subItem.title}
                    href={subItem.href}
                    className="flex items-center justify-between"
                  >
                    <span className="text-muted-foreground">
                      {subItem.title}
                    </span>
                    <MoveRight className="h-4 w-4 stroke-1" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};