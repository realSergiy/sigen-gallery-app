import VideoOGTile from '@/video/VideoOGTile';
import { absolutePathForVideo, pathForVideo } from '@/site/paths';
import { VideoSetAttributes } from '.';
import ShareModal from '@/components/ShareModal';
import { Video } from '@/db/video_orm';

export default function VideoShareModal(
  props: {
    video: Video;
  } & VideoSetAttributes,
) {
  return (
    <ShareModal
      pathShare={absolutePathForVideo(props)}
      pathClose={pathForVideo(props)}
      socialText="Check out this video"
    >
      <VideoOGTile video={props.video} />
    </ShareModal>
  );
}
