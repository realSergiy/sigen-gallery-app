export const blobToImage = (blob: Blob): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject('Error reading image');

    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject('Error reading image');
    reader.onload = e => {
      const result = (e.currentTarget as FileReader).result as string;
      image.src = result;
    };

    reader.readAsDataURL(blob);
  });

export const blobToVideo = (blob: Blob): Promise<HTMLVideoElement> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject('Error reading video');

    const video = document.createElement('video');
    video.onloadeddata = () => resolve(video);
    video.onerror = () => reject('Error reading video');
    reader.onload = e => {
      const result = (e.currentTarget as FileReader).result as string;
      video.src = result;
    };

    reader.readAsDataURL(blob);
  });
