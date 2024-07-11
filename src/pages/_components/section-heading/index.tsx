import React from 'react';
import styles from './styles.module.css';

type Props = {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
} & React.HTMLAttributes<HTMLHeadingElement>;

function SectionHeading({ as = 'h3', className, ...props }: Props) {
  const Tag = as;
  return <Tag className={[styles.heading, className].join(' ')} {...props} />;
}

export { SectionHeading };
