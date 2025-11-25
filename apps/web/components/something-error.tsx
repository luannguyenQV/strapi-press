import { MessageCircleWarning } from 'lucide-react';

interface ErrorProps {
  message?: string;
  title?: string;
  className?: string;
}

/**
 * Error Component - Displays error state with icon and message
 *
 * A reusable component for showing error states across the application.
 * Uses lucide-react's MessageCircleWarning icon for visual feedback.
 *
 * @param title - Optional error title (defaults to "Something went wrong")
 * @param message - Optional detailed error message
 * @param className - Optional additional Tailwind classes
 */
export function SomethingError({
  title = 'Something went wrong',
  message = 'We encountered an error while loading this content. Please try again later.',
  className = '',
}: ErrorProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 text-center ${className}`}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <MessageCircleWarning className="h-8 w-8 text-destructive" />
      </div>

      <h3 className="mb-2 font-semibold text-foreground text-lg">{title}</h3>

      <p className="max-w-md text-muted-foreground text-sm">{message}</p>
    </div>
  );
}
