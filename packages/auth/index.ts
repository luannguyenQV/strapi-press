import NextAuth from 'next-auth';
import { redirect } from 'next/navigation';

// Explicitly type the object returned by `NextAuth` to avoid exporting
// values with complex, non-portable inferred types.
//   https://www.typescriptlang.org/docs/handbook/declaration-files/by-example.html#the-inferred-type-cannot-be-nameable
type AuthKit = ReturnType<typeof NextAuth>;

const authKit = NextAuth({
  providers: [],
});

export const handlers: AuthKit['handlers'] = authKit.handlers;
export const signIn: AuthKit['signIn'] = authKit.signIn;
export const signOut: AuthKit['signOut'] = authKit.signOut;

// Wrap the auth function to add Clerk-like properties
export const auth = async () => {
  const session = await authKit.auth();
  
  return {
    ...session,
    orgId: session?.user?.id ? 'default-org' : null, // Placeholder organization
    userId: session?.user?.id || null,
    redirectToSignIn: () => {
      // Use Next.js redirect to sign-in page
      redirect('/sign-in');
    },
  };
};
