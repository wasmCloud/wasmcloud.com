import Link from '@docusaurus/Link';
import { Section } from '@site/src/pages/_components/section';
import { SectionContent } from '@site/src/pages/_components/section-content';
import { SectionHeading } from '@site/src/pages/_components/section-heading';
import { SectionTag } from '@site/src/pages/_components/section-tag';
import React, { ComponentProps } from 'react';

type Props = Partial<ComponentProps<typeof Section> & typeof DEFAULT_CONTENT>;

const DEFAULT_CONTENT = {
  color: 'light-gray' as const,
  id: 'webassembly-components',
  tag: 'WebAssembly Components',
  heading: 'New to Components?',
  intro: (
    <p>
      Leverage WebAssembly components' polyglot programming, security features, and modularity to
      build secure, maintainable applications.
    </p>
  ),
  link: {
    href: 'https://wasmcloud.com/docs/concepts/components',
    text: 'Read our components starter guide',
  },
  img: {
    src: '/pages/home/webassembly-components/components.svg',
    alt: '',
  },
};

function WebAssemblyComponents({
  color = DEFAULT_CONTENT.color,
  id = DEFAULT_CONTENT.id,
  tag = DEFAULT_CONTENT.tag,
  heading = DEFAULT_CONTENT.heading,
  intro = DEFAULT_CONTENT.intro,
  link = DEFAULT_CONTENT.link,
  img = DEFAULT_CONTENT.img,
}: Props) {
  return (
    <Section id={id} color={color}>
      <SectionContent aside={<img src={img.src} alt={img.alt} />}>
        <SectionTag>{tag}</SectionTag>
        <SectionHeading>{heading}</SectionHeading>
        {intro}
        {link && (
          <p>
            <Link href={link.href}>{link.text}</Link>
          </p>
        )}
      </SectionContent>
    </Section>
  );
}

export { WebAssemblyComponents };
