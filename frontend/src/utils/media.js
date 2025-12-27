const BACKEND_ORIGIN = process.env.REACT_APP_BACKEND_ORIGIN || 'http://localhost:5000';

export function getMediaUrl(path) {
  if (!path) return null;
  // If already an absolute URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  // Otherwise assume it's a backend-relative path like /uploads/...
  return `${BACKEND_ORIGIN}${path}`;
}

export default getMediaUrl;
