import React from 'react';
import Content from '@theme-original/DocItem/Content';
import type ContentType from '@theme/DocItem/Content';
import type { WrapperProps } from '@docusaurus/types';
import { useDocsVersion } from '@docusaurus/plugin-content-docs/client';
import { CopyPageDropdown } from '@theme/wasmcloud/components/copy-page-dropdown';
import styles from './styles.module.css';

type Props = WrapperProps<typeof ContentType>;

export default function ContentWrapper(props: Props): React.JSX.Element {
  // Only the latest docs version (v2) gets the copy/LLM dropdown.
  const { isLast } = useDocsVersion();

  return (
    <div className={styles.wrapper}>
      {isLast && (
        <div className={styles.toolbar}>
          <CopyPageDropdown />
        </div>
      )}
      <Content {...props} />
    </div>
  );
}
