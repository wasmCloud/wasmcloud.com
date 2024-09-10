import type * as React from 'react';

declare module 'react' {
  interface CSSProperties {
    // allow for css custom properties in style objects
    [key: `--${string}`]: string | number | undefined;
  }
}
