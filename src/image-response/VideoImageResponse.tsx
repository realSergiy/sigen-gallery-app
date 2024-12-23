import ImageContainer from './components/ImageContainer';
import { OG_TEXT_BOTTOM_ALIGNMENT } from '@/site/config';
import { NextImageSize } from '@/services/next-image';
import { Video } from '@/db/video_orm';
import MediaPhotoGrid from './components/ImagePhotoGrid';

export default function VideoImageResponse({
  video,
  width,
  height,
  fontFamily,
  isNextImageReady = true,
}: {
  video: Video;
  width: NextImageSize;
  height: number;
  fontFamily: string;
  isNextImageReady: boolean;
}) {
  return (
    <ImageContainer {...{ width, height }}>
      <MediaPhotoGrid
        {...{
          medias: isNextImageReady ? [video] : [],
          width,
          height,
          ...(OG_TEXT_BOTTOM_ALIGNMENT && { imagePosition: 'top' }),
        }}
      />
      {/*
      shouldShowVideoMetadata(video) && (
        <ImageCaption
          {...{
            width,
            height,
            fontFamily,
            ...(video.make === 'Apple' && {
              icon: (
                <AiFillApple
                  style={{
                    marginRight: height * 0.01,
                  }}
                />
              ),
            }),
          }}
        >
          {caption}
        </ImageCaption>
      )*/}
    </ImageContainer>
  );
}
