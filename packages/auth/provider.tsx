'use client';

import { SessionProvider } from 'next-auth/react';

type AuthProviderProps = {
  children?: React.ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps): React.JSX.Element => {
  return (
    <SessionProvider>{children}</SessionProvider>
  );
};
