import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';
import YouTube from 'react-player/youtube';

export default {
  ...MDXComponents,
  YouTube: (props) => {
    return (
      <YouTube controls {...props} height="auto" width="100%" style={{ aspectRatio: '16/9' }} />
    );
  },
};
