import React from 'react';
import Layout from '@theme/Layout';
import styles from './styles.module.css';
import { Hero } from './_components/hero';
import { WhatIsWasmCloud } from './_components/what-is-wasmcloud';
import { WhyUseWasmCloud } from './_components/why-use-wasmcloud';
import { WasmCloudTechnology } from './_components/wasmcloud-technology';
import { WebAssemblyComponents } from './_components/webassembly-components';
import { GetInvolved } from './_components/get-involved';
import { CaseStudies } from './_components/case-studies';
import { Kubernetes } from './_components/kubernetes';
import { WasmCloudEcosystem } from './_components/wasmcloud-ecosystem';
import { GetStarted } from './_components/get-started';

function ContactForm() {
  return (
    <Layout
      title={`wasmCloud - A CNCF Project`}
      description="Build secure, cloud-native platforms and applications with WebAssembly"
      wrapperClassName="navbar-glass"
    >
      <main className={styles.main}>
        <Hero />
        <WhatIsWasmCloud />
        <WhyUseWasmCloud />
        <WasmCloudTechnology />
        <WebAssemblyComponents />
        <GetInvolved />
        <CaseStudies />
        <Kubernetes />
        <WasmCloudEcosystem />
        <GetStarted />
      </main>
    </Layout>
  );
}
export default ContactForm;
