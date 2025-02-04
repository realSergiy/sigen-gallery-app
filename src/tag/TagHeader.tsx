import { Photo, PhotoDateRange } from '@/photo';
import EntityLinkTag from './EntityLinkTag';
import { descriptionForTaggedPhotos, isTagFavs } from '.';
import { pathForTagShare } from '@/site/paths';
import PhotoHeader from '@/photo/PhotoHeader';
import FavsTag from './FavsTag';

export default function TagHeader({
  tag,
  photos,
  selectedPhoto,
  indexNumber,
  count,
  dateRange,
}: {
  tag: string;
  photos: Photo[];
  selectedPhoto?: Photo;
  indexNumber?: number;
  count?: number;
  dateRange?: PhotoDateRange;
}) {
  return (
    <PhotoHeader
      tag={tag}
      entity={
        isTagFavs(tag) ? <FavsTag contrast="high" /> : <EntityLinkTag tag={tag} contrast="high" />
      }
      entityVerb="Tagged"
      entityDescription={descriptionForTaggedPhotos(photos, undefined, count)}
      photos={photos}
      selectedPhoto={selectedPhoto}
      sharePath={pathForTagShare(tag)}
      indexNumber={indexNumber}
      count={count}
      dateRange={dateRange}
    />
  );
}
