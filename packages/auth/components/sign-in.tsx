'use client';

import { Button } from '@repo/design-system/components/ui/button';

export const SignIn = (): React.JSX.Element => {
  const handleSignIn = async () => {
    // For now, just log that sign in was clicked
    // In a real implementation, you'd trigger the NextAuth sign-in flow
    console.log('Sign in clicked');
    alert('Sign in functionality not yet implemented with NextAuth');
  };

  return (
    <div className="flex flex-col space-y-4">
      <Button onClick={handleSignIn} className="w-full">
        Sign in
      </Button>
      <p className="text-muted-foreground text-sm text-center">
        NextAuth sign-in implementation needed
      </p>
    </div>
  );
};
