import React from 'react';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import JsonLd from '@theme/wasmcloud/json-ld';

/**
 * M7 — Course + LearningResource schema for the Quickstart series.
 *
 * The component is a no-op on doc pages outside `/docs/quickstart/`. On the
 * series index (`/docs/quickstart/`) it emits a `Course` JSON-LD listing
 * each step's URL. On each step page it emits a `LearningResource` that
 * references the parent course via `isPartOf`.
 *
 * Note on rich-result eligibility: Google's Course list carousel rich
 * result requires ≥3 courses on the same site (per Google's docs). With
 * only one Quickstart series, the carousel is not attainable; this emits
 * Course schema for parser ingestion and Course-detail rich result
 * eligibility, not the carousel.
 *
 * `HowTo` is intentionally NOT used — Google deprecated it for general use
 * in September 2023.
 */

const PROJECT_ORG_ID = 'https://wasmcloud.com/#organization';
const QUICKSTART_BASE = '/docs/quickstart';
const COURSE_ID = 'https://wasmcloud.com/docs/quickstart/#course';

const QUICKSTART_STEPS = [
  {
    permalink: '/docs/quickstart/',
    name: 'Quickstart — Build & Deploy Your First Wasm App',
    isIndex: true,
  },
  {
    permalink: '/docs/quickstart/develop-a-webassembly-component/',
    name: 'Develop a WebAssembly component',
    isIndex: false,
  },
  {
    permalink: '/docs/quickstart/deploy-a-webassembly-workload/',
    name: 'Deploy a WebAssembly workload',
    isIndex: false,
  },
] as const;

function normalizePath(permalink: string): string {
  return permalink.endsWith('/') ? permalink : permalink + '/';
}

export default function CourseSchema(): JSX.Element | null {
  const { siteConfig } = useDocusaurusContext();
  const { metadata, frontMatter } = useDoc();
  const fm = frontMatter as unknown as Record<string, unknown>;
  const siteUrl = siteConfig.url.replace(/\/$/, '');
  const path = normalizePath(metadata.permalink);

  if (!path.startsWith(QUICKSTART_BASE + '/') && path !== QUICKSTART_BASE + '/') {
    return null;
  }

  const isSeriesIndex = path === QUICKSTART_BASE + '/';

  if (isSeriesIndex) {
    const courseInstances = QUICKSTART_STEPS.filter((s) => !s.isIndex).map(
      (s, idx) => ({
        '@type': 'CourseInstance',
        name: s.name,
        url: `${siteUrl}${s.permalink}`,
        courseMode: 'Online',
        // Order is meaningful for sequential tutorials
        position: idx + 1,
      }),
    );
    const course = {
      '@context': 'https://schema.org',
      '@type': 'Course',
      '@id': COURSE_ID,
      name: 'wasmCloud Quickstart',
      description:
        'Get started with wasmCloud — install the wash CLI, build a WebAssembly component, and deploy your first Wasm workload to Kubernetes in under 15 minutes.',
      provider: { '@id': PROJECT_ORG_ID },
      url: `${siteUrl}${QUICKSTART_BASE}/`,
      educationalLevel: 'Beginner',
      inLanguage: 'en',
      coursePrerequisites: 'Familiarity with a developer environment; Docker or Kubernetes optional but recommended.',
      hasCourseInstance: courseInstances,
    };
    return <JsonLd data={course} />;
  }

  // Step page — emit LearningResource referencing the parent course
  const teaches =
    typeof fm.teaches === 'string'
      ? fm.teaches
      : metadata.title || 'wasmCloud Quickstart step';
  const timeRequired =
    typeof fm.time_required === 'string' ? fm.time_required : undefined;
  const learningResource = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: metadata.title,
    description: metadata.description,
    url: `${siteUrl}${path}`,
    learningResourceType: 'Tutorial',
    educationalLevel: 'Beginner',
    teaches,
    inLanguage: 'en',
    isPartOf: { '@id': COURSE_ID },
    ...(timeRequired && { timeRequired }),
    provider: { '@id': PROJECT_ORG_ID },
  };
  return <JsonLd data={learningResource} />;
}
