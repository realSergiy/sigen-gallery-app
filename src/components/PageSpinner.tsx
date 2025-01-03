import { clsx } from 'clsx/lite';
import Spinner from './Spinner';
import SiteGrid from './SiteGrid';

export default function PageSpinner() {
  return (
    <SiteGrid
      contentMain={
        <div
          className={clsx('flex items-center justify-center', 'min-h-80 w-full sm:min-h-[30rem]')}
        >
          <Spinner size={24} color="light-gray" />
        </div>
      }
    />
  );
}
