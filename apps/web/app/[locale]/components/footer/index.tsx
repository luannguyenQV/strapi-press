import Link from 'next/link';
import { footerService } from '@repo/strapi-client';
import {
  Github,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  MessageCircle,
  Send
} from 'lucide-react';

const socialIcons = {
  github: Github,
  facebook: Facebook,
  twitter: Twitter,
  x: Twitter, // X uses Twitter icon
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  discord: MessageCircle,
  telegram: Send,
  tiktok: null, // No built-in TikTok icon in lucide
};

interface FooterProps {
  locale?: string;
}

export async function Footer({ locale }: FooterProps): Promise<React.JSX.Element> {
  const footerData = await footerService.getFooter(locale);
  // Fallback footer if no data from Strapi
  if (!footerData) {
    return (
      <footer className="bg-gray-50 dark:bg-gray-900 border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>© 2024 StrapiPress. All rights reserved.</p>
          </div>
        </div>
      </footer>
    );
  }


  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Footer Columns */}
          {footerData.columns?.map((column) => (
            <div key={column.id}>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {column.title}
              </h3>
              <ul className="space-y-2">
                {column.links?.map((link) => (
                  <li key={link.id}>
                    {link.isExternal ? (
                      <a
                        href={link.url}
                        target={link.openInNewTab ? '_blank' : undefined}
                        rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.url}
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Links */}
        {footerData.socialLinks && footerData.socialLinks.length > 0 && (
          <div className="flex justify-center space-x-6 mb-8">
            {footerData.socialLinks.map((social) => {
              const Icon = socialIcons[social.platform];
              if (!Icon) return null;

              return (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label || social.platform}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>
        )}

        {/* Bottom Section */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              {footerData.copyright || '© 2024 StrapiPress. All rights reserved.'}
            </div>

            {/* Bottom Links */}
            {footerData.bottomLinks && footerData.bottomLinks.length > 0 && (
              <div className="flex space-x-6 text-sm">
                {footerData.bottomLinks.map((link) => (
                  link.isExternal ? (
                    <a
                      key={link.id}
                      href={link.url}
                      target={link.openInNewTab ? '_blank' : undefined}
                      rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
                      className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.id}
                      href={link.url}
                      className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                    >
                      {link.label}
                    </Link>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}