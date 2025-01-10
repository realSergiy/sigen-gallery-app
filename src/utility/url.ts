// Remove protocol, www, and trailing slash from url
export const shortenUrl = (url?: string) =>
  url ? url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').replace(/\/$/, '') : undefined;

// Add protocol to url and remove trailing slash
export const makeUrlAbsolute = (url?: string) =>
  url === undefined
    ? undefined
    : (url.startsWith('http') ? url : `https://${url}`).replace(/\/$/, '');

export const downloadFileFromBrowser = async (url: string, fileName: string) => {
  const blob = await fetch(url).then(response => response.blob());
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};
