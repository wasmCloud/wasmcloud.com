import { Section, SectionColor } from '@site/src/pages/_components/section';
import { SectionHeading } from '@site/src/pages/_components/section-heading';
import { SectionTag } from '@site/src/pages/_components/section-tag';
import React from 'react';
import styles from './case-studies.module.css';
import { SectionContent } from '@site/src/pages/_components/section-content';
import { Grid, GridItem } from '@site/src/pages/_components/grid';

type Props = {
  color?: SectionColor;
  tag?: React.ReactNode;
  heading?: React.ReactNode;
  content?: typeof CONTENT;
};

type CaseStudyContent = {
  name: string;
  logo: string;
  link: string;
  content: React.ReactNode;
};

const CONTENT: [CaseStudyContent, CaseStudyContent] = [
  {
    name: 'Machine Metrics',
    logo: '/pages/home/machine-metrics.svg',
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
    logo: '/pages/home/tm-forum.svg',
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

const HEADING = 'Solving real problems for your business';
const TAG = 'Case Studies';

function CaseStudies({
  color = 'light-gray',
  tag = TAG,
  heading = HEADING,
  content = CONTENT,
}: Props) {
  return (
    <Section color={color} id="case-studies">
      <SectionContent>
        <SectionTag>{tag}</SectionTag>
        <SectionHeading>{heading}</SectionHeading>
      </SectionContent>
      <SectionContent>
        <Grid>
          {content.map((study, i) => (
            <GridItem className={styles.study} key={i}>
              <h4>
                <img src={study.logo} alt={study.name} />
              </h4>
              {study.content}
              <p>
                <a href={study.link} aria-description={`View ${study.name} Case Study`}>
                  View Case Study
                </a>
              </p>
            </GridItem>
          ))}
        </Grid>
      </SectionContent>
    </Section>
  );
}

export { CaseStudies };
