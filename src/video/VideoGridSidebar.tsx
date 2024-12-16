'use client';

import { Cameras, sortCamerasWithCount } from '@/camera';
import VideoCamera from '@/camera/VideoCamera';
import HeaderList from '@/components/HeaderList';
import VideoTag from '@/tag/VideoTag';
import { FaTag } from 'react-icons/fa';
import { IoMdCamera } from 'react-icons/io';
import { VideoDateRange, dateRangeForVideos, videoQuantityText } from '.';
import { TAG_FAVS, TAG_HIDDEN, Tags, addHiddenToTags } from '@/tag';
import VideoFilmSimulation from '@/simulation/VideoFilmSimulation';
import VideoFilmSimulationIcon from '@/simulation/VideoFilmSimulationIcon';
import { FilmSimulations, sortFilmSimulationsWithCount } from '@/simulation';
import FavsTag from '../tag/FavsTag';
import { useAppState } from '@/state/AppState';
import { useMemo } from 'react';
import HiddenTag from '@/tag/HiddenTag';
import { SITE_ABOUT } from '@/site/config';
import {
  htmlHasBrParagraphBreaks,
  safelyParseFormattedHtml,
} from '@/utility/html';
import { clsx } from 'clsx/lite';

export default function VideoGridSidebar({
  tags,
  cameras,
  simulations,
  videosCount,
  videosDateRange,
}: {
  tags: Tags;
  cameras: Cameras;
  simulations: FilmSimulations;
  videosCount: number;
  videosDateRange?: VideoDateRange;
}) {
  const { start, end } = dateRangeForVideos(undefined, videosDateRange);

  const { hiddenVideosCount } = useAppState();

  const tagsIncludingHidden = useMemo(
    () => addHiddenToTags(tags, hiddenVideosCount),
    [tags, hiddenVideosCount],
  );

  return (
    <>
      {SITE_ABOUT && (
        <HeaderList
          items={[
            <p
              key="about"
              className={clsx(
                'text-main max-w-60 normal-case',
                htmlHasBrParagraphBreaks(SITE_ABOUT) && 'pb-2',
              )}
              dangerouslySetInnerHTML={{
                __html: safelyParseFormattedHtml(SITE_ABOUT),
              }}
            />,
          ]}
        />
      )}
      {tags.length > 0 && (
        <HeaderList
          title="Tags"
          icon={<FaTag size={12} className="text-icon" />}
          items={tagsIncludingHidden.map(({ tag, count }) => {
            switch (tag) {
              case TAG_FAVS:
                return (
                  <FavsTag
                    key={TAG_FAVS}
                    countOnHover={count}
                    type="icon-last"
                    prefetch={false}
                    contrast="low"
                    badged
                  />
                );
              case TAG_HIDDEN:
                return (
                  <HiddenTag
                    key={TAG_HIDDEN}
                    countOnHover={count}
                    type="icon-last"
                    prefetch={false}
                    contrast="low"
                    badged
                  />
                );
              default:
                return (
                  <VideoTag
                    key={tag}
                    tag={tag}
                    type="text-only"
                    countOnHover={count}
                    prefetch={false}
                    contrast="low"
                    badged
                  />
                );
            }
          })}
        />
      )}
      {cameras.length > 0 && (
        <HeaderList
          title="Cameras"
          icon={
            <IoMdCamera size={13} className="text-icon translate-y-[-0.25px]" />
          }
          items={cameras
            .sort(sortCamerasWithCount)
            .map(({ cameraKey, camera, count }) => (
              <VideoCamera
                key={cameraKey}
                camera={camera}
                type="text-only"
                countOnHover={count}
                prefetch={false}
                contrast="low"
                hideAppleIcon
                badged
              />
            ))}
        />
      )}
      {simulations.length > 0 && (
        <HeaderList
          title="Films"
          icon={<VideoFilmSimulationIcon className="translate-y-[0.5px]" />}
          items={simulations
            .sort(sortFilmSimulationsWithCount)
            .map(({ simulation, count }) => (
              <div key={simulation} className="translate-x-[-2px]">
                <VideoFilmSimulation
                  simulation={simulation}
                  countOnHover={count}
                  type="text-only"
                  prefetch={false}
                />
              </div>
            ))}
        />
      )}
      {videosCount > 0 && start ? (
        <HeaderList
          title={videoQuantityText(videosCount, false)}
          items={start === end ? [start] : [`${end} –`, start]}
        />
      ) : (
        <HeaderList items={[videoQuantityText(videosCount, false)]} />
      )}
    </>
  );
}
