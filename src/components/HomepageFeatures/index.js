import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Pleasantly Portable',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        wasmCloud provides a WebAssembly application runtime so you can run your applications everywhere - servers, clients, hosts, IOS, web browsers, IOT or where ever WebAssembly executes.
      </>
    ),
  },
  {
    title: 'Completely Connected',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        wasmCloud comes out of the box bundled with Lattice - a self-forming, self-healing mesh network that provides a unified, flattened topology across any number of disparate environments, clouds, browsers, or even hardware. No firewalls. No port forwarding. It just works.
      </>
    ),
  },
  {
    title: 'Securely Scalable',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        wasmCloud embraces a deny by default paradigm - actors are only permitted to access capabilities they have been explicity granted permission to leverage. With wasmCloud, ALL code is untrusted code.
      </>
    ),
  },
];

function Feature({ Svg, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
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
