import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        {/* <div>
          Build your functions and services in the language you want and run them securely everywhere with WebAssembly.
          <br />
          <span style={{fontFamily: "monospace"}}>
            curl -sfLfL https://install.wasmcloud.dev | bash
          </span>
          <br />
          <span style={{fontFamily: "monospace"}}>
            wash build
          </span>
          <br />
          <span style={{fontFamily: "monospace"}}>
            wash up
          </span>
        </div> */}
        <br />
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/installation">
            Get Started Today️
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Homepage`}
      description="wasmCloud - Why stop at the Edge?">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
