import 'server-only';

import { auth as baseAuth, signIn, signOut } from './index';

export { signIn, signOut };

// Export auth function
export const auth = baseAuth;

// currentUser function similar to Clerk's currentUser
export const currentUser = async () => {
  const session = await baseAuth();
  return session?.user || null;
};

// Placeholder types and functions to replace Clerk
export type OrganizationMembership = {
  publicUserData?: {
    userId?: string;
    firstName?: string;
    lastName?: string;
    identifier?: string;
    imageUrl?: string;
  };
};

// Webhook event types to replace Clerk webhook types
export type DeletedObjectJSON = {
  object: string;
  id: string;
  deleted: boolean;
};

export type UserJSON = {
  id: string;
  email_addresses: Array<{ email_address: string }>;
  first_name: string;
  last_name: string;
  image_url: string;
  created_at: number;
};

export type OrganizationJSON = {
  id: string;
  name: string;
  slug: string;
  created_at: number;
};

export type OrganizationMembershipJSON = {
  id: string;
  organization: OrganizationJSON;
  public_user_data: {
    user_id: string;
    first_name: string;
    last_name: string;
    image_url: string;
  };
};

export type WebhookEvent = {
  type: string;
  data: UserJSON | OrganizationJSON | OrganizationMembershipJSON | DeletedObjectJSON;
};