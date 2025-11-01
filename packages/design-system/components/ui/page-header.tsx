import { cn } from '../../lib/utils';
import type React from 'react';
import { TypographyH1, TypographyP } from './typography';

/**
 * PageHeader - Page title and hero section component
 *
 * Displays page title, optional description, and action buttons
 * with consistent typography and spacing.
 *
 * @example
 * ```tsx
 * <PageHeader
 *   title="About Us"
 *   description="Learn more about our mission and team"
 *   variant="center"
 * />
 * ```
 */

export interface PageHeaderProps {
  /** Page title (string or custom React node) */
  title: string | React.ReactNode;
  /** Optional description/subtitle */
  description?: string | React.ReactNode;
  /** Optional action buttons or controls */
  actions?: React.ReactNode;
  /** Text alignment */
  variant?: 'center' | 'left';
  /** Additional CSS classes */
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  variant = 'left',
  className,
}: PageHeaderProps) {
  const alignmentClasses = {
    center: 'text-center',
    left: 'text-left',
  } as const;

  const isStringTitle = typeof title === 'string';
  const isStringDescription = typeof description === 'string';

  return (
    <div className={cn('mb-12', alignmentClasses[variant], className)}>
      {/* Title */}
      {isStringTitle ? (
        <TypographyH1 className="mb-4 text-3xl md:text-4xl lg:text-5xl">
          {title}
        </TypographyH1>
      ) : (
        title
      )}

      {/* Description */}
      {description && (
        <>
          {isStringDescription ? (
            <TypographyP className="text-lg text-muted-foreground md:text-xl [&:not(:first-child)]:mt-0">
              {description}
            </TypographyP>
          ) : (
            description
          )}
        </>
      )}

      {/* Actions */}
      {actions && <div className="mt-8">{actions}</div>}
    </div>
  );
}
