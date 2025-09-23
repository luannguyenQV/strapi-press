import { getDictionary } from '@repo/internationalization';
import { createMetadata } from '@repo/seo/metadata';
import { articleService } from '@repo/strapi-client';
import { FeaturedArticles } from './components/featured-articles';
import type { Metadata } from 'next';

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

const Home = async ({ params }: HomeProps): Promise<React.JSX.Element> => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  // Fetch articles for the home page layout
  let articles: any[] = [];
  try {
    const response = await articleService.getFeaturedArticles(12);
    articles = response?.data || [];
  } catch (error) {
    console.error('Error fetching articles for home page:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <FeaturedArticles dictionary={dictionary} articles={articles} />
    </div>
  );
};

export default Home;
