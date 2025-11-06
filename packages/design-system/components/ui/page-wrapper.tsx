import { cn } from '@repo/design-system/lib/utils';
import type React from 'react';

/**
 * PageWrapper - Generic page layout wrapper
 *
 * Provides consistent container width, spacing, and semantic HTML structure
 * for all pages in the application.
 *
 * @example
 * ```tsx
 * <PageWrapper variant="medium" padding="normal">
 *   <PageHeader title="About Us" description="Learn more" />
 *   <div>Page content here</div>
 * </PageWrapper>
 * ```
 */

export interface PageWrapperProps {
  /** Page content */
  children: React.ReactNode;
  /** Maximum width constraint for content */
  variant?: 'full' | 'narrow' | 'medium' | 'wide';
  /** Vertical padding amount */
  padding?: 'none' | 'tight' | 'normal' | 'relaxed';
  /** Additional CSS classes */
  className?: string;
  /** Semantic HTML element to render */
  as?: 'main' | 'section' | 'article' | 'div';
}

const variantClasses = {
  full: 'w-full',
  narrow: 'mx-auto max-w-3xl', // 768px - focused reading
  medium: 'mx-auto max-w-4xl', // 896px - default content
  wide: 'mx-auto max-w-7xl', // 1280px - dashboards
} as const;

const paddingClasses = {
  none: 'py-0',
  tight: 'py-2',
  normal: 'py-4 md:py-6', // default
  relaxed: 'py-6 md:py-8 lg:py-10',
} as const;

export function PageWrapper({
  children,
  variant = 'medium',
  padding = 'normal',
  className,
  as: Component = 'main',
}: PageWrapperProps) {
  return (
    <Component
      className={cn(
        'container px-2 md:px-3 lg:px-4 space-y-8',
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </Component>
  );
}
