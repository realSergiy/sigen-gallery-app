import { parameterize } from '@/utility/string';

export const downloadFileName = ({
  title,
  url,
  extension,
}: {
  title?: string;
  url: string;
  extension: string;
}) => (title ? `${parameterize(title)}.${extension}` : url.split('/').pop() || 'download');
