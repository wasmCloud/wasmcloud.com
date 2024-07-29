import { Section } from '@site/src/pages/_components/section';
import { SectionHeading } from '@site/src/pages/_components/section-heading';
import { SectionTag } from '@site/src/pages/_components/section-tag';
import React from 'react';
import styles from './kubernetes.module.css';

type Props = {};

function Kubernetes({}: Props) {
  return (
    <Section color="dark-gray" id="kubernetes">
      <div className="container">
        <div className={styles.content}>
          <div>
            <SectionTag>Kubernetes</SectionTag>
            <SectionHeading>Extend Kubernetes with wasmCloud</SectionHeading>
            <p>
              Run wasmCloud standalone or on Kubernetes. Leverage WebAssembly components to extend
              Kubernetes and distribute applications across clouds, regions, clusters, and edges.
            </p>
            <p>
              <a href="https://wasmcloud.com/docs/deployment/k8s/" target="_blank">
                Deploy the wasmCloud k8s Operator
              </a>
            </p>
          </div>
          <div>
            <img className={styles.image} src="/img/pages/home/kubernetes/kubernetes.svg" alt="" />
          </div>
        </div>
      </div>
      <div className="container"></div>
    </Section>
  );
}

export { Kubernetes };
