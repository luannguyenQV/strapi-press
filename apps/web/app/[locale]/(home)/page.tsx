import { getDictionary } from '@repo/internationalization';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import type React from 'react';
import { Suspense } from 'react';
import { Articles } from './components/articles';
import { ArticlesListSkeleton } from './components/articles-skeleton';
import { FeaturedArticles } from './components/featured-articles';
import { FeaturedArticlesSkeleton } from './components/featured-articles-skeleton';

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
    <div className='container mx-auto flex flex-col items-center px-4 py-8'>
      {/* PPR: FeaturedArticles streams in with ISR caching */}
      <Suspense fallback={<FeaturedArticlesSkeleton />}>
        <FeaturedArticles />
      </Suspense>

      {/* PPR: Articles section with independent loading state */}
      <Suspense fallback={<ArticlesListSkeleton />}>
        <Articles dictionary={dictionary} />
      </Suspense>
    </div>
  );
};

export default Home;
