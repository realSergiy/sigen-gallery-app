import VideoOGTile from '@/video/VideoOGTile';
import { absolutePathForVideo, pathForVideo } from '@/site/paths';
import { Video, VideoSetAttributes } from '.';
import ShareModal from '@/components/ShareModal';

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
