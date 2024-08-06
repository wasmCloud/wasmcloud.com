import React from 'react';
import styles from './wasmcloud-ecosystem.module.css';
import { LogoScroller } from './logo-scroller';
import { SectionTag } from '@site/src/pages/_components/section-tag';
import { Section } from '@site/src/pages/_components/section';
import { SectionContent } from '@site/src/pages/_components/section-content';
import { SectionHeading } from '@site/src/pages/_components/section-heading';

type Props = {};

function WasmCloudEcosystem({}: Props) {
  return (
    <Section id="ecosystem" color="space-blue">
      <SectionContent align="center">
        <SectionTag>WasmCloud Ecosystem</SectionTag>
        <SectionHeading>Wasm-native works with cloud-native</SectionHeading>
        <p>wasmCloud works with the tools you know and love today.</p>
        <p>
          <a className="button" href="https://wasmcloud.com/docs/capabilities/" target="_blank">
            Capability Catalog
          </a>
        </p>
      </SectionContent>
      <SectionContent align="center" hasContainer={false}>
        <div className={styles.graphic}>
          <div className={styles.callout} data-before>
            <img src="/pages/home/wasmcloud-ecosystem/arrow-1.svg" alt="" />
            <span>works with this</span>
          </div>
          <LogoScroller />
          <div className={styles.callout} data-after>
            <img src="/pages/home/wasmcloud-ecosystem/arrow-2.svg" alt="" />
            <span>and this</span>
          </div>
        </div>
      </SectionContent>
    </Section>
  );
}

export { WasmCloudEcosystem };
