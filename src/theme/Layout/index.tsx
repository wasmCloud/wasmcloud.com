import React from 'react';
import Layout from '@theme-original/Layout';
import type LayoutType from '@theme/Layout';
import type { WrapperProps } from '@docusaurus/types';
import { VideoModalProvider } from '@theme/wasmcloud/components/video-modal';

type Props = WrapperProps<typeof LayoutType>;

export default function LayoutWrapper(props: Props): JSX.Element {
  return (
    <>
      <VideoModalProvider>
        <Layout {...props} />
      </VideoModalProvider>
    </>
  );
}
