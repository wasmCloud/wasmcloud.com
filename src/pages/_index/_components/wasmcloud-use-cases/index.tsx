import { Section } from '@site/src/pages/_components/section';
import { SectionHeading } from '@site/src/pages/_components/section-heading';
import { SectionTag } from '@site/src/pages/_components/section-tag';
import React from 'react';
import styles from './use-cases.module.css';
import { SketchUnderline } from '@site/src/pages/_components/sketch-underline';
import { VideoButton } from '@site/src/pages/_components/video-button';

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
  id: 'use-cases',
  tag: 'wasmCloud Use Cases',
  heading: (
    <>
      The <SketchUnderline>Platform</SketchUnderline> for Platform-Engineering
    </>
  ),
};

const VIDEO_CONTENT: [UseCasesContent, UseCasesContent] = [
  {
    name: 'Distributed Capabilities',
    url: 'https://www.youtube.com/watch?v=fQdkNGZqYZA',
    content: (
      <>
        <p>
          Jochen Rau and Tyler Schoppe demonstrate how Machine Metrics is utilizing Wasm Components to move
          platform capabilities across edges & clouds with redundancy and dynamic fault tolerance using
          CNCF wasmCloud.
        </p>
      </>
    ),
  },
  {
    name: 'Moving Beyond Containers',
    url: 'https://www.youtube.com/watch?v=1_iCimJrLzM',
    content: (
      <>
        <p>
          Sean Isom and Colin Murphy explain how Adobe is using CNCF wasmCloud to run WebAssembly in
          locations that containers can't go while maintaining connectivity with existing cloud
          services and kubernetes clusters.
        </p>
      </>
    ),
  },
];

function WasmCloudUseCases({}: Props) {
  return (
    <Section color="dark-gray" id={SECTION_CONTENT.id}>
      <div className="container">
        <SectionTag>{SECTION_CONTENT.tag}</SectionTag>
        <SectionHeading>{SECTION_CONTENT.heading}</SectionHeading>
        <div className={styles.content}>
          {VIDEO_CONTENT.map((video, i) => (
            <div className={styles.item} key={i}>
              <h4>{video.name}</h4>
              {video.content}
              <VideoButton title={video.name} url={video.url} />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

export { WasmCloudUseCases };
