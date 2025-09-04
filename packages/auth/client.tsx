'use client';

import { useSession } from 'next-auth/react';

// Export a hook that mimics the Clerk useUser hook
export function useUser() {
  const { data: session, status } = useSession();
  
  return {
    user: session?.user,
    isLoaded: status !== 'loading',
    isSignedIn: !!session?.user,
  };
}

// Placeholder components to replace Clerk components
export function UserButton(): React.JSX.Element | null {
  const { user, isSignedIn } = useUser();
  
  if (!isSignedIn || !user) {
    return null;
  }
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">{user.email || user.name}</span>
      {/* Add sign out functionality here */}
    </div>
  );
}

export function OrganizationSwitcher(): React.JSX.Element | null {
  // Placeholder - NextAuth doesn't have built-in organization support
  return null;
}