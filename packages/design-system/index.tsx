import type { ThemeProviderProps } from 'next-themes';
import { Toaster } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { ThemeProvider } from './providers/theme';

// Export Typography components
export {
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyP,
  TypographyBlockquote,
  TypographyList,
  TypographyInlineCode,
  TypographyLead,
  TypographyLarge,
  TypographySmall,
  TypographyMuted,
} from './components/ui/typography';

// Export Page components
export { PageWrapper } from './components/ui/page-wrapper';
export type { PageWrapperProps } from './components/ui/page-wrapper';
export { PageHeader } from './components/ui/page-header';
export type { PageHeaderProps } from './components/ui/page-header';

// Export Widget components
export {
  RichTextWidget,
  MediaWidget,
  QuoteWidget,
  SliderWidget,
  BlockRenderer,
} from './components/strapi-widgets';

export type {
  RichTextWidgetProps,
  MediaWidgetProps,
  QuoteWidgetProps,
  SliderWidgetProps,
  BlockRendererProps,
  BlockType,
} from './components/strapi-widgets';

// Export Molecule components
export { AuthorCard } from './components/molecules/author-card';
export type { AuthorCardProps } from './components/molecules/author-card';

type DesignSystemProviderProperties = ThemeProviderProps & {
  privacyUrl?: string;
  termsUrl?: string;
  helpUrl?: string;
};

export const DesignSystemProvider = ({
  children,
  privacyUrl,
  termsUrl,
  helpUrl,
  ...properties
}: DesignSystemProviderProperties) => (
  <ThemeProvider {...properties}>
    <TooltipProvider>{children}</TooltipProvider>
    <Toaster />
  </ThemeProvider>
);
