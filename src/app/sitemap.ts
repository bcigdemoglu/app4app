import { allPosts } from 'contentlayer/generated';
import { MetadataRoute } from 'next';

const BASE_URL = `https://www.ilayda.com`;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const blogs = allPosts.map((post) => ({
    url: `${BASE_URL}${post.url}`,
    lastModified,
  }));
  const routes = ['', '/blog', '/playground'].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified,
  }));

  return [...routes, ...blogs];
}
