export const CLOUDYBOOK_PRICING_URL = 'https://cloudybook.com/#pricing';

export const openInNewTab = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

export const openPricingInNewTab = () => {
  openInNewTab(CLOUDYBOOK_PRICING_URL);
};
