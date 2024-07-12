import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import BlogSidebar from '@theme/BlogSidebar';

import type { Props } from '@theme/BlogLayout';

export default function BlogLayout(props: Props): JSX.Element {
  const { sidebar, toc, children, ...layoutProps } = props;

  return (
    <Layout {...layoutProps}>
      <div className="container margin-vert--lg">
        <div className="row">
          {toc && <div className="col col--2">{toc}</div>}
          <main className={clsx('col', { 'col--10': toc })}>{children}</main>
        </div>
      </div>
    </Layout>
  );
}
