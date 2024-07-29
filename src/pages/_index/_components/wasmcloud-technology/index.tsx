import React from 'react';
import { Section } from '@site/src/pages/_components/section';
import { SectionHeading } from '@site/src/pages/_components/section-heading';
import { SectionTag } from '@site/src/pages/_components/section-tag';
import styles from './wasmcloud-technology.module.css';
import ImgQuestionMarks from './images/question-marks.svg';
import ImgArrow from './images/arrow.svg';

type Props = {};

function WasmCloudTechnology({}: Props) {
  return (
    <Section color="space-blue" id="technology">
      <div className="container">
        <div className={styles.content}>
          <SectionTag>wasmCloud Technology</SectionTag>
          <SectionHeading>How does it work?</SectionHeading>
          <div className={styles.video}>
            <ImgQuestionMarks className={styles.questionMarks} />
            <ImgArrow className={styles.arrow} />
            <span className={styles.callout}>
              what's under
              <br />
              the hood?
            </span>
          </div>
        </div>
      </div>
    </Section>
  );
}

export { WasmCloudTechnology };
