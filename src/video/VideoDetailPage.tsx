import AnimateItems from '@/components/AnimateItems';
import VideoLarge from './VideoLarge';
import SiteGrid from '@/components/SiteGrid';
import VideoGrid from './VideoGrid';
import TagHeader from '@/tag/TagHeader';
import CameraHeader from '@/camera/CameraHeader';
import FilmSimulationHeader from '@/simulation/FilmSimulationHeader';
import { TAG_HIDDEN } from '@/tag';
import HiddenHeader from '@/tag/HiddenHeader';
import FocalLengthHeader from '@/focal/FocalLengthHeader';
import VideoHeader from './VideoHeader';
import { Video } from '@/db/video_orm';
import { VideoDateRange, VideoSetAttributes } from '.';

export default function VideoDetailPage({
  video,
  videos,
  videosGrid,
  tag,
  indexNumber,
  count,
  dateRange,
  shouldShare,
  includeFavoriteInAdminMenu,
}: {
  video: Video;
  videos: Video[];
  videosGrid?: Video[];
  indexNumber?: number;
  count?: number;
  dateRange?: VideoDateRange;
  shouldShare?: boolean;
  includeFavoriteInAdminMenu?: boolean;
} & VideoSetAttributes) {
  let customHeader: JSX.Element | undefined;

  if (tag) {
    customHeader =
      tag === TAG_HIDDEN ? (
        <HiddenHeader
          videos={videos}
          selectedVideo={video}
          indexNumber={indexNumber}
          count={count ?? 0}
        />
      ) : (
        <TagHeader
          key={tag}
          tag={tag}
          videos={videos}
          selectedVideo={video}
          indexNumber={indexNumber}
          count={count}
          dateRange={dateRange}
        />
      );
  }

  return (
    <div>
      <SiteGrid
        className="mb-6 mt-1.5"
        contentMain={customHeader ?? <VideoHeader selectedVideo={video} videos={videos} />}
      />
      <AnimateItems
        className="md:mb-8"
        animateFromAppState
        items={[
          <VideoLarge
            key={video.id}
            video={video}
            primaryTag={tag}
            priority
            prefetchRelatedLinks
            showTitle={Boolean(customHeader)}
            showTitleAsH1
            showCamera={!camera}
            showSimulation={!simulation}
            shouldShare={shouldShare}
            shouldShareTag={tag !== undefined}
            shouldShareCamera={camera !== undefined}
            shouldShareSimulation={simulation !== undefined}
            shouldScrollOnShare={false}
            includeFavoriteInAdminMenu={includeFavoriteInAdminMenu}
          />,
        ]}
      />
      <SiteGrid
        sideFirstOnMobile
        contentMain={
          <VideoGrid
            videos={videosGrid ?? videos}
            selectedVideo={video}
            tag={tag}
            camera={camera}
            simulation={simulation}
            focal={focal}
            animateOnFirstLoadOnly
          />
        }
      />
    </div>
  );
}
