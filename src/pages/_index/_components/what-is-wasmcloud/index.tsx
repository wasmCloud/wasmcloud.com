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

const INTRO_CONTENT: {
  tag: React.ReactNode;
  heading: React.ReactNode;
  description: React.ReactNode;
} = {
  tag: 'What is wasmCloud?',
  heading: 'Fast-track the development, deployment, and management of distributed applications',
  description: (
    <p>
      wasmCloud is an open source project from the Cloud Native Computing Foundation (CNCF) that
      enables teams to build polyglot applications composed of reusable code and run
      them—resiliently and efficiently—across any cloud, Kubernetes, datacenter, or edge.
    </p>
  ),
};

const SWITCHER_CONTENT: Array<{
  id: string;
  title: React.ReactNode;
  image: string;
  features: Array<{
    title: React.ReactNode;
    description: React.ReactNode;
    link?: string;
    linkText?: React.ReactNode;
  }>;
}> = [
  {
    id: 'build',
    image: '/img/pages/home/what-is-wasmcloud/build.svg',
    title: 'Build',
    features: [
      {
        title: 'Build with Reusable Wasm Components',
        description: (
          <>
            Stop copying boilerplate from app to app - wasmCloud provides the most common app
            building blocks or add your own. Leveraging reusable components means that platform
            teams can mantain 1,000's of apps centrally.
          </>
        ),
      },
      {
        title: 'Integrate with your existing ecosystem',
        description: (
          <>
            wasmCloud has first-tier support for Kubernetes, AWS, Azure, GCP, Jenkins, Github
            Actions, VS Code, ArgoCD, Backstage, Chainguard, KeyValue, Databases, Messaging, and
            more.
          </>
        ),
      },
      {
        title: 'Bring-your-own language(s) for polyglot apps',
        description: (
          <>
            Build and run applications from components written in C, C#, C++, Rust, Python, Go,
            JavaScript, TypeScript and more.
          </>
        ),
      },
    ],
  },
  {
    id: 'compose',
    image: '/img/pages/home/what-is-wasmcloud/compose.svg',
    title: 'Compose',
    features: [
      {
        title: 'Combine components into applications',
        description: (
          <>
            Create applications by connecting WebAssembly components, first-party platform
            capabilities, or your own extensions.
          </>
        ),
      },
      {
        title: 'Endlessly extensible',
        description: (
          <>
            Easily extend the wasmCloud platform at runtime with secure, plugin-based custom
            capabilities—including your own custom interfaces.
          </>
        ),
      },
      {
        title: 'Portable and pluggable',
        description: (
          <>
            Universal interface abstractions built on WebAssembly Interface Types (WIT) maximize
            application portability across dev, QA, test, and different production deployment
            environments. Migrate your app without rewriting code.
          </>
        ),
      },
    ],
  },
  {
    id: 'run',
    image: '/img/pages/home/what-is-wasmcloud/run.svg',
    title: 'Run',
    features: [
      {
        title: 'Zero Cold Starts, Scale to Zero',
        description: (
          <>
            Lightning fast cold starts means that all workloads are run at the right scale at the
            right time.
          </>
        ),
      },
      {
        title: 'Horizontal & Vertical Autoscaling',
        description: (
          <>
            Veritical auto-scalers automatically meet real-time demand then scale to zero; scaling
            horizontally is easy with our flexible, flat compute mesh.
          </>
        ),
      },
      {
        title: 'Seamless, Location Agnostic Orchestration, ',
        description: (
          <>
            With local-first routing and at-most-once delivery, wasmCloud delivers cross-region,
            cross-cloud, and cross-edge capability-level resiliency to every deployment
          </>
        ),
      },
    ],
  },
];

function WhatIsWasmCloud({}: Props) {
  return (
    <Section color="light-gray" id="what-is-wasmcloud">
      <div className="container">
        <SectionTag>{INTRO_CONTENT.tag}</SectionTag>
        <SectionHeading>{INTRO_CONTENT.heading}</SectionHeading>
        {INTRO_CONTENT.description}
      </div>

      <div className="container">
        <Switcher defaultValue={SWITCHER_CONTENT[0].id}>
          <SwitcherList className={styles.list}>
            {SWITCHER_CONTENT.map((content, i) => (
              <SwitcherButton key={content.id} className={styles.button} value={content.id}>
                <img
                  src={`/img/pages/home/icon/${content.id}.svg`}
                  className={`${styles.icon} ${styles[content.id]}`}
                  alt=""
                />
                {content.title}
              </SwitcherButton>
            ))}
          </SwitcherList>

          {SWITCHER_CONTENT.map((content, i) => (
            <SwitcherContent key={content.id} value={content.id} className={styles.content}>
              <SectionSubheading className={styles.heading}>{content.title}</SectionSubheading>
              <div className={styles.contentCopy}>
                {content.features.map((feature, i) => (
                  <div className={styles.feature} key={i}>
                    <h5>{feature.title}</h5>
                    <p>{feature.description}</p>
                    {feature.link && <a href={feature.link}>{feature.linkText}</a>}
                  </div>
                ))}
              </div>
              <div className={styles.contentImage}>
                <img src={content.image} alt="" />
              </div>
            </SwitcherContent>
          ))}
        </Switcher>
      </div>
    </Section>
  );
}

export { WhatIsWasmCloud };
