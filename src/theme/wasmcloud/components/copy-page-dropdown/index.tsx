import React, { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import { useClickOutside } from '@theme/wasmcloud/hooks/use-click-outside';
import { useKeypress } from '@theme/wasmcloud/hooks/use-keypress';
import styles from './styles.module.css';

// Converts a GitHub "edit this page" URL into a raw.githubusercontent.com URL
// so we can fetch the page's original Markdown/MDX source.
function editUrlToRawUrl(editUrl: string): string | undefined {
  const match = editUrl.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/edit\/([^/]+)\/(.+)$/);
  if (!match) return undefined;
  const [, org, repo, branch, path] = match;
  return `https://raw.githubusercontent.com/${org}/${repo}/${branch}/${path}`;
}

function stripFrontMatter(source: string): string {
  return source.replace(/^---\n[\s\S]*?\n---\n/, '').trim();
}

async function fetchPageMarkdown(rawUrl: string): Promise<string> {
  const response = await fetch(rawUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${rawUrl}: ${response.status}`);
  }
  return stripFrontMatter(await response.text());
}

function CopyPageDropdown(): React.JSX.Element {
  const { metadata } = useDoc();
  const [isOpen, setIsOpen] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copying' | 'copied' | 'error'>('idle');
  const containerRef = useRef<HTMLDivElement>(null);
  const copyResetTimeout = useRef<number | undefined>(undefined);

  const close = useCallback(() => setIsOpen(false), []);
  useClickOutside(containerRef, close);
  useKeypress('Escape', close);
  useEffect(() => () => window.clearTimeout(copyResetTimeout.current), []);

  const rawUrl = metadata.editUrl ? editUrlToRawUrl(metadata.editUrl) : undefined;

  const copyPage = useCallback(async () => {
    if (!rawUrl) return;
    window.clearTimeout(copyResetTimeout.current);
    setCopyState('copying');
    try {
      const markdown = await fetchPageMarkdown(rawUrl);
      await navigator.clipboard.writeText(markdown);
      setCopyState('copied');
    } catch (error) {
      console.error('Failed to copy page as Markdown', error);
      setCopyState('error');
    }
    copyResetTimeout.current = window.setTimeout(() => setCopyState('idle'), 2000);
    setIsOpen(false);
  }, [rawUrl]);

  const copyLlmsTxtLink = useCallback(async () => {
    window.clearTimeout(copyResetTimeout.current);
    setCopyState('copying');
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/llms.txt`);
      setCopyState('copied');
    } catch (error) {
      console.error('Failed to copy llms.txt link', error);
      setCopyState('error');
    }
    copyResetTimeout.current = window.setTimeout(() => setCopyState('idle'), 2000);
    setIsOpen(false);
  }, []);

  // The llms-plugin generates a Markdown twin of every page at its own
  // permalink + `.md`, so this can be a plain link instead of a client-side
  // fetch/Blob — no popup-blocker or MIME-type workarounds needed.
  const markdownUrl = `${metadata.permalink.replace(/\/$/, '')}.md`;

  const copyLabel =
    copyState === 'copied'
      ? 'Copied!'
      : copyState === 'error'
        ? 'Copy failed'
        : copyState === 'copying'
          ? 'Copying...'
          : 'Copy';

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        {copyLabel}
        <ChevronIcon className={clsx(styles.chevron, isOpen && styles.chevronOpen)} />
      </button>
      {isOpen && (
        <div className={styles.menu} role="menu">
          <button
            type="button"
            role="menuitem"
            className={styles.menuItem}
            onClick={copyPage}
            disabled={!rawUrl}
          >
            <div className={styles.menuItemText}>
              <span className={styles.menuItemLabel}>Copy page</span>
              <span className={styles.menuItemDescription}>Copy page as Markdown for LLMs</span>
            </div>
          </button>
          <a
            role="menuitem"
            className={styles.menuItem}
            href={markdownUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
          >
            <div className={styles.menuItemText}>
              <span className={styles.menuItemLabel}>
                View as Markdown <ExternalLinkIcon className={styles.externalIcon} />
              </span>
              <span className={styles.menuItemDescription}>View this page as plain text</span>
            </div>
          </a>
          <button
            type="button"
            role="menuitem"
            className={styles.menuItem}
            onClick={copyLlmsTxtLink}
          >
            <div className={styles.menuItemText}>
              <span className={styles.menuItemLabel}>Copy llms.txt link</span>
              <span className={styles.menuItemDescription}>
                Copy a link to this site&apos;s llms.txt for AI tools
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <path d="M15 3h6v6" />
      <path d="M10 14L21 3" />
    </svg>
  );
}

export { CopyPageDropdown };
