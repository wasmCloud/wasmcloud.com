import { Section } from '@site/src/pages/_components/section';
import { SectionHeading } from '@site/src/pages/_components/section-heading';
import { SectionTag } from '@site/src/pages/_components/section-tag';
import React from 'react';
import styles from './case-studies.module.css';

type Props = {};

type CaseStudyContent = {
  name: string;
  logo: string;
  link: string;
  content: React.ReactNode;
};

const CONTENT: [CaseStudyContent, CaseStudyContent] = [
  {
    name: 'Machine Metrics',
    logo: '/img/pages/home/machine-metrics.svg',
    link: '#',
    content: (
      <>
        <p>
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Deleniti distinctio itaque
          omnis, cum delectus molestias corrupti? Maiores, voluptatum!
        </p>
        <p>
          Error quaerat quidem accusantium tenetur soluta in non ex, minus et ipsa quod earum
          consectetur provident, iusto cunatus id? Modi, quo.
        </p>
      </>
    ),
  },
  {
    name: 'TM Forum',
    logo: '/img/pages/home/tm-forum.svg',
    link: '#',
    content: (
      <>
        <p>
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Deleniti distinctio itaque
          omnis, cum delectus molestias ipsa dolorem
        </p>
        <p>Consecuit quaerat quidem accusantium tenetur solu, quo.</p>
      </>
    ),
  },
];

function CaseStudies({}: Props) {
  return (
    <Section color="light-gray" id="case-studies">
      <div className="container">
        <SectionTag>Case Studies</SectionTag>
        <SectionHeading>Solving real problems for your business</SectionHeading>
        <div className={styles.studies}>
          {CONTENT.map((study, i) => (
            <div className={styles.study} key={i}>
              <h4>
                <img src={study.logo} alt={study.name} />
              </h4>
              {study.content}
              <p>
                <a href={study.link} aria-description={`View ${study.name} Case Study`}>
                  View Case Study
                </a>
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

export { CaseStudies };
