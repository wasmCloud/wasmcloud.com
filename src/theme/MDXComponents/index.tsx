import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';
import YouTube from 'react-player/youtube';
import { LangTab, LangTabs } from '@site/src/components/LangTabs';

export default {
  ...MDXComponents,
  LangTabs,
  LangTab,
  YouTube: (props) => {
    return (
      <YouTube controls {...props} height="auto" width="100%" style={{ aspectRatio: '16/9' }} />
    );
  },
};
