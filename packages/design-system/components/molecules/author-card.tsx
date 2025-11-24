import { IMAGE_URL } from '@repo/design-system/constants';
import { cn } from '@repo/design-system/lib/utils';
import type { Author } from '@repo/strapi-client/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Card, CardContent } from '../ui/card';
import { TypographyH3, TypographyMuted } from '../ui/typography';

export interface AuthorCardProps {
  author: Author;
  className?: string;
}

export function AuthorCard({ author, className }: AuthorCardProps) {
  // Get avatar URL from the author's avatar media file
  const avatarUrl = `${IMAGE_URL}${author.avatar?.url}`;

  // Get initials for fallback avatar
  const getInitials = (name?: string) => {
    if (!name) {
      return '?';
    }
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className={cn('max-w-md rounded-sm border', className)}>
      <CardContent className="flex flex-col items-center py-8 text-center">
        <Avatar className="mb-4 size-24">
          <AvatarImage src={avatarUrl} alt={author.name || 'Author'} />
          <AvatarFallback className="text-lg">
            {getInitials(author.name)}
          </AvatarFallback>
        </Avatar>

        <TypographyH3 className="mb-2">{author.name}</TypographyH3>

        {author.email && (
          <TypographyMuted className="leading-relaxed">
            {author.email}
          </TypographyMuted>
        )}
      </CardContent>
    </Card>
  );
}
