'use client';

import type { Data, MediaFileEntity } from '@repo/strapi-client';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel';

export interface SliderWidgetProps {
  data: Data.Component<'shared.slider'>;
  className?: string;
  backendUrl?: string;
}

export function SliderWidget({
  data,
  className = '',
  backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:1337',
}: SliderWidgetProps) {
  const files = data.files as MediaFileEntity[] | undefined;

  if (!files || files.length === 0) {
    return null;
  }

  return (
    <div className={`my-8 ${className}`}>
      <Carousel opts={{ loop: true }} className="w-full">
        <CarouselContent>
          {files.map((file, index) => (
            <CarouselItem key={index}>
              <div className="relative overflow-hidden rounded-lg">
                <Image
                  src={`${backendUrl}${file.url}`}
                  alt={file.alternativeText || `Slide ${index + 1}`}
                  width={file.width || 1200}
                  height={file.height || 800}
                  className="h-auto w-full object-cover"
                  sizes="100vw"
                  priority={index === 0}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {files.length > 1 && (
          <>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </>
        )}
      </Carousel>
    </div>
  );
}
