import React from 'react';
import styles from './styles.module.css';

type Props<T extends keyof JSX.IntrinsicElements = 'h2'> = {
  as?: T;
} & JSX.IntrinsicElements[T];

function SectionTag({ as = 'h2', className, ...props }: Props) {
  const Tag = as;
  return <Tag className={[styles.tag, className].join(' ')} {...props} />;
}

export { SectionTag };
