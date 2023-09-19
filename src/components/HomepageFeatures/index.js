import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Declarative WebAssembly App Orchestration',
    Image: '/img/features/cloud.png',
    description: (
      <>
        Write your application as a <b>declarative</b> set of WebAssembly components. Deploy your application to any cloud, edge, or IoT device with a single command.
      </>
    ),
  },
  {
    title: 'Edge-to-Cloud Compute Mesh',
    Image: '/img/features/connected.png',
    description: (
      <>
        Using <b>NATS</b>, wasmCloud hosts cluster together across disparate clouds and infrastructure, distributing your apps with a single flat topology without ever opening a single firewall port. Clusters self-form and self-heal to automatically enable load balancing and failover without building it into your app.
      </>
    ),
  },
  {
    title: 'Vendorless WebAssembly Components',
    Image: '/img/features/secure.png',
    description: (
      <>
        wasmCloud WebAssembly components are completely <b>vendorless</b> and don't tie you to any platform, cloud, or proprietary implementation. Swap out implementations and change your underlying infrastructure at any time without changing your application code.
      </>
    ),
  },
];

function Feature({ Image, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <img src={Image} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
