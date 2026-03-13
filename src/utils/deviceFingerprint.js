export const getDeviceId = () => {
  const raw = [
    navigator.userAgent,
    screen.width,
    screen.height,
    navigator.language,
    navigator.platform
  ].join('|');
  // simple hash
  return btoa(raw).slice(0, 32);
};
