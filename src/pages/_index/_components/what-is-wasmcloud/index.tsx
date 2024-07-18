import React from 'react';
import { Section } from '@site/src/pages/_components/section';
import { SectionTag } from '@site/src/pages/_components/section-tag';
import { SectionHeading } from '@site/src/pages/_components/section-heading';
import {
  Switcher,
  SwitcherButton,
  SwitcherContent,
  SwitcherList,
} from '../what-is-wasmcloud/switcher';
import { SectionSubheading } from '@site/src/pages/_components/section-subheading';
import styles from './what-is-wasmcloud.module.css';

type Props = {};

function WhatIsWasmCloud({}: Props) {
  return (
    <Section color="light-gray" id="what-is-wasmcloud">
      <div className="container">
        <SectionTag>What is wasmCloud?</SectionTag>
        <SectionHeading>
          Fast-track the development, deployment, and management of distributed applications
        </SectionHeading>
        <p>
          wasmCloud is an open source project from the Cloud Native Computing Foundation (CNCF) that
          enables teams to build polyglot applications composed of reusable code and run
          them—resiliently and efficiently—across any Kubernetes cluster, cloud, datacenter, or
          edge.
        </p>
      </div>

      <div className="container">
        <Switcher defaultValue="build">
          <SwitcherList className={styles.list}>
            <SwitcherButton className={styles.button} value="build">
              <img
                alt=""
                src="/img/pages/home/icon/build.svg"
                className={`${styles.icon} ${styles.iconBuild}`}
              />
              Build
            </SwitcherButton>
            <SwitcherButton className={styles.button} value="compose">
              <img
                alt=""
                src="/img/pages/home/icon/compose.svg"
                className={`${styles.icon} ${styles.iconCompose}`}
              />
              Compose
            </SwitcherButton>
            <SwitcherButton className={styles.button} value="run">
              <img
                alt=""
                src="/img/pages/home/icon/run.svg"
                className={`${styles.icon} ${styles.iconRun}`}
              />
              Run
            </SwitcherButton>
          </SwitcherList>
          <SwitcherContent value="build" className={styles.content}>
            <div className={styles.contentCopy}>
              <SectionSubheading>Build</SectionSubheading>
              <div className={styles.feature}>
                <h5>Bring-your-own language(s) for polyglot apps</h5>
                <p>
                  Build and run applications from components written in C, C#, C++, Rust, Python,
                  Go, C#, TypeScript and more.
                </p>
                <a href="/docs/category/developer-guide">Developer Guide</a>
              </div>
              <div className={styles.feature}>
                <h5>Integrate with your existing ecosystem</h5>
                <p>
                  wasmCloud has first-tier support for Kubernetes, VS Code, ArgoCD, Backstage,
                  Chainguard, and more.
                </p>
                <a href="/docs/concepts/capabilities/">Capabilities Guide</a>
              </div>
              <div className={styles.feature}>
                <h5>Zero Trust security by default</h5>
                <p>
                  Our security audited platform builds on the sandboxed security model of Wasm and
                  runs standalone or in distroless containers.
                </p>
                <a href="/docs/hosts/security">Security Guide</a>
              </div>
            </div>
            <div className={styles.contentImage}>
              <img src="/img/pages/home/what-is-wasmcloud/build.svg" alt="" />
            </div>
          </SwitcherContent>
          <SwitcherContent value="compose" className={styles.content}>
            <div className={styles.contentCopy}>
              <SectionSubheading>Compose</SectionSubheading>
              <div className={styles.feature}>
                <h5>Combine components into applications</h5>
                <p>
                  Create applications by connecting WebAssembly components, first-party platform
                  capabilities, or your own extensions.
                </p>
                <a href="/docs/ecosystem/wadm/">Applications Guide</a>
              </div>
              <div className={styles.feature}>
                <h5>Elastically extensible</h5>
                <p>
                  Easily extend the wasmCloud platform at runtime with secure, plugin-based custom
                  capabilities—including your own custom interfaces.
                </p>
                <a href="/docs/concepts/providers">Component Provider Guide</a>
              </div>
              <div className={styles.feature}>
                <h5>Portable and pluggable</h5>
                <p>
                  Universal interface abstractions built on WebAssembly Interface Types (WIT)
                  maximize application portability across dev, QA, test, and prod.
                </p>
                <a href="/docs/concepts/linking-components/">Component Linking Guide</a>
              </div>
            </div>
            <div className={styles.contentImage}>
              <img src="/img/pages/home/what-is-wasmcloud/compose.svg" alt="" />
            </div>
          </SwitcherContent>
          <SwitcherContent value="run" className={styles.content}>
            <div className={styles.contentCopy}>
              <SectionSubheading>Run</SectionSubheading>
              <div className={styles.feature}>
                <h5>Seamless orchestration</h5>
                <p>
                  wasmCloud enables distributed applications to seamlessly operate across any cloud,
                  Kubernetes cluster, datacenter, or edge.
                </p>
              </div>
              <div className={styles.feature}>
                <h5>Automatically elastic, reliably resilient</h5>
                <p>
                  wasmCloud automatically scales your components vertically to meet real-time
                  demand; scaling horizontally is easy with our flexible, flat compute mesh.
                </p>
              </div>
              <div className={styles.feature}>
                <h5>Location Agnostic</h5>
                <p>
                  With local-first routing and at-least-once delivery, wasmCloud delivers
                  cross-region, capability-level resiliency to every deployment
                </p>
              </div>
            </div>
            <div className={styles.contentImage}>
              <img src="/img/pages/home/what-is-wasmcloud/run.svg" alt="" />
            </div>
          </SwitcherContent>
        </Switcher>
      </div>
    </Section>
  );
}

export { WhatIsWasmCloud };
