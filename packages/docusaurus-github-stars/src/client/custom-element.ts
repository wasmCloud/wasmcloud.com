type StarsCache = {
  [repo: string]: CacheEntry;
};

type CacheEntry = {
  repo?: string;
  timestamp: number;
  stars: number;
};

interface Window {
  docusaurusGithubStars:
    | Array<CacheEntry>
    | {
        push: (value: { repo: string; stars: number; timestamp: number }) => void;
      };
}

function storeValue(repo: string, stars: number) {
  localStorage.setItem(
    'docusaurus-github-stars',
    JSON.stringify({
      [repo]: {
        stars,
        timestamp: Date.now(),
      },
    }),
  );
}

function getValue(repo: string) {
  const value = localStorage.getItem('docusaurus-github-stars');
  const parsedValue: StarsCache = value ? JSON.parse(value) : {};
  return parsedValue[repo] as CacheEntry | null;
}

function getStars(repo: string, signal?: AbortSignal): Promise<number> {
  const value = getValue(repo);
  const twentyFourHours = 24 * 60 * 60 * 1000;
  if (value && Date.now() - value.timestamp < twentyFourHours) {
    return Promise.resolve(value.stars);
  }

  return fetch(`https://api.github.com/repos/${repo}`, { signal })
    .then((response) => response.json())
    .then((data) => {
      const stars = data.stargazers_count;
      storeValue(repo, stars);
      return stars;
    });
}

function starsToString(stars: number): string {
  return stars > 1000 ? `${Math.floor(stars / 1000)}k` : stars.toString();
}

function init() {
  // only run in the browser
  if (typeof window === 'undefined') return;

  // handle values from the plugin
  if (Array.isArray(window.docusaurusGithubStars)) {
    window.docusaurusGithubStars.forEach((value) => {
      storeValue(value.repo, value.stars);
    });
  }
  // override the array with something that looks like an array, but uses the localStorage helper
  window.docusaurusGithubStars = {
    length: 0,
    push: ({ repo, stars, timestamp }: CacheEntry) => {
      if (!repo) return;
      const currentValue = getValue(repo);
      if (currentValue && currentValue.timestamp > timestamp) {
        return;
      }
      storeValue(repo, stars);
    },
  };

  // Create a class for the element
  class DocusaurusGithubCount extends HTMLElement {
    static observedAttributes = ['repo', 'expiry'];

    controller: AbortController;

    constructor() {
      super();
      this.controller = new AbortController();
    }

    #updateStars() {
      if (this.controller.signal.aborted) {
        this.controller = new AbortController();
      }

      const repo = this.getAttribute('repo');

      if (!repo) {
        console.error('Missing required attribute "repo"');
        return;
      }

      getStars(repo, this.controller.signal).then((stars) => {
        this.innerHTML = stars.toString();
      });
    }

    connectedCallback() {
      this.#updateStars();
    }

    disconnectedCallback() {
      this.controller.abort();
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
      this.#updateStars();
    }
  }

  customElements.define('github-count', DocusaurusGithubCount);
}

init();
