export const detectPlatform = () => {
  const userAgent = window.navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
  const isAndroid = /android/i.test(userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
  const isChrome = /chrome|crios/i.test(userAgent) && !isIOS;
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone;
  if (isIOS && isSafari) return "ios_safari";
  if (isIOS && isStandalone) return "ios_standalone";
  if (isAndroid && isChrome) return "android_chrome";
  if (isAndroid) return "android_other";
  if (isChrome) return "desktop_chrome";
  return "other";
};
