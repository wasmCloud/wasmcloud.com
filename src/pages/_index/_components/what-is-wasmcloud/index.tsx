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
import { Grid, GridItem } from '@site/src/pages/_components/grid';

type Props = {};

const INTRO_CONTENT: {
  tag: React.ReactNode;
  heading: React.ReactNode;
  description: React.ReactNode;
} = {
  tag: 'What is wasmCloud?',
  heading: 'Fast-track the development, deployment, and orchestration of WebAssembly components',
  description: (
    <p>
      wasmCloud is an open source project from the Cloud Native Computing Foundation (CNCF) that
      enables teams to build polyglot applications composed of reusable Wasm components and run
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
    image: '/pages/home/what-is-wasmcloud/build.svg',
    title: 'Build',
    features: [
      {
        title: 'Faster Development Cycles',
        description: (
          <>Leverage reusable, polyglot, Wasm components on a reliable, distributed platform.</>
        ),
      },
      {
        title: 'Centrally Maintainable Apps',
        description: (
          <>
            Reusable, version-controlled components empower platform teams to maintain thousands of
            diverse apps centrally.
          </>
        ),
      },
      {
        title: 'Integrate with Existing Stacks',
        description: (
          <>
            wasmCloud has first-tier support for Kubernetes, AWS, Azure, GCP, Jenkins, Github
            Actions, ArgoCD, Backstage, Chainguard, Databases, Messaging, and more.
          </>
        ),
      },
    ],
  },
  {
    id: 'compose',
    image: '/pages/home/what-is-wasmcloud/compose.svg',
    title: 'Compose',
    features: [
      {
        title: 'Development Without Lock-In',
        description: (
          <>
            Define application dependencies at runtime via contract driven interfaces leveraging
            different vendors across deployments, dev, QA, or prod.
          </>
        ),
      },
      {
        title: 'Truly Portable Apps',
        description: (
          <>
            Run the same Wasm application across operating systems and architectures&mdash;no new
            builds required. Linux, MacOS X, Windows, ARM, x86, and more.
          </>
        ),
      },
      {
        title: 'Custom Capabilities',
        description: (
          <>
            Easily extend the secure wasmCloud host at runtime to support custom dependencies,
            hardware, or business contracts.
          </>
        ),
      },
    ],
  },
  {
    id: 'run',
    image: '/pages/home/what-is-wasmcloud/run.svg',
    title: 'Run',
    features: [
      {
        title: 'Scale-to-Zero with Zero Cold Starts',
        description: (
          <>
            Sub-millisecond start times and vertical autoscaling means workloads scale to the
            demand.
          </>
        ),
      },
      {
        title: 'Reliable, Fault-Tolerant Apps',
        description: (
          <>
            Horizontal scaling with automated fail-over gives apps capability-level resiliency,
            reliability, and scalability.
          </>
        ),
      },
      {
        title: 'Deploy Across Clouds',
        description: (
          <>
            Close to your users, with local-first routing and at-most-once delivery, wasmCloud
            delivers cross-region, cross-cloud, and cross-edge capability-level resiliency to every
            deployment
          </>
        ),
      },
    ],
  },
];

function WhatIsWasmCloud({}: Props) {
  return (
    <Section color="dark-gray" id="what-is-wasmcloud">
      <div className="container">
        <SectionTag>{INTRO_CONTENT.tag}</SectionTag>
        <SectionHeading>{INTRO_CONTENT.heading}</SectionHeading>
        {INTRO_CONTENT.description}
      </div>

      <div className="container">
        <WhatIsWasmCloudSwitcher />
      </div>
    </Section>
  );
}

// Abstracted switcher component for reuse on introduction docs page
function WhatIsWasmCloudSwitcher({}: Props) {
  return (
    <Switcher defaultValue={SWITCHER_CONTENT[0].id}>
      <SwitcherList className={styles.list}>
        {SWITCHER_CONTENT.map((content, i) => (
          <SwitcherButton key={content.id} className={styles.button} value={content.id}>
            <img
              src={`/pages/home/icon/${content.id}.svg`}
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
          <Grid>
            <GridItem>
              {content.features.map((feature, i) => (
                <div className={styles.feature} key={i}>
                  <h5>{feature.title}</h5>
                  <p>{feature.description}</p>
                  {feature.link && <a href={feature.link}>{feature.linkText}</a>}
                </div>
              ))}
            </GridItem>
            <GridItem>
              <img src={content.image} alt="" />
            </GridItem>
          </Grid>
        </SwitcherContent>
      ))}
    </Switcher>
  );
}

export { WhatIsWasmCloud, WhatIsWasmCloudSwitcher };
