import type CMS from 'decap-cms-app';

declare global {
  interface Window {
    CMS_MANUAL_INIT: boolean;
    CMS: typeof CMS;
  }
}
