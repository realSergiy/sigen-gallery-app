import { clsx } from 'clsx/lite';
import Link from 'next/link';
import { BiLogoGithub } from 'react-icons/bi';

export default function RepoLink() {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span className="hidden sm:inline-block">Made with</span>
      <Link
        href="https://github.com/realSergiy"
        target="_blank"
        className={clsx(
          'flex items-center gap-0.5',
          'text-main hover:text-main',
          'hover:underline',
        )}
      >
        <BiLogoGithub size={16} className="hidden translate-y-[0.5px] xs:inline-block" />
        realSergiy
      </Link>
    </span>
  );
}
