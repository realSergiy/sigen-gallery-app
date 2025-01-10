'use server';

import {
  KEY_CALLBACK_URL,
  KEY_CREDENTIALS_CALLBACK_ROUTE_ERROR_URL,
  KEY_CREDENTIALS_SIGN_IN_ERROR,
  KEY_CREDENTIALS_SIGN_IN_ERROR_URL,
  auth,
  signIn,
  signOut,
} from '@/auth';
import { PATH_ADMIN_PHOTOS, PATH_ROOT } from '@/site/paths';
import type { Session } from 'next-auth';
import { redirect } from 'next/navigation';

export const signInAction = async (_previousState: string | undefined, formData: FormData) => {
  try {
    await signIn('credentials', Object.fromEntries(formData));
  } catch (e) {
    if (
      `${e}`.includes(KEY_CREDENTIALS_SIGN_IN_ERROR) ||
      `${e}`.includes(KEY_CREDENTIALS_SIGN_IN_ERROR_URL) ||
      // New error thrown in next-auth 5.0.0-beta.19 for incorrect credentials
      `${e}`.includes(KEY_CREDENTIALS_CALLBACK_ROUTE_ERROR_URL)
    ) {
      // Return credentials error to display on sign-in page.
      return KEY_CREDENTIALS_SIGN_IN_ERROR;
    } else if (!`${e}`.includes('NEXT_REDIRECT')) {
      console.log('Unknown sign in error:', {
        errorText: `${e}`,
        error: e,
      });
      // Rethrow non-redirect errors
      throw e;
    }
  }
  redirect((formData.get(KEY_CALLBACK_URL) as string) || PATH_ADMIN_PHOTOS);
};

export const signOutAndRedirectAction = async () => signOut({ redirectTo: PATH_ROOT });

export const getAuthAction = async () => auth();

export const logClientAuthUpdate = async (data: Session | null | undefined) =>
  console.log('Client auth update', data);
