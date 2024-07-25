function normalizeUrl(videoIdOrUrl: string): string {
  return isYouTubeUrl(videoIdOrUrl) ? videoIdOrUrl : getUrlFromId(videoIdOrUrl);
}

function isYouTubeUrl(videoIdOrUrl: string): boolean {
  return videoIdOrUrl.includes('youtube.com') || videoIdOrUrl.includes('youtu.be');
}

function getIdFromUrl(url: string): string {
  const urlObj = new URL(url);
  const searchParams = new URLSearchParams(urlObj.search);
  return searchParams.get('v') || urlObj.pathname.split('/').pop();
}

function getUrlFromId(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

function getThumbUrl(videoIdOrUrl: string): string {
  const videoId = isYouTubeUrl(videoIdOrUrl) ? getIdFromUrl(videoIdOrUrl) : videoIdOrUrl;
  return `https://img.youtube.com/vi/${videoId}/0.jpg`;
}

export { normalizeUrl, isYouTubeUrl, getIdFromUrl, getUrlFromId, getThumbUrl };
