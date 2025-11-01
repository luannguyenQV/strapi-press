import { Articles } from '@/components/articles/articles';
import { ArticlesListSkeleton } from '@/components/articles/articles-skeleton';
import { FeaturedArticles } from '@/components/articles/featured-articles';
import { PageWrapper } from '@repo/design-system';
import { getDictionary } from '@repo/internationalization';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import type React from 'react';
import { Suspense } from 'react';

type HomeProps = {
  params: Promise<{
    locale: string;
  }>;
};

export const generateMetadata = async ({
  params,
}: HomeProps): Promise<Metadata> => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return createMetadata(dictionary.web.home.meta);
};

/**
 * Home Page - Implements Partial Prerendering (PPR)
 *
 * The page shell renders immediately with:
 * - Static layout (container, padding)
 * - Loading skeletons for both FeaturedArticles and Articles
 *
 * Dynamic content streams in:
 * - Featured articles (cached with ISR, 5min revalidate)
 * - Latest articles (cached with ISR, 5min revalidate)
 *
 * This provides instant page load while fetching fresh data in the background.
 * Both sections load independently and stream to the client when ready.
 */
const Home = async ({ params }: HomeProps): Promise<React.ReactNode> => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <PageWrapper>
      <Suspense fallback={<div />}>
        <FeaturedArticles />
      </Suspense>

      <Suspense fallback={<ArticlesListSkeleton />}>
        <Articles dictionary={dictionary} />
      </Suspense>
    </PageWrapper>
  );
};

export default Home;
