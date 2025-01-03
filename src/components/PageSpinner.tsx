import { clsx } from 'clsx/lite';
import Spinner from './Spinner';
import SiteGrid from './SiteGrid';

export default function PageSpinner() {
  return (
    <SiteGrid
      contentMain={
        <div className={clsx('flex min-h-80 w-full items-center justify-center sm:min-h-[30rem]')}>
          <Spinner size={24} color="light-gray" />
        </div>
      }
    />
  );
}
