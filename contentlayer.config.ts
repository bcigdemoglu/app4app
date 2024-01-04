import { defineDocumentType, makeSource } from "contentlayer/source-files";
import readingTime from "reading-time";

const Post = defineDocumentType(() => ({
  name: "Post",
  filePathPattern: `**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      description: "The title of the post",
      required: true,
    },
    category: {
      type: "string",
      description: "The category of the post",
      required: true,
    },
    author: {
      type: "string",
      description: "The author of the post",
      required: true,
    },
    date: {
      type: "date",
      description: "The date of the post",
      required: true,
    },
    image: {
      type: "string",
      description: "Blog Image URL",
      // TODO: Change this to a generic default image
      default: "https://avatars.githubusercontent.com/u/101227423?s=200&v=4",
    },
    imageAlt: { type: "string", description: "Blog Image Alt" },
  },
  computedFields: {
    url: {
      type: "string",
      resolve: (post: any) => `/blog/${post._raw.flattenedPath}`,
    },
    slug: {
      type: "string",
      resolve: (post: any) => post._raw.sourceFileName.replace(/\.mdx$/, ""),
    },
    readTime: {
      type: "string",
      resolve: (post: any) => readingTime(post.body.raw).text,
    },
    image: {
      type: "string",
      resolve: (post: any) =>
        post.image.startsWith("http") ? post.image : `/${post.image}`,
    },
  },
}));

export default makeSource({
  contentDirPath: "posts",
  documentTypes: [Post],
});
