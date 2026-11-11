import React from 'react';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

/** Display labels for the languages used across the docs, keyed by `lang`. */
export const LANG_LABELS: Record<string, string> = {
  rust: 'Rust',
  go: 'Go',
  tinygo: 'TinyGo',
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  python: 'Python',
};

/** The `Tabs` group ID shared by every language selector so the choice syncs across a page and the site. */
export const LANG_GROUP_ID = 'lang';

export interface LangTabProps {
  /** Language key, e.g. `rust`. Used as the tab value and synced through the `lang` query string. */
  lang: string;
  /** Overrides the label looked up from `LANG_LABELS`. */
  label?: string;
  /** Selects this tab when the reader has not chosen a language yet. */
  default?: boolean;
  /** Set by `LangTabs` so `Tabs` can read it from the child's props. Don't pass it in MDX. */
  value?: string;
  children?: React.ReactNode;
}

function labelFor(lang: string, label?: string): string {
  return label ?? LANG_LABELS[lang] ?? lang.charAt(0).toUpperCase() + lang.slice(1);
}

/** A single language's content. Use inside `<LangTabs>`. */
export function LangTab({
  lang,
  label,
  default: isDefault,
  children,
}: LangTabProps): React.JSX.Element {
  return (
    <TabItem value={lang} label={labelFor(lang, label)} default={isDefault}>
      {children}
    </TabItem>
  );
}

/**
 * Language tabs that stay in sync everywhere on the site. Wraps `Tabs` with the shared `lang`
 * group ID and query string, so authors don't repeat (or mistype) those props.
 *
 * ```mdx
 * <LangTabs>
 *   <LangTab lang="rust" default>...</LangTab>
 *   <LangTab lang="tinygo">...</LangTab>
 * </LangTabs>
 * ```
 */
export function LangTabs({ children }: { children: React.ReactNode }): React.JSX.Element {
  // `Tabs` reads `value`, `label` and `default` from its direct children's props to build the tab
  // list, so surface them from `lang` instead of requiring authors to pass them.
  const items = React.Children.map(children, (child) => {
    if (!React.isValidElement<LangTabProps>(child) || child.type !== LangTab) {
      return child;
    }
    const { lang, label, default: isDefault } = child.props;
    return React.cloneElement(child, {
      value: lang,
      label: labelFor(lang, label),
      default: isDefault,
    });
  });

  return (
    <Tabs groupId={LANG_GROUP_ID} queryString>
      {items}
    </Tabs>
  );
}
