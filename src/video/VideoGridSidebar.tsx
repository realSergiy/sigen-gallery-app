'use client';

import HeaderList from '@/components/HeaderList';
import { FaTag } from 'react-icons/fa';
import { VideoDateRange, dateRangeForVideos, videoQuantityText } from '.';
import { TAG_FAVS, TAG_HIDDEN, Tags, addHiddenToTags } from '@/tag';
import FavsTag from '../tag/FavsTag';
import { useAppState } from '@/state/AppState';
import { useMemo } from 'react';
import HiddenTag from '@/tag/HiddenTag';
import { SITE_ABOUT } from '@/site/config';
import { htmlHasBrParagraphBreaks, safelyParseFormattedHtml } from '@/utility/html';
import { clsx } from 'clsx/lite';
import EntityLinkTag from '@/tag/EntityLinkTag';

export default function VideoGridSidebar({
  tags,
  videosCount,
  videosDateRange,
}: {
  tags: Tags;
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
                  <EntityLinkTag
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
