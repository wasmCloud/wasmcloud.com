import React, { ComponentProps, ReactPropTypes } from 'react';
import Link from '@docusaurus/Link';
import { Section } from '@site/src/pages/_components/section';
import { SectionContent } from '@site/src/pages/_components/section-content';
import { SectionHeading } from '@site/src/pages/_components/section-heading';
import { SectionTag } from '@site/src/pages/_components/section-tag';

type Props = Partial<typeof DEFAULT_CONTENT>;

const DEFAULT_CONTENT = {
  color: 'dark-gray' as const,
  id: 'kubernetes',
  tag: 'Kubernetes',
  heading: 'Extend Kubernetes with wasmCloud',
  intro: (
    <p>
      Run wasmCloud standalone or on Kubernetes. Leverage WebAssembly components to extend
      Kubernetes and distribute applications across clouds, regions, clusters, and edges.
    </p>
  ),
  link: {
    href: 'https://wasmcloud.com/docs/deployment/k8s/',
    text: 'Deploy the wasmCloud k8s Operator',
  },
  img: {
    src: '/pages/home/kubernetes/kubernetes.svg',
    alt: '',
  },
};

function Kubernetes({
  color = DEFAULT_CONTENT.color,
  id = DEFAULT_CONTENT.id,
  tag = DEFAULT_CONTENT.tag,
  heading = DEFAULT_CONTENT.heading,
  intro = DEFAULT_CONTENT.intro,
  link = DEFAULT_CONTENT.link,
  img = DEFAULT_CONTENT.img,
}: Props) {
  return (
    <Section color={color}>
      <SectionContent aside={<img src={img.src} alt={img.alt} />}>
        <SectionTag>{tag}</SectionTag>
        <SectionHeading>{heading}</SectionHeading>
        {typeof intro === 'string' ? <p>{intro}</p> : intro}
        {link && (
          <p>
            <Link href={link.href}>{link.text}</Link>
          </p>
        )}
      </SectionContent>
    </Section>
  );
}

export { Kubernetes };
