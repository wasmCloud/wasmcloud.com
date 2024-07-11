import { Section } from '@site/src/pages/_components/section';
import { SectionHeading } from '@site/src/pages/_components/section-heading';
import { SectionTag } from '@site/src/pages/_components/section-tag';
import React from 'react';
import styles from './case-studies.module.css';

type Props = {};

function CaseStudies({}: Props) {
  return (
    <Section color="light-gray" id="case-studies">
      <div className="container">
        <SectionTag>Case Studies</SectionTag>
        <SectionHeading>Solving real problems for your business</SectionHeading>
        <div className={styles.studies}>
          <div className={styles.study}>
            <h4>
              <img src="/img/pages/home/case-study-machine-metrics.svg" alt="Machine Metrics" />
            </h4>
            <p>
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Deleniti distinctio itaque
              omnis, cum delectus molestias corrupti? Maiores, voluptatum!
            </p>
            <p>
              Error quaerat quidem accusantium tenetur soluta in non ex, minus et ipsa quod earum
              consectetur provident, iusto cunatus id? Modi, quo.
            </p>
            <p>
              <a href="#" aria-description="View Machine Metrics Case Study">
                View Case Study
              </a>
            </p>
          </div>
          <div className={styles.study}>
            <h4>
              <img src="/img/pages/home/case-study-adobe.svg" alt="Adobe" />
            </h4>
            <p>
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Deleniti distinctio itaque
              omnis, cum delectus molestias ipsa dolorem
            </p>
            <p>Error quaerat quidem accusantium tenetur solu, quo.</p>
            <p>
              <a href="#" aria-description="View Adobe Case Study">
                View Case Study
              </a>
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

export { CaseStudies };
