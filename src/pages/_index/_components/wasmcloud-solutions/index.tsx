import React from 'react';
import { Section, SectionColor } from '@site/src/pages/_components/section';
import { SectionHeading } from '@site/src/pages/_components/section-heading';
import { SectionTag } from '@site/src/pages/_components/section-tag';
import styles from './styles.module.css';
import { Grid, GridItem } from '@site/src/pages/_components/grid';
import { SectionContent } from '@site/src/pages/_components/section-content';
import SvgCost from '@site/static/pages/home/icon/cost.svg';
import SvgUpdates from '@site/static/pages/home/icon/updates.svg';
import SvgDistributed from '@site/static/pages/home/icon/distributed.svg';

type Props = {
  color?: SectionColor;
};

function WasmCloudSolutions({ color = 'light-gray' }: Props) {
  return (
    <Section color={color} id="wasmcloud-solutions">
      <SectionContent align="center">
        <SectionTag>wasmCloud Solutions</SectionTag>
        <SectionHeading>Are you a team struggling with...</SectionHeading>
      </SectionContent>
      <SectionContent>
        <Grid className={styles.content} center>
          <GridItem>
            <SvgCost style={{ color: 'var(--section-color-highlight)' }} />
            <h4>Idle Infrastructure?</h4>
            <p>
              Does scalability preparedness, unpredictable workloads and long cold starts leave you
              with inefficient infrastructure and ever-growing cloud costs?
            </p>
          </GridItem>
          <GridItem>
            <SvgUpdates style={{ color: 'var(--section-color-highlight)' }} />
            <h4>Maintaining Apps?</h4>
            <p>
              Are developers patching the same vulnerabilities and managing updates and dependencies
              across 100's or 1,000's of apps? Do you have apps that fall behind your golden
              template?
            </p>
          </GridItem>
          <GridItem>
            <SvgDistributed style={{ color: 'var(--section-color-highlight)' }} />
            <h4>Distributed Deployments?</h4>
            <p>
              Do you need to run your apps across cloud vendors? Close to your users? Multi-Region?
              On the Edge? On Prem? Disrupted, disconnected, intermittent or limited connectivity?
            </p>
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
