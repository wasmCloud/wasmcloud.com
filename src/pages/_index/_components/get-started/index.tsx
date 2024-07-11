import React from 'react';
import { Section } from '@site/src/pages/_components/section';
import { SectionHeading } from '@site/src/pages/_components/section-heading';
import { SectionTag } from '@site/src/pages/_components/section-tag';
import styles from './get-started.module.css';
import SvgSparkles from './img/sparkles.svg';
import SvgUnderline from './img/underline.svg';

type Props = {};

function GetStarted({}: Props) {
  return (
    <Section color="yellow">
      <div className="container">
        <SectionTag>Get started</SectionTag>
        <SectionHeading className={styles.heading}>
          Your{' '}
          <span>
            Universal
            <SvgUnderline className={styles.underline} />
          </span>{' '}
          Golden Path starts{' '}
          <span>
            here
            <SvgSparkles className={styles.sparkles} />
          </span>
        </SectionHeading>
        <div className={styles.grid}>
          <div className={styles.gridItem}>
            <img src="/img/pages/home/icon/build.svg" alt="" />
            <h5>Download the wasmCloud CLI</h5>
            <p>Get all the dev tooling you need by installing the wasmCloud "wash" CLI</p>
            <a href="/docs/installation" className="button">
              Download wash
            </a>
          </div>
          <div className={styles.gridItem}>
            <img src="/img/pages/home/icon/compose.svg" alt="" />
            <h5>Build your first component</h5>
            <p>Start building with interfaces using one of our examples</p>
            <a
              href="https://github.com/wasmCloud/wasmCloud/tree/main/examples"
              className="button"
              target="_blank"
              rel="noreferrer"
            >
              See Examples
            </a>
          </div>
          <div className={styles.gridItem}>
            <img src="/img/pages/home/icon/run.svg" alt="" />
            <h5>Deploy on wasmCloud</h5>
            <p>Deploy your application with the wasmCloud orchestrator</p>
            <a href="/docs/ecosystem/wadm/" className="button">
              Read Documentation
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}

export { GetStarted };
