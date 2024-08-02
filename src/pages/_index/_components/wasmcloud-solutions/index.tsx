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
            <Placeholder size="50px" />
            <h4>Idle Infrastructure?</h4>
            <p>Does scalability planning & long cold starts leave you with 
              inefficient Infrastructure?
            </p>
          </GridItem>
          <GridItem>
            <Placeholder size="50px" />
            <h4>Maintaining Apps?</h4>
            <p>Are developers patching the same 
              vulnerabilities across 100's or 1,000's of apps?
            </p>
          </GridItem>
          <GridItem>
            <Placeholder size="50px" />
            <h4>Cross Clouds?</h4>
            <p>Do you need to run your apps close to your users? Multi-Region? On the Edge? On Prem? 
              Disconnected?</p>
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
