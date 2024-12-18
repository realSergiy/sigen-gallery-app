import ResponsiveDate from '@/components/ResponsiveDate';
import { useMemo } from 'react';
import { Video } from '@/db/video_orm';

// ToDo: move to components, doesn't have to be photo or video specific
export default function VideoDate({
  video,
  className,
  dateType = 'takenAt',
}: {
  video: Video;
  className?: string;
  dateType?: 'takenAt' | 'createdAt' | 'updatedAt';
}) {
  const date = useMemo(() => {
    const date = new Date(
      dateType === 'takenAt'
        ? video.takenAt
        : dateType === 'createdAt'
          ? video.createdAt
          : video.updatedAt,
    );
    return isNaN(date.getTime()) ? new Date() : date;
  }, [dateType, video.takenAt, video.createdAt, video.updatedAt]);

  const getTitleLabel = () => {
    switch (dateType) {
      case 'takenAt':
        return 'TAKEN';
      case 'createdAt':
        return 'CREATED';
      case 'updatedAt':
        return 'UPDATED';
    }
  };

  return (
    <ResponsiveDate
      {...{
        date,
        className,
        titleLabel: getTitleLabel(),
      }}
    />
  );
}
