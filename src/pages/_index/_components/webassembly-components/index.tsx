import { Section } from '@site/src/pages/_components/section';
import { SectionHeading } from '@site/src/pages/_components/section-heading';
import { SectionTag } from '@site/src/pages/_components/section-tag';
import React from 'react';
import styles from './webassembly-components.module.css';

type Props = {};

function WebAssemblyComponents({}: Props) {
  return (
    <Section color="light-gray" id="webassembly-components">
      <div className="container">
        <div className={styles.content}>
          <div>
            <SectionTag>WebAssembly Components</SectionTag>
            <SectionHeading>New to Components?</SectionHeading>
            <p>
            Leverage WebAssembly components' polyglot programming, 
            security features, and modularity to build secure, maintainable applications.
            </p>
            <p>
              <a href="https://wasmcloud.com/docs/concepts/components" target="_blank">
                Read our components starter guide
              </a>
            </p>
          </div>
          <div>
            <img
              className={styles.image}
              src="/img/pages/home/webassembly-components/components.svg"
              alt=""
            />
          </div>
        </div>
      </div>
    </Section>
  );
}

export { WebAssemblyComponents };
