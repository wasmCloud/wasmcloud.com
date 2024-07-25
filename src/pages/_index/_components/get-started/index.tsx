import React from 'react';
import { Section } from '@site/src/pages/_components/section';
import { SectionHeading } from '@site/src/pages/_components/section-heading';
import { SectionTag } from '@site/src/pages/_components/section-tag';
import styles from './get-started.module.css';
import SvgSparkles from './img/sparkles.svg';
import { SketchUnderline } from '@site/src/pages/_components/sketch-underline';

type Props = {};

function GetStarted({}: Props) {
  return (
    <Section color="yellow">
      <div className="container">
        <SectionTag>Get started</SectionTag>
        <SectionHeading className={styles.heading}>
          Your <SketchUnderline>Universal</SketchUnderline> Golden Path starts{' '}
          <span>
            here
            <SvgSparkles className={styles.sparkles} />
          </span>
        </SectionHeading>
        <div className={styles.grid}>
          <div className={styles.gridItem}>
            <img src="/img/pages/home/icon/build.svg" alt="" />
            <h4>Download the wasmCloud CLI</h4>
            <p>Get all the dev tooling you need by installing the wasmCloud "wash" CLI</p>
            <a href="/docs/installation" className="button">
              Download wash
            </a>
          </div>
          <div className={styles.gridItem}>
            <img src="/img/pages/home/icon/compose.svg" alt="" />
            <h4>Build your first component</h4>
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
            <h4>Deploy on wasmCloud</h4>
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
