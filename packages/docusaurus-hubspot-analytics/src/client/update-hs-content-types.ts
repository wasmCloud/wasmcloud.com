import type { ClientModule } from '@docusaurus/types';

type HsContentType = 'site-page' | 'landing-page' | 'blog-post' | 'knowledge-article';
type PluginFilter = { id?: string; plugin: string };

declare global {
  interface Window {
    _hsq: any[];
    pluginHubspotAnalytics: [PluginFilter, HsContentType][];
  }
}

const module: ClientModule = {
  onRouteDidUpdate() {
    // make sure _hsq and plugin data is defined
    const _hsq = (window._hsq = window._hsq || []);
    const pluginPages = window.pluginHubspotAnalytics || [];

    // setTimeout to move execution to the end of the event loop after router has updated the DOM
    setTimeout(() => {
      const { pluginId, pluginName } = getPluginNameAndId();

      // set content type based on plugin name and id
      for (const [pluginFilter, contentType] of pluginPages) {
        const pluginMatches = pluginName === pluginFilter.plugin;
        const idIsMissingOrMatches = !pluginFilter.id || pluginId === pluginFilter.id;

        if (pluginMatches && idIsMissingOrMatches) setContentType(_hsq, contentType);
      }
    }, 0);
  },
};

function getPluginNameAndId() {
  const className = document.querySelector('html')?.className ?? '';
  const pluginName = className.match(/plugin-((?!:id-)\S+)/)?.[1];
  const pluginId = className.match(/plugin-id-(\S+)/)?.[1];
  return { pluginName, pluginId };
}

function setContentType(_hsq: any[], type: HsContentType) {
  _hsq.push(['setContentType', type]);
}

export default module;
