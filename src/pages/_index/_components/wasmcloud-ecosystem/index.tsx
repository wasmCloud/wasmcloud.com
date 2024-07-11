import { Section } from '@site/src/pages/_components/section';
import { SectionHeading } from '@site/src/pages/_components/section-heading';
import { SectionTag } from '@site/src/pages/_components/section-tag';
import React from 'react';
import styles from './wasmcloud-ecosystem.module.css';
import { LogoScroller } from './logo-scroller';

type Props = {};

function WasmCloudEcosystem({}: Props) {
  return (
    <Section color="space-blue" id="ecosystem">
      <div className={`container ${styles.content}`}>
        <SectionTag>wasmCloud Ecosystem</SectionTag>
        <SectionHeading>Wasm-native works with cloud-native</SectionHeading>
        <p>wasmCloud works with the tools you know and love today.</p>
      </div>
      <div className={styles.graphic}>
        <div className={styles.callout} data-before>
          <img src="/img/pages/home/wasmcloud-ecosystem/arrow-1.svg" alt="" />
          <span>works with this</span>
        </div>
        <LogoScroller />
        <div className={styles.callout} data-after>
          <img src="/img/pages/home/wasmcloud-ecosystem/arrow-2.svg" alt="" />
          <span>and this</span>
        </div>
      </div>
    </Section>
  );
}

export { WasmCloudEcosystem };
