import React, { HTMLProps } from 'react';
import styles from './logo-scroller.module.css';

const LOGO_PATHS = [
  '/pages/home/wasmcloud-ecosystem/brands/argocd.svg',
  '/pages/home/wasmcloud-ecosystem/brands/couchbase.svg',
  '/pages/home/wasmcloud-ecosystem/brands/docker.svg',
  '/pages/home/wasmcloud-ecosystem/brands/fluxcd.svg',
  '/pages/home/wasmcloud-ecosystem/brands/grafana.svg',
  '/pages/home/wasmcloud-ecosystem/brands/helm.svg',
  '/pages/home/wasmcloud-ecosystem/brands/kubernetes.svg',
  '/pages/home/wasmcloud-ecosystem/brands/minio.svg',
  '/pages/home/wasmcloud-ecosystem/brands/nats.svg',
  '/pages/home/wasmcloud-ecosystem/brands/opentelemetry.svg',
  '/pages/home/wasmcloud-ecosystem/brands/prometheus.svg',
  '/pages/home/wasmcloud-ecosystem/brands/redis.svg',
];

function LogoScroller() {
  const split = Math.ceil(LOGO_PATHS.length / 2);
  const firstHalf = LOGO_PATHS.slice(0, split);
  const secondHalf = LOGO_PATHS.slice(split);

  return (
    <div className={styles.scroller}>
      <div className={styles.row} style={{ '--count': firstHalf.length }}>
        <div className={styles.loop}>
          <div className={styles.inner} data-first>
            {firstHalf.map((logo, i) => (
              <img key={i} src={logo} alt="logo" className={styles.logo} />
            ))}
          </div>
          {firstHalf.map((logo, i) => (
            <img key={i} src={logo} alt="logo" className={styles.logo} />
          ))}
          <div className={styles.inner} data-last>
            {firstHalf.map((logo, i) => (
              <img key={i} src={logo} alt="logo" className={styles.logo} />
            ))}
          </div>
        </div>
      </div>
      <div className={styles.row} data-reverse>
        <div className={styles.loop} style={{ '--count': secondHalf.length }}>
          <div className={styles.inner} data-first>
            {secondHalf.map((logo, i) => (
              <img key={i} src={logo} alt="logo" className={styles.logo} />
            ))}
          </div>
          {secondHalf.map((logo, i) => (
            <img key={i} src={logo} alt="logo" className={styles.logo} />
          ))}
          <div className={styles.inner} data-last>
            {secondHalf.map((logo, i) => (
              <img key={i} src={logo} alt="logo" className={styles.logo} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export { LogoScroller };
