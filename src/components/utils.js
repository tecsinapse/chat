import { RESOURCES } from './Chat/constants/RESOURCES';

const { userAgent } = navigator;

const browserName = () => {
  if (userAgent.match(/edg/i)) {
    return 'edge';
  }

  if (userAgent.match(/chrome|chromium|crios/i)) {
    return 'chrome';
  }

  if (userAgent.match(/firefox|fxios/i)) {
    return 'firefox';
  }

  if (userAgent.match(/safari/i)) {
    return 'safari';
  }

  if (userAgent.match(/opr\//i)) {
    return 'opera';
  }

  return 'No browser detection';
};

export const microphoneByBrowser = () => {
  if (browserName() !== 'edge') {
    return RESOURCES.CHROME_MIC_ICON;
  }

  return RESOURCES.BROWSER_MIC_ICON;
};
