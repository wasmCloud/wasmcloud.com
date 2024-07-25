import React from 'react';
import styles from './sketch-underline.module.css';
import clsx from 'clsx';
import SvgUnderline from './img/underline.svg';

function SketchUnderline({ children, ...props }) {
  return (
    <span className={clsx(styles.underline, 'sketch sketch--underline')} {...props}>
      {children}
      <SvgUnderline className={clsx(styles.image, 'sketch__svg')} />
    </span>
  );
}

export { SketchUnderline };
