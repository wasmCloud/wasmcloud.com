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
            Productivity. Portability. Reusability. Connectivity. Resiliency.
          </SectionHeading>
          <p>
            WebAssembly components are a fundamentally finer-grained abstraction for application
            composition and need a Wasm-specific orchestrator to take best advantage of them.
          </p>
        </div>
        <div className={styles.image}>
          <img src="/img/pages/diagrams/why-use-wasmcloud.svg" alt="Why use wasmCloud?" />
        </div>
      </div>
    </Section>
  );
}

export { WhyUseWasmCloud };
