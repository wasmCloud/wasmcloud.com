import React from 'react';
import { HtmlClassNameProvider } from '@docusaurus/theme-common';
import { DocProvider } from '@docusaurus/plugin-content-docs/client';
import DocItemMetadata from '@theme/DocItem/Metadata';
import DocItemLayout from '@theme/DocItem/Layout';
import type { Props } from '@theme/DocItem';
import DocPageSchema from '@theme/wasmcloud/docs/doc-page-schema';
import CourseSchema from '@theme/wasmcloud/docs/course-schema';

/**
 * Replace the upstream DocItem to inject structured data on every doc page
 * INSIDE the DocProvider context (so the schema components can use useDoc).
 *
 *   - TechArticle (M4) on every doc page
 *   - Course + LearningResource (M7) on Quickstart pages only — the schema
 *     component short-circuits on non-Quickstart pages
 *
 * Mirrors the upstream `node_modules/@docusaurus/theme-classic/lib/theme/DocItem/index.js`
 * (Apache-2.0) and adds the schema components in the natural mount point.
 */
export default function DocItem(props: Props): JSX.Element {
  const docHtmlClassName = `docs-doc-id-${props.content.metadata.id}`;
  const MDXComponent = props.content;
  return (
    <DocProvider content={props.content}>
      <HtmlClassNameProvider className={docHtmlClassName}>
        <DocItemMetadata />
        <DocPageSchema />
        <CourseSchema />
        <DocItemLayout>
          <MDXComponent />
        </DocItemLayout>
      </HtmlClassNameProvider>
    </DocProvider>
  );
}
