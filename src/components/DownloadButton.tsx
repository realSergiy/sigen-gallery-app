import { MdOutlineFileDownload } from 'react-icons/md';
import { clsx } from 'clsx/lite';
import LoaderButton from './primitives/LoaderButton';
import { useState } from 'react';
import { downloadFileFromBrowser } from '@/utility/url';
import { downloadFileName } from '@/media';

export default function DownloadButton({
  media,
  className,
}: {
  media: {
    url: string;
    title?: string;
    extension: string;
  };
  className?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    await downloadFileFromBrowser(media.url, downloadFileName(media)).finally(() =>
      setIsLoading(false),
    );
  };

  return (
    <LoaderButton
      title="Download Original File"
      className={clsx(className, 'text-medium')}
      icon={<MdOutlineFileDownload size={18} />}
      spinnerColor="dim"
      styleAs="link"
      isLoading={isLoading}
      onClick={() => {
        void handleDownload();
      }}
    />
  );
}
