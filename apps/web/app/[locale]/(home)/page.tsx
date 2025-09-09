import { getDictionary } from '@repo/internationalization';
import { createMetadata } from '@repo/seo/metadata';
import { articleService } from '@repo/strapi-client';
import type { Metadata } from 'next';
import { Categories } from './components/categories';
import { FeaturedArticles } from './components/featured-articles';
import { ContentTabs } from './components/content-tabs';

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
    <>
      <FeaturedArticles dictionary={dictionary} articles={articles} />
      
      <ContentTabs dictionary={dictionary} articles={articles} />
      
      <Categories dictionary={dictionary} />
    </>
  );
};

export default Home;
