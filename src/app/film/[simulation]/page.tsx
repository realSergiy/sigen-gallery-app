import { INFINITE_SCROLL_GRID_INITIAL } from '@/photo';
import { FilmSimulation, generateMetaForFilmSimulation } from '@/simulation';
import FilmSimulationOverview from '@/simulation/FilmSimulationOverview';
import { getPhotosFilmSimulationDataCached } from '@/simulation/data';
import { Metadata } from 'next/types';
import { cache } from 'react';

const getPhotosFilmSimulationDataCachedCached = cache(getPhotosFilmSimulationDataCached);

type FilmSimulationProps = {
  params: Promise<{ simulation: FilmSimulation }>;
};

export async function generateMetadata(props: FilmSimulationProps): Promise<Metadata> {
  const params = await props.params;

  const { simulation } = params;

  const [photos, { count, dateRange }] = await getPhotosFilmSimulationDataCachedCached({
    simulation,
    limit: INFINITE_SCROLL_GRID_INITIAL,
  });

  const { url, title, description, images } = generateMetaForFilmSimulation(
    simulation,
    photos,
    count,
    dateRange,
  );

  return {
    title,
    openGraph: {
      title,
      description,
      images,
      url,
    },
    twitter: {
      images,
      description,
      card: 'summary_large_image',
    },
    description,
  };
}

export default async function FilmSimulationPage(props: FilmSimulationProps) {
  const params = await props.params;

  const { simulation } = params;

  const [photos, { count, dateRange }] = await getPhotosFilmSimulationDataCachedCached({
    simulation,
    limit: INFINITE_SCROLL_GRID_INITIAL,
  });

  return (
    <FilmSimulationOverview
      {...{
        simulation,
        photos,
        count,
        dateRange,
      }}
    />
  );
}
