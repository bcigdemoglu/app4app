import { MDXComponents } from 'mdx/types';
import NextImage from 'next/image';
import { YouTubeEmbed } from '@next/third-parties/google';

export const BlogMDXComponents = {
  img: NextImage, // we remap 'img' to 'NextImage'
  NextImage,
  YouTubeEmbed,
} as MDXComponents;

// export const DocMDXComponents = { img: NextImage, NextImage, Notice } as MDXComponents;
