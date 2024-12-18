import { authCachedSafe } from '@/auth/cache';
import AdminVideoMenuClient from './AdminVideoMenuClient';
import { ComponentProps } from 'react';

export default async function AdminVideoMenu(props: ComponentProps<typeof AdminVideoMenuClient>) {
  const session = await authCachedSafe();
  return Boolean(session?.user?.email) ? <AdminVideoMenuClient {...props} /> : null;
}
