import React from 'react';
import Link from '@docusaurus/Link';
import { Section } from '@site/src/pages/_components/section';
import { SectionContent } from '@site/src/pages/_components/section-content';
import { SectionHeading } from '@site/src/pages/_components/section-heading';
import styles from './cncf.module.css';

type Props = {};

function Cncf({}: Props) {
  return (
    <Section id="cncf" color="space-blue">
      <SectionContent align="center" hasContainer={true} className={styles.cncf}>
        <SectionHeading>
          <p>
            wasmCloud is a <Link href="https://www.cncf.io/">Cloud Native Computing Foundation</Link> Incubating project
          </p>
        </SectionHeading>
        <img src="/pages/home/cncf/cncf-white.svg" alt="Cloud Native Computing Foundation" />
      </SectionContent>
    </Section>
  );
}

export { Cncf };
