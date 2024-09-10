import clsx from 'clsx';
import styles from './section-content.module.css';
import React from 'react';

type Props = {
  hasContainer?: boolean;
  align?: 'start' | 'center';
  aside?: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

function SectionContent({
  children,
  className,
  aside,
  align = 'start',
  hasContainer = true,
  ...props
}: Props) {
  return (
    <article
      className={clsx(
        {
          [styles.content]: true,
          [styles.alignCenter]: align === 'center',
          container: hasContainer,
        },
        className,
      )}
      {...props}
    >
      {aside ? (
        <>
          <main className={styles.main}>{children}</main>
          <aside className={styles.aside}>{aside}</aside>
        </>
      ) : (
        children
      )}
    </article>
  );
}

export { SectionContent };
