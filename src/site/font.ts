import fs from 'node:fs';
import path from 'node:path';
import { cwd } from 'node:process';

const FONT_FAMILY_IBM_PLEX_MONO = 'IBMPlexMono';

const getFontData = async () => {
  let data: ArrayBuffer;
  if (fs === undefined) {
    data = await fetch(new URL('/public/fonts/IBMPlexMono-Medium.ttf', import.meta.url)).then(res =>
      res.arrayBuffer(),
    );
  } else {
    const buffer = fs.readFileSync(path.join(cwd(), '/public/fonts/IBMPlexMono-Medium.ttf'));
    data = new Uint8Array(buffer).buffer;
  }
  return data;
};

export const getIBMPlexMonoMedium = () =>
  getFontData().then(data => ({
    fontFamily: FONT_FAMILY_IBM_PLEX_MONO,
    fonts: [
      {
        name: FONT_FAMILY_IBM_PLEX_MONO,
        data,
        weight: 500,
        style: 'normal',
      } as const,
    ],
  }));
