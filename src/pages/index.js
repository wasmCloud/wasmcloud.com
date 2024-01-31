import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import SecurityAudit from '@site/src/components/SecurityAudit';
import { useColorMode } from '@docusaurus/theme-common';

import styles from './index.module.css';
import NewsSection from '../components/NewsSection';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  const { colorMode } = useColorMode();
  return (
    <header className={clsx(styles.hero, styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroItems}>
          <div className={styles.heroGraphic}>
            <img
              id="cloudspic"
              src="img/dancing-clouds.svg"
              class={colorMode === 'dark' ? styles.cloudsDark : styles.cloudsLight}
              alt="logo"
            />
          </div>
          <div className={styles.heroText}>
            <h1>{siteConfig.title}</h1>
            <p>
              {siteConfig.customFields.tagline_1}
              <br />
              {siteConfig.customFields.tagline_2}
            </p>
            {/* <div>
          Build your functions and services in the language you want and run them securely everywhere with WebAssembly.
        </div> */}
            <div className={styles.heroButton}>
              <Link className={clsx('button', 'button--lg', styles.button)} to="/docs/installation">
                Try it yourself
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* <div className={styles.terminal} id="terminal">
        wash new
        <br />
        wash app deploy
        <br />
        wash up
      </div> */}
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      wrapperClassName="homepage"
      title={`Homepage`}
      description="wasmCloud - Why stop at the Edge?"
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <NewsSection />
      </main>
    </Layout>
  );
}
