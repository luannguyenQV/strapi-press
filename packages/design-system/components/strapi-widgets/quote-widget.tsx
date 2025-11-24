'use client';

import type { Data } from '@repo/strapi-client';
import {
  TypographyBlockquote,
  TypographyLarge,
  TypographyMuted,
} from '../ui/typography';

export interface QuoteWidgetProps {
  data: Data.Component<'shared.quote'>;
  className?: string;
}

export function QuoteWidget({ data, className = '' }: QuoteWidgetProps) {
  return (
    <div className={`my-8 ${className}`}>
      <TypographyBlockquote className="border-primary border-l-4">
        <TypographyLarge className="not-italic">{data.body}</TypographyLarge>
        {data.title && (
          <TypographyMuted className="mt-4">— {data.title}</TypographyMuted>
        )}
      </TypographyBlockquote>
    </div>
  );
}
