import React from 'react';
import Head from '@docusaurus/Head';
import Layout from '@theme/Layout';
import styles from './styles.module.css';
import { CaseStudies } from './_components/case-studies';
import { GetInvolved } from './_components/get-involved';
import { GetStarted } from './_components/get-started';
import { Hero } from './_components/hero';
import { Kubernetes } from './_components/kubernetes';
import { PlatformEngineering } from './_components/platform-engineering';
import { WasmCloudEcosystem } from './_components/wasmcloud-ecosystem';
import { WasmCloudSolves } from './_components/wasmcloud-solves';
import { WasmCloudTechnology } from './_components/wasmcloud-technology';
import { WebAssemblyComponents } from './_components/webassembly-components';
import { WhatIsWasmCloud } from './_components/what-is-wasmcloud';
import { WhyUseWasmCloud } from './_components/why-use-wasmcloud';
import { Cncf } from './_components/cncf';

// Homepage JSON-LD — see the Ahrefs fix plan in the structured-data spike.
//
// Three rules motivate the @graph layout below:
//   1. `codeRepository` and `programmingLanguage` are schema.org properties
//      of SoftwareSourceCode, NOT SoftwareApplication. The source-code
//      facts live on a sibling SoftwareSourceCode node and reference the
//      software application via `about`.
//   2. `isPartOf` requires a CreativeWork or URL value — pointing it at an
//      Organization is invalid. The CNCF relationship is expressed via
//      `sourceOrganization` on SoftwareApplication, which is valid.
//   3. Google's Software App rich result requires `offers`; including a
//      zero-price Offer is accurate for wasmCloud (free, Apache-2.0) and
//      legitimately fills the requirement. The rating requirement is
//      intentionally left unmet — fabricating ratings is a policy violation.
const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://wasmcloud.com/#software',
      name: 'wasmCloud',
      applicationCategory: 'DeveloperApplication',
      applicationSubCategory: 'Cloud Native Platform',
      operatingSystem: 'Cross-platform',
      description:
        'wasmCloud is an open source CNCF project that enables teams to build, manage, and scale polyglot Wasm applications across any cloud, Kubernetes, or edge.',
      url: 'https://wasmcloud.com',
      downloadUrl: 'https://wasmcloud.com/docs/installation/',
      softwareHelp: 'https://wasmcloud.com/docs/',
      license: 'https://www.apache.org/licenses/LICENSE-2.0',
      isAccessibleForFree: true,
      author: { '@id': 'https://wasmcloud.com/#organization' },
      sourceOrganization: {
        '@type': 'Organization',
        name: 'Cloud Native Computing Foundation',
        url: 'https://www.cncf.io',
        sameAs: [
          'https://www.cncf.io/projects/wasmcloud/',
          'https://en.wikipedia.org/wiki/Cloud_Native_Computing_Foundation',
        ],
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
      keywords: [
        'WebAssembly',
        'Wasm',
        'WASI',
        'cloud native',
        'CNCF',
        'distributed computing',
        'Kubernetes',
        'edge computing',
        'platform engineering',
      ],
    },
    {
      '@type': 'SoftwareSourceCode',
      '@id': 'https://wasmcloud.com/#sourcecode',
      name: 'wasmCloud source code',
      codeRepository: 'https://github.com/wasmCloud/wasmCloud',
      programmingLanguage: ['Rust', 'Go', 'TypeScript', 'Python'],
      license: 'https://www.apache.org/licenses/LICENSE-2.0',
      about: { '@id': 'https://wasmcloud.com/#software' },
    },
  ],
};

function ContactForm() {
  return (
    <Layout
      title={`The WebAssembly Application Platform`}
      description="wasmCloud is the leading WebAssembly application platform for platform engineering teams — Sandbox Vibe Coded Apps, Functions, Agents, Triggers, Apps, and more on Kubernetes."
      wrapperClassName="navbar-glass"
    >
      <Head>
        <script type="application/ld+json">
          {JSON.stringify(softwareApplicationSchema)}
        </script>
      </Head>
      <main className={styles.main}>
        <Hero />
        <WasmCloudSolves />
        <WhatIsWasmCloud />
        <WhyUseWasmCloud />
        <PlatformEngineering />
        {/* TODO: enable once video is produced */}
        {/* <WasmCloudTechnology /> */}
        <WebAssemblyComponents />
        <GetInvolved />
        {/* TODO: enable once case studies are approved */}
        {/* <CaseStudies /> */}
        <Kubernetes />
        <WasmCloudEcosystem />
        <GetStarted />
        <Cncf />
      </main>
    </Layout>
  );
}
export default ContactForm;
