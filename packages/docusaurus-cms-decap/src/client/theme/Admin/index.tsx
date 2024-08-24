import React from 'react';
import { CmsConfig } from './CMSApplication';
import styles from './Admin.module.css';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

type AdminProps = {
  config: CmsConfig;
};

const CmsApplication = ExecutionEnvironment.canUseDOM
  ? React.lazy(() => import('./CMSApplication').then((mod) => ({ default: mod.CmsApplication })))
  : () => '';

function Loader() {
  return <div className={styles.loader}></div>;
}

function Admin({ config }: AdminProps) {
  return (
    <React.Suspense fallback={<Loader />}>
      <CmsApplication config={config} />
    </React.Suspense>
  );
  return;
}

export default Admin;
