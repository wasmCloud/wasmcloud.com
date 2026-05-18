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

const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'wasmCloud',
  applicationCategory: 'DeveloperApplication',
  applicationSubCategory: 'Cloud Native Platform',
  operatingSystem: 'Cross-platform',
  description:
    'wasmCloud is an open source CNCF project that enables teams to build, manage, and scale polyglot Wasm applications across any cloud, Kubernetes, or edge.',
  url: 'https://wasmcloud.com',
  downloadUrl: 'https://wasmcloud.com/docs/installation/',
  license: 'https://www.apache.org/licenses/LICENSE-2.0',
  isAccessibleForFree: true,
  author: {
    '@type': 'Organization',
    name: 'wasmCloud',
    url: 'https://wasmcloud.com',
  },
  codeRepository: 'https://github.com/wasmCloud/wasmCloud',
  programmingLanguage: ['Rust', 'Go', 'TypeScript', 'Python'],
  isPartOf: {
    '@type': 'Organization',
    name: 'Cloud Native Computing Foundation',
    url: 'https://www.cncf.io',
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
};

function ContactForm() {
  return (
    <Layout
      title={`wasmCloud - A CNCF Project`}
      description="Build secure, cloud-native platforms and applications with WebAssembly"
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
