import React from 'react';
import styles from './styles.module.css';
import { useColorMode } from '@docusaurus/theme-common';
import clsx from 'clsx';

function NewsImageComponent() {
  const { colorMode } = useColorMode();
  const root = '/img/';
  return (
    <img
      className={styles.newsSvg}
      src={root + (colorMode === 'dark' ? 'news-dark.svg' : 'news-light.svg')}
      alt="News Image"
    />
  );
}

export default function NewsSection() {
  return (
    <div className={styles.newsContainer}>
      <div className="container">
        <div className={styles.newsRow}>
          <NewsImageComponent />

          <div className={styles.newsText}>
            <h1>wasmCloud Security Assessment</h1>
            <div>
              <i>
                "WasmCloud is a well reviewed project, with lots of diligence in its security
                posture. This has paid off, as evidenced by this audit, which had{' '}
                <strong>no severe or high issues to resolve</strong>."
              </i>
            </div>
            <a
              className={clsx('button', 'button--lg', styles.button)}
              href="https://ostif.org/ostif-has-completed-a-security-audit-of-wasmcloud/"
            >
              Read more on OSTIF.org
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
