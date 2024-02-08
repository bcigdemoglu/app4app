import fs from 'fs';
import path from 'path';

// Function to write a string to an MDX file
export const writeStringToMdx = (content: string, filename: string): void => {
  const filePath = path.join(
    process.cwd(),
    '../../../lessonWorkbooks',
    `${filename}.mdx`
  );
  fs.writeFileSync(filePath, content);
};

// // Example usage
const mdxContent = `---
title: "Your MDX Title"
---

# MDX Content
This is some MDX content.
`;

writeStringToMdx(mdxContent, 'example.dx');
