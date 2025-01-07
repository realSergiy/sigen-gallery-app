export async function CopyExif(src: Blob, destination: Blob, type = 'image/jpeg') {
  const exif = await retrieveExif(src);
  return new Blob([destination.slice(0, 2), exif, destination.slice(2)], { type });
}

const SOS = 0xff_da;
const APP1 = 0xff_e1;
const EXIF = 0x45_78_69_66;

const retrieveExif = (blob: Blob): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', e => {
      if (!e.target?.result) {
        return reject('FileReader load result is null');
      }
      const buffer = e.target.result as ArrayBuffer;
      const view = new DataView(buffer);
      let offset = 0;
      if (view.getUint16(offset) !== 0xff_d8) return reject('not a valid jpeg');
      offset += 2;

      while (true) {
        const marker = view.getUint16(offset);
        if (marker === SOS) break;
        const size = view.getUint16(offset + 2);
        if (marker === APP1 && view.getUint32(offset + 4) === EXIF)
          return resolve(blob.slice(offset, offset + 2 + size));
        offset += 2 + size;
      }
      return resolve(new Blob());
    });
    reader.readAsArrayBuffer(blob);
  });
