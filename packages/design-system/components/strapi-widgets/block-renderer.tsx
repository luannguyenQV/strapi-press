import type { Data } from '@repo/strapi-client';
import { MediaWidget } from './media-widget';
import { QuoteWidget } from './quote-widget';
import { RichTextWidget } from './rich-text-widget';
import { SliderWidget } from './slider-widget';

export type BlockType =
  | Data.Component<'shared.media'>
  | Data.Component<'shared.quote'>
  | Data.Component<'shared.rich-text'>
  | Data.Component<'shared.slider'>;

export interface BlockRendererProps {
  blocks: BlockType[];
  backendUrl?: string;
  className?: string;
}

/**
 * BlockRenderer - Dynamically renders Strapi blocks using corresponding widgets
 *
 * Usage:
 * ```tsx
 * <BlockRenderer blocks={article.blocks} />
 * ```
 */
export function BlockRenderer({
  blocks,
  backendUrl,
  className,
}: BlockRendererProps) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className={className}>
      {blocks.map((block, index) => {
        const component = block.__component;

        // Rich Text Block
        if (component === 'shared.rich-text') {
          const data = block as Data.Component<'shared.rich-text'>;
          return <RichTextWidget key={index} data={data} />;
        }

        // Media Block
        if (component === 'shared.media') {
          const data = block as Data.Component<'shared.media'>;
          return (
            <MediaWidget key={index} data={data} backendUrl={backendUrl} />
          );
        }

        // Quote Block
        if (component === 'shared.quote') {
          const data = block as Data.Component<'shared.quote'>;
          return <QuoteWidget key={index} data={data} />;
        }

        // Slider Block
        if (component === 'shared.slider') {
          const data = block as Data.Component<'shared.slider'>;
          return (
            <SliderWidget key={index} data={data} backendUrl={backendUrl} />
          );
        }

        return null;
      })}
    </div>
  );
}
