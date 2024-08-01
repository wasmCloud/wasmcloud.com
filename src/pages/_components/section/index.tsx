import React, { PropsWithChildren } from 'react';
import styles from './styles.module.css';

export type SectionColor = 'dark-gray' | 'light-gray' | 'green' | 'space-blue' | 'yellow';

type Props = {
  color?: SectionColor;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

function Section({ className = '', color = 'light-gray', ...props }: PropsWithChildren<Props>) {
  return (
    <section className={[styles.section, `section--${color}`, className].join(' ')} {...props} />
  );
}

export { Section };
