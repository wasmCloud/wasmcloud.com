import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Pleasantly Portable',
    Image: '/img/features/cloud.png',
    description: (
      <>
      Write your components once and run them <b>anywhere</b> at any scale. Deploy to the cloud, the edge, browsers, IoT, or anywhere in between.
      </>
    ),
  },
  {
    title: 'Completely Connected',
    Image: '/img/features/connected.png',
    description: (
      <>
        <b>Cluster</b> wasmCloud hosts together across disparate clouds and infrastructure, managing your apps with a single flat topology and never open a single firewall port. Clusters self-form, self-heal, and bridge multiple protocols to extend the cloud to the farthest edge.         
      </>
    ),
  },
  {
    title: 'Securely Scalable',
    Image: '/img/features/secure.png',
    description: (
      <>
        Build truly <b>zero trust</b> applications on wasmCloud. Leverage the WebAssembly sandbox and wasmCloud's cryptographically secure modules to automatically embrace defense in depth without sacrificing developer experience.        
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
