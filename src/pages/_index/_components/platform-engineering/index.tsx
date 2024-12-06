import { Section } from '@site/src/pages/_components/section';
import { SectionHeading } from '@site/src/pages/_components/section-heading';
import { SectionTag } from '@site/src/pages/_components/section-tag';
import React from 'react';
import styles from './use-cases.module.css';
import { SketchUnderline } from '@site/src/pages/_components/sketch-underline';
import { VideoButton } from '@site/src/pages/_components/video-button';
import { Grid, GridItem } from '@site/src/pages/_components/grid';

type Props = {};

type UseCasesContent = {
  name: string;
  url: string;
  content: React.ReactNode;
};

const SECTION_CONTENT: {
  id: string;
  tag: string;
  heading: React.ReactNode;
} = {
  id: 'platform-engineering',
  tag: 'wasmCloud as a Platform',
  heading: (
    <>
      The <SketchUnderline>Platform</SketchUnderline> for Platform-Engineering
    </>
  ),
};

const VIDEO_CONTENT: [UseCasesContent, UseCasesContent] = [
  {
    name: 'Platform Engineering with wasmCloud',
    url: 'https://www.youtube.com/watch?v=wRsBQkP2rPY&list=PL25tdRgIAXStcnLCeE_GUTjbTNxFaDnBJ&index=1',
    content: (
      <>
        <p>
          The CNCF wasmCloud playlist on YouTube includes the lastest sessions exploring organizations' platform engineering use-cases for wasmCloud.
        </p>
      </>
    ),
  },
  {
    name: 'Wasm across Any Cloud, K8s, or Edge',
    url: 'https://www.youtube.com/watch?v=B1Q_Xx5i6Ek',
    content: (
      <>
        <p>
          Colin Murphy from Adobe and Douglas Rodrigues from Akamai discuss how they use CNCF wasmCloud to run WebAssembly across
          cloud services, Kubernetes clusters, and edges.
        </p>
      </>
    ),
  },
];

function PlatformEngineering({}: Props) {
  return (
    <Section color="dark-gray" id={SECTION_CONTENT.id}>
      <div className="container">
        <SectionTag>{SECTION_CONTENT.tag}</SectionTag>
        <SectionHeading>{SECTION_CONTENT.heading}</SectionHeading>
        <Grid className={styles.content} alignLast>
          {VIDEO_CONTENT.map((video, i) => (
            <GridItem key={i} className={styles.item}>
              <h4>{video.name}</h4>
              {video.content}
              <VideoButton title={video.name} url={video.url} />
            </GridItem>
          ))}
        </Grid>
      </div>
    </Section>
  );
}

export { PlatformEngineering };
