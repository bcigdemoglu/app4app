import { CALENDLY_BETA_CALL_URL } from '@/lib/data';

export const openInNewTab = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

export const openCalendyInNewTab = () => {
  openInNewTab(CALENDLY_BETA_CALL_URL);
};
