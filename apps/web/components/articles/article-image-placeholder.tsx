

interface ArticleImagePlaceholderProps {
  title: string;
  className?: string;
}

/**
 * ArticleImagePlaceholder - Generates a colored placeholder with first letter
 *
 * Creates a visually appealing placeholder when article has no cover image:
 * - Extracts first uppercase letter from title
 * - Generates consistent color based on letter
 * - Maintains aspect ratio and responsiveness
 *
 * @param title - Article title (extracts first letter)
 * @param className - Optional additional Tailwind classes
 */
export function ArticleImagePlaceholder({ title, className = '' }: ArticleImagePlaceholderProps) {
  // Get first uppercase letter from title
  const firstLetter = title.charAt(0).toUpperCase();

  // Generate consistent color based on first letter
  // Using char code to map to color palette
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-indigo-500',
  ];

  const colorIndex = firstLetter.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];

  return (
    <div className={`flex h-full w-full flex-col items-center justify-center ${bgColor} ${className} p-4`}>
      <div className='font-bold text-6xl text-white md:text-7xl'>
        {firstLetter}
      </div>
    </div >
  );
}
