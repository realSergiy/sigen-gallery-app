import { parameterize } from '@/utility/string';

export type Media = {
  id: string;
  url: string;
  title?: string;
  extension: string;
};

export const GENERATE_STATIC_PARAMS_LIMIT = 1000;

export const downloadFileName = ({
  title,
  url,
  extension,
}: {
  title?: string;
  url: string;
  extension: string;
}) => (title ? `${parameterize(title)}.${extension}` : url.split('/').pop() || 'download');
