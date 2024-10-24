window.CMS_MANUAL_INIT = true;

import CMS from 'decap-cms-app';
import React from 'react';

type RawConfig = Exclude<Parameters<typeof CMS.init>[0], undefined>['config'];
export type CmsConfig = RawConfig & {
  collections: RawConfig['collections'];
  media_folder: string;
  media_library: RawConfig['media_library'];
};

type CmsApplicationProps = {
  config: CmsConfig;
};

function CmsApplication({ config }: CmsApplicationProps) {
  React.useEffect(() => {
    CMS.init({
      config: {
        load_config_file: false,
        ...config,
      },
    });
  }, []);

  return <div id="nc-root" />;
}

export { CmsApplication };
