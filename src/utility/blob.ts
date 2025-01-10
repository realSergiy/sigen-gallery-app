export const blobToImage = (blob: Blob): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject('Error reading image');

    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.onerror = () => reject('Error reading image');
    reader.addEventListener('load', e => {
      const result = (e.currentTarget as FileReader).result as string;
      image.src = result;
    });

    reader.readAsDataURL(blob);
  });

export const blobToVideo = (blob: Blob): Promise<HTMLVideoElement> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject('Error reading video');

    const video = document.createElement('video');
    video.addEventListener('loadeddata', () => resolve(video));
    video.onerror = () => reject('Error reading video');
    reader.addEventListener('load', e => {
      const result = (e.currentTarget as FileReader).result as string;
      video.src = result;
    });

    reader.readAsDataURL(blob);
  });
