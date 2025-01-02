import { VIDEO_WIDTH_MEDIUM, VideoProps } from '.';
import VideoWithFallback from './VideoWithFallback';

export default function VidMedium(props: VideoProps) {
  const { aspectRatio, blurCompatibilityMode, ...rest } = props;
  return (
    <VideoWithFallback
      {...{
        ...rest,
        blurCompatibilityLevel: blurCompatibilityMode ? 'high' : 'none',
        width: VIDEO_WIDTH_MEDIUM,
        height: Math.round(VIDEO_WIDTH_MEDIUM / aspectRatio),
      }}
    />
  );
}
