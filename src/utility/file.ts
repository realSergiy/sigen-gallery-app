export const stripExtension = (fileName: string) => {
  const index = fileName.lastIndexOf('.');
  return index === -1 ? fileName : fileName.slice(0, index);
};
