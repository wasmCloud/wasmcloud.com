import React from 'react';
import { Section } from '@site/src/pages/_components/section';
import { SectionHeading } from '@site/src/pages/_components/section-heading';
import { SectionTag } from '@site/src/pages/_components/section-tag';
import styles from './why-use-wasmcloud.module.css';

type Props = {};

function WhyUseWasmCloud({}: Props) {
  return (
    <Section color="space-blue" id="why-use-wasmcloud">
      <div className="container">
        <div className={styles.content}>
          <SectionTag>Why use wasmCloud?</SectionTag>
          <SectionHeading>
            Productivity. Maintainability. Portability. Reusability. Availability. Security.
          </SectionHeading>
          <p>
            WebAssembly components are a finer-grained abstraction for application
            composition and a Wasm-specific orchestrator maximizes their full potential.
          </p>
        </div>
        <div className={styles.image}>
          <img src="/img/pages/home/why-use-wasmcloud/wasm-everywhere.svg" alt="" />
        </div>
      </div>
    </Section>
  );
}

export { WhyUseWasmCloud };
