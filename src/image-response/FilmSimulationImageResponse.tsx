import { Photo } from '../photo';
import ImageCaption from './components/ImageCaption';
import MediaPhotoGrid from './components/ImagePhotoGrid';
import ImageContainer from './components/ImageContainer';
import { labelForFilmSimulation } from '@/vendors/fujifilm';
import PhotoFilmSimulationIcon from '@/simulation/PhotoFilmSimulationIcon';
import { FilmSimulation } from '@/simulation';
import { NextImageSize } from '@/services/next-image';

export default function FilmSimulationImageResponse({
  simulation,
  photos,
  width,
  height,
  fontFamily,
}: {
  simulation: FilmSimulation;
  photos: Photo[];
  width: NextImageSize;
  height: number;
  fontFamily: string;
}) {
  return (
    <ImageContainer
      {...{
        width,
        height,
        ...(photos.length === 0 && { background: 'black' }),
      }}
    >
      <MediaPhotoGrid
        {...{
          medias: photos,
          width,
          height,
        }}
      />
      <ImageCaption
        {...{
          width,
          height,
          fontFamily,
          icon: (
            <PhotoFilmSimulationIcon
              simulation={simulation}
              height={height * 0.081}
              style={{ transform: `translateY(${height * 0.001}px)` }}
            />
          ),
        }}
      >
        {labelForFilmSimulation(simulation).medium.toLocaleUpperCase()}
      </ImageCaption>
    </ImageContainer>
  );
}
