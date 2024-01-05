import { MDXComponents } from 'mdx/types';
import NextImage from 'next/image';

export const BlogMDXComponents = {
  img: NextImage, // we remap 'img' to 'NextImage'
  NextImage,
} as MDXComponents;

// export const DocMDXComponents = { img: NextImage, NextImage, Notice } as MDXComponents;
