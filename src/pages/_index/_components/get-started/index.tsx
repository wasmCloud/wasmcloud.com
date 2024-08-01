import React from 'react';
import { Section, SectionColor } from '@site/src/pages/_components/section';
import { SectionHeading } from '@site/src/pages/_components/section-heading';
import { SectionTag } from '@site/src/pages/_components/section-tag';
import styles from './get-started.module.css';
import { Grid, GridItem } from '@site/src/pages/_components/grid';
import { SectionContent } from '@site/src/pages/_components/section-content';

type Props = {
  color?: SectionColor;
  tag?: React.ReactNode;
  /** markdown-ish: _x_ for underline *x* for sparkles */
  heading?: string;
};

function GetStarted({
  color = 'yellow',
  tag = 'Get Started',
  heading = 'Your _Universal_ Golden Path starts *here*',
}: Props) {
  return (
    <Section color={color}>
      <SectionContent>
        <SectionTag>{tag}</SectionTag>
        <SectionHeading className={styles.heading}>{heading}</SectionHeading>
      </SectionContent>
      <SectionContent>
        <Grid className={styles.content} alignLast>
          <GridItem>
            <img src="/img/pages/home/icon/build.svg" alt="" />
            <h4>Download the wasmCloud CLI</h4>
            <p>Get all the dev tooling you need by installing the wasmCloud "wash" CLI</p>
            <a href="/docs/installation" target="_blank" className="button">
              Download wash
            </a>
          </GridItem>
          <GridItem>
            <img src="/img/pages/home/icon/compose.svg" alt="" />
            <h4>Build your first component</h4>
            <p>Start building with standard interfaces using one of our examples</p>
            <a
              href="https://github.com/wasmCloud/wasmCloud/tree/main/examples"
              className="button"
              target="_blank"
              rel="noreferrer"
            >
              See Examples
            </a>
          </GridItem>
          <GridItem>
            <img src="/img/pages/home/icon/run.svg" alt="" />
            <h4>Deploy on wasmCloud</h4>
            <p>Deploy your application with the wasmCloud orchestrator</p>
            <a href="/docs/ecosystem/wadm/" className="button">
              Read Documentation
            </a>
          </GridItem>
        </Grid>
      </SectionContent>
    </Section>
  );
}

export { GetStarted };
