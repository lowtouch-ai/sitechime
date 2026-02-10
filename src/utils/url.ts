/**
 * Normalizes a host URL by removing trailing slashes.
 */
export const normalizeHost = (host: string): string => {
  if (!host) return host;
  return host.endsWith('/') ? host.slice(0, -1) : host;
};

/**
 * Joins a host and a path, ensuring exactly one slash between them.
 */
export const joinUrl = (host: string, path: string): string => {
  const normalizedHost = normalizeHost(host);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedHost}${normalizedPath}`;
};
