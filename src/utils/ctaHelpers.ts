export const CALENDLY_BETA_CALL_URL =
  'https://calendly.com/ilaydacloudy/discovery';

export const openInNewTab = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

export const openCalendyInNewTab = () => {
  openInNewTab(CALENDLY_BETA_CALL_URL);
};
