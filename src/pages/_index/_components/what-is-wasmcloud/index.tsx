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
        title: 'Applications Faster',
        description: (
          <>
            Leveraging reusable, polyglot, Wasm components on a reliable, distributed platform.
          </>
        ),
      },
      {
        title: 'Centrally Maintainable Apps',
        description: (
          <>
            Reusable, version-controlled, components empower platform teams to maintain 1,000's of diverse apps centrally.
          </>
        ),
      },
      {
        title: 'With Existing Platforms & Stack',
        description: (
          <>
            Common integrations make wasmCloud ecosystem compatible with today's platforms - Argo, Jenkins, Actions, 
            Chainguard, Backstage, K8s...
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
        title: 'With Out Lock In',
        description: (
          <>
            Define application dependencies at runtime via contract driven interfaces leveraging different
             vendors across deployments, dev, QA, or prod.
          </>
        ),
      },
      {
        title: 'Portable Apps',
        description: (
          <>
            That easily run across Linux, MacOSX, Windows, ARM, x86, and more.
          </>
        ),
      },
      {
        title: 'Custom Capabilites',
        description: (
          <>
            Easily extend the secure wasmCloud host at runtime to support custom dependencies, hardware, or business contracts. 
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
        title: 'Scale to Zero with Zero Cold Starts',
        description: (
          <>
            Sub-millisecond start times and vertical autoscaling means workloads scale to the demand. 
          </>
        ),
      },
      {
        title: 'Reliable, fault tolerant apps',
        description: (
          <>
            Horizontal scaling with automated fail-over gives apps capability level resiliency, reliability, and scalability. 
          </>
        ),
      },
      {
        title: 'Across Clouds',
        description: (
          <>
            Close to your users, with local-first routing and at-least-once delivery, wasmCloud delivers cross-region, cross-cloud, 
            and cross-edge capability-level resiliency to every deployment
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
