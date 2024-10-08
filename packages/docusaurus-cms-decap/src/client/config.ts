import { ClientModule } from '@docusaurus/types';

export default {
  onRouteDidUpdate({ location, previousLocation }) {
    if (location.pathname === '/admin') {
      // TODO: Not sure if there's anything needed here, but leaving for reference
    }
  },
} satisfies ClientModule;
