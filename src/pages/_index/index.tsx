import React from 'react';
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

function ContactForm() {
  return (
    <Layout
      title={`wasmCloud - A CNCF Project`}
      description="Build secure, cloud-native platforms and applications with WebAssembly"
      wrapperClassName="navbar-glass"
    >
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
