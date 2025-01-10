import { parameterize } from '@/utility/string';

export const OUTDATED_THRESHOLD = new Date('2024-06-16');

export type Media = {
  id: string;
  url: string;
  title?: string;
  extension: string;
};

export type RevalidateMedia = (id: string, revalidateRemaining?: boolean) => Promise<unknown>;

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
