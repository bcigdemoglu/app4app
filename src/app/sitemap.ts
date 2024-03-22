import { MetadataRoute } from 'next';

export const BASE_URL = `https://app.cloudybook.com`;

/** Sitemap examples: https://github.com/search?q=path%3Asrc%2Fapp%2Fsitemap.ts+contentlayer&type=code */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const routes = [''].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified,
  }));

  return [...routes];
}
