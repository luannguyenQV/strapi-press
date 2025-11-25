'use client';

import type { Data } from '@repo/strapi-client';
import DOMPurify from 'isomorphic-dompurify';

export interface RichTextWidgetProps {
  data: Data.Component<'shared.rich-text'>;
  className?: string;
}

// DOMPurify configuration for safe HTML rendering
const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'u',
  's',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'blockquote',
  'a',
  'code',
  'pre',
  'img',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'hr',
  'div',
  'span',
  'sub',
  'sup',
];

const ALLOWED_ATTR = [
  'href',
  'target',
  'rel',
  'src',
  'alt',
  'title',
  'class',
  'id',
  'width',
  'height',
  'align',
  'style',
];

// Only allow safe protocols (https, http, mailto, tel, etc.)
// Blocks javascript:, data:, vbscript: and other dangerous protocols
const SAFE_URI_PATTERN =
  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i;

/**
 * RichTextWidget - Renders sanitized HTML content from Strapi
 *
 * Security: Uses DOMPurify to sanitize HTML and prevent XSS attacks
 * - Removes malicious scripts and event handlers
 * - Preserves safe HTML formatting
 * - Works on both client and server-side
 *
 * See SECURITY.md for detailed security documentation
 */
export function RichTextWidget({ data, className = '' }: RichTextWidgetProps) {
  // Sanitize HTML to prevent XSS attacks
  const sanitizedHTML = DOMPurify.sanitize(data.body, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false, // Prevent data-* attributes that could be exploited
    ALLOWED_URI_REGEXP: SAFE_URI_PATTERN,
  });

  // Safe to use dangerouslySetInnerHTML here because content is sanitized with DOMPurify
  // See SECURITY.md for detailed security documentation
  return (
    <div
      className={`prose prose-lg dark:prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  );
}
