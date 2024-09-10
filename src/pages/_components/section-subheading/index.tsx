import React, { ComponentProps } from 'react';
import styles from './styles.module.css';
import { SectionHeading } from '../section-heading';

type Props = ComponentProps<typeof SectionHeading>;

function SectionSubheading({ as = 'h4', className, ...props }: Props) {
  return <SectionHeading as={as} className={[styles.subheading, className].join(' ')} {...props} />;
}

export { SectionSubheading };
