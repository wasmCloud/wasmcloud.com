import React from 'react';
import styles from './sketch-sparkles.module.css';
import clsx from 'clsx';
import SvgSparkles from './img/sparkles.svg';

function SketchSparkles({ children, ...props }) {
  return (
    <span className={clsx(styles.sparkles, 'sketch sketch--sparkles')} {...props}>
      {children}
      <SvgSparkles className={clsx(styles.image, 'sketch__svg')} />
    </span>
  );
}

export { SketchSparkles };
