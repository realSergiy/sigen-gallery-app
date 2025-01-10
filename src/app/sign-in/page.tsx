import { auth } from '@/auth';
import SignInForm from '@/auth/SignInForm';
import { PATH_ADMIN } from '@/site/paths';
import { clsx } from 'clsx/lite';
import { redirect } from 'next/navigation';

export default async function SignInPage() {
  const session = await auth();

  if (session?.user) {
    redirect(PATH_ADMIN);
  }

  return (
    <div className={clsx('fixed inset-0', 'flex flex-col items-center justify-center gap-8')}>
      <SignInForm />
    </div>
  );
}
