import React from 'react';
import Tabs from '@theme-original/Tabs';
import type TabsType from '@theme/Tabs';
import type { WrapperProps } from '@docusaurus/types';
import { useLocation } from '@docusaurus/router';

type Props = WrapperProps<typeof TabsType>;

function detectOS(): string | undefined {
  if (typeof navigator === 'undefined') return undefined;
  const ua = navigator.userAgent;
  if (/windows|win32|win64/i.test(ua)) return 'windows';
  return undefined; // default (macoslinux) is already correct for Mac/Linux
}

export default function TabsWrapper(props: Props): React.JSX.Element {
  const location = useLocation();
  const [osOverride, setOsOverride] = React.useState<string | undefined>();

  React.useEffect(() => {
    if (props.groupId === 'os') {
      const params = new URLSearchParams(location.search);
      if (!params.has('os')) {
        const detected = detectOS();
        if (detected) setOsOverride(detected);
      }
    }
  }, [props.groupId, location.search]);

  if (osOverride) {
    return <Tabs {...props} defaultValue={osOverride} />;
  }

  return <Tabs {...props} />;
}
