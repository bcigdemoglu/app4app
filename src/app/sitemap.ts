import { allPosts } from 'contentlayer/generated';
import { MetadataRoute } from 'next';

export const BASE_URL = `https://www.ilayda.com`;

/** Sitemap examples: https://github.com/search?q=path%3Asrc%2Fapp%2Fsitemap.ts+contentlayer&type=code */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const blogs = allPosts.map((post) => ({
    url: `${BASE_URL}${post.url}`,
    lastModified: post.lastModified,
  }));
  const routes = ['', '/blog', '/playground'].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified,
  }));

  return [...routes, ...blogs];
}
