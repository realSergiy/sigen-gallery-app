export const removeBase64Prefix = (base64: string) => {
  return new RegExp(`^data:image\\/[a-z]{3,4};base64,(.+)$`).exec(base64)?.[1] ?? base64;
};
