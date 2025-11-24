'use client';

import type { Data, MediaFileEntity } from '@repo/strapi-client';
import Image from 'next/image';
import { TypographyMuted } from '../ui/typography';

export interface MediaWidgetProps {
  data: Data.Component<'shared.media'>;
  className?: string;
  backendUrl?: string;
}

export function MediaWidget({
  data,
  className = '',
  backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:1337',
}: MediaWidgetProps) {
  const file = data.file as MediaFileEntity | undefined;

  if (!file) {
    return null
  };


  return (
    <div className={`my-8 ${className}`}>
      <div className="relative w-full overflow-hidden rounded-lg">
        <Image
          src={`${backendUrl}${file.url}`}
          alt={file.alternativeText || ''}
          width={file.width || 1200}
          height={file.height || 800}
          className="h-auto w-full"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          priority={false}
        />
      </div>
      {file.caption && (
        <TypographyMuted className="mt-2 text-center">
          {file.caption}
        </TypographyMuted>
      )}
    </div>
  );
}
