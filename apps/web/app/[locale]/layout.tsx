import './styles.css';
import { DesignSystemProvider } from '@repo/design-system';
import { fonts } from '@repo/design-system/lib/fonts';
import { cn } from '@repo/design-system/lib/utils';
import { getDictionary } from '@repo/internationalization';
import type { Metadata, Viewport } from 'next';
import { Footer } from './components/footer';
import { Header } from './components/header';
import { Providers } from '../../lib/providers';

type RootLayoutProperties = {
  readonly children: React.ReactNode;
  readonly params: Promise<{
    locale: string;
  }>;
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    ),
    title: {
      template: '%s | Next Forge',
      default: 'Next Forge - Production-grade Turborepo Template',
    },
    description: 'A production-ready Turborepo template with Next.js and Strapi CMS',
    openGraph: {
      title: 'Next Forge',
      description: 'A production-ready Turborepo template with Next.js and Strapi CMS',
      siteName: 'Next Forge',
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Next Forge',
      description: 'A production-ready Turborepo template with Next.js and Strapi CMS',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

const RootLayout = async ({ children, params }: RootLayoutProperties) => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <html
      lang={locale}
      className={cn(fonts, 'scroll-smooth')}
      suppressHydrationWarning
    >
      <body>
        <Providers>
          <DesignSystemProvider>
            <Header dictionary={dictionary} />
            {children}
            <Footer locale={locale} />
          </DesignSystemProvider>
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
