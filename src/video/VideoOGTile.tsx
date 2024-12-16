import { Video, descriptionForVideo, titleForVideo } from '@/video';
import { absolutePathForVideoImage, pathForVideo } from '@/site/paths';
import OGTile from '@/components/OGTile';

export type OGLoadingState = 'unloaded' | 'loading' | 'loaded' | 'failed';

export default function VideoOGTile({
  video,
  loadingState: loadingStateExternal,
  riseOnHover,
  onLoad,
  onFail,
  retryTime,
  onVisible,
}: {
  video: Video;
  loadingState?: OGLoadingState;
  onLoad?: () => void;
  onFail?: () => void;
  riseOnHover?: boolean;
  retryTime?: number;
  onVisible?: () => void;
}) {
  return (
    <OGTile
      {...{
        title: titleForVideo(video),
        description: descriptionForVideo(video),
        path: pathForVideo({ video }),
        pathImageAbsolute: absolutePathForVideoImage(video),
        loadingState: loadingStateExternal,
        onLoad,
        onFail,
        riseOnHover,
        retryTime,
        onVisible,
      }}
    />
  );
}
