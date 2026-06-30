export const PROKICKS_PUBLIC_URL = 'https://prokicks-play.vercel.app';
export const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@prokicksoficial';
export const CLOUDINARY_CLOUD_NAME = 'dnrqqyfu0';
export const CLOUDINARY_UPLOAD_PRESET = 'prokicks_gallery_unsigned';

export const mediaCategories = ['torneo', 'entrenamiento', 'comunidad', 'spot', 'highlight', 'backstage'];

export function tournamentUrl(id: string) {
  return `${PROKICKS_PUBLIC_URL}/torneos/${encodeURIComponent(id)}`;
}

export function qrImageUrl(value: string, size = 280) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;
}

export function youtubeVideoId(value: string) {
  try {
    const url = new URL(value.trim());
    if (url.hostname.includes('youtu.be')) return url.pathname.split('/').filter(Boolean)[0] || '';
    if (url.pathname.startsWith('/shorts/')) return url.pathname.split('/').filter(Boolean)[1] || '';
    return url.searchParams.get('v') || '';
  } catch {
    return '';
  }
}

export function youtubeEmbedUrl(value: string) {
  const id = youtubeVideoId(value);
  return id ? `https://www.youtube.com/embed/${id}` : '';
}

export function youtubeThumbnailUrl(value: string) {
  const id = youtubeVideoId(value);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '';
}
