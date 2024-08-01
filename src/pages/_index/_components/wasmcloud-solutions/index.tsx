import React from 'react';
import { Section, SectionColor } from '@site/src/pages/_components/section';
import { SectionHeading } from '@site/src/pages/_components/section-heading';
import { SectionTag } from '@site/src/pages/_components/section-tag';
import styles from './styles.module.css';
import { SectionLayout } from '@site/src/pages/_components/section-layout';
import { Grid, GridItem } from '@site/src/pages/_components/grid';
import { SectionContent } from '@site/src/pages/_components/section-content';

type Props = {
  color?: SectionColor;
};

function WasmCloudSolutions({ color = 'light-gray' }: Props) {
  return (
    <Section color={color} id="wasmcloud-solutions">
      <SectionContent align="center">
        <SectionTag>Why use wasmCloud?</SectionTag>
        <SectionHeading>Are you a team struggling with...</SectionHeading>
      </SectionContent>
      <SectionContent>
        <Grid className={styles.content} center>
          <GridItem>
            <Placeholder size="200px" />
            <h4>Costly Clouds?</h4>
            <p>Idle infrastructure, wasted overhead</p>
          </GridItem>
          <GridItem>
            <Placeholder size="200px" />
            <h4>Maintaining Apps?</h4>
            <p>Constantly patching the same vulnerabilities across 100's of apps.</p>
          </GridItem>
          <GridItem>
            <Placeholder size="200px" />
            <h4>Distributed Apps?</h4>
            <p>Need to run your app close to your users? On Prem? Disconnected?</p>
          </GridItem>
        </Grid>
      </SectionContent>
    </Section>
  );
}

function Placeholder({ size }: { size: string }) {
  return (
    <div
      style={{
        height: size,
        width: size,
        opacity: 0.2,
        backgroundColor: 'var(--section-color-foreground)',
      }}
    />
  );
}

export { WasmCloudSolutions };
