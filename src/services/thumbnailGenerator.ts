'use client';

import { stripExtension } from '@/utility/file';

export const generateThumbnailPng = async (file: File) => {
  const url = URL.createObjectURL(file);

  const video = document.createElement('video');
  video.src = url;
  video.preload = 'metadata';
  video.muted = true;

  return new Promise<File>((resolve, reject) => {
    video.onloadedmetadata = () => {
      video.currentTime = Math.min(video.duration, 1);
    };

    video.onseeked = async () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Error generating thumbnail: could not get canvas context.');
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          blob => {
            if (!blob) {
              reject(new Error('Error generating thumbnail: could not create blob.'));
              return;
            }

            const thumbnailFile = new File([blob], `${stripExtension(file.name)}.png`, {
              type: 'image/png',
            });

            URL.revokeObjectURL(url);
            resolve(thumbnailFile);
          },
          'image/png',
          1,
        );
      } catch (e) {
        reject(e);
      }
    };

    video.onerror = () => {
      reject(new Error('Error generating thumbnail: could not load video.'));
    };
  });
};
