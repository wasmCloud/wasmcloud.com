import React, { memo, useState, useMemo } from 'react';
import { translate } from '@docusaurus/Translate';
import { useVisibleBlogSidebarItems } from '@docusaurus/plugin-content-blog/client';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import type { BlogSidebar, BlogSidebarItem } from '@docusaurus/plugin-content-blog';
import styles from './styles.module.css';
import { isTranscriptPermalink } from '../utils';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

type GroupedItems = Map<string, Map<string, BlogSidebarItem[]>>;

function groupByYearMonth(items: BlogSidebarItem[]): GroupedItems {
  const grouped: GroupedItems = new Map();

  for (const item of items) {
    const { year: y, month: m } = parseDate(item.date);
    const year = String(y);
    const month = String(m);

    if (!grouped.has(year)) {
      grouped.set(year, new Map());
    }
    const yearMap = grouped.get(year)!;
    if (!yearMap.has(month)) {
      yearMap.set(month, []);
    }
    yearMap.get(month)!.push(item);
  }

  return grouped;
}

function parseDate(d: Date | string): { year: number; month: number; day: number } {
  const date = new Date(d);
  // Use UTC to avoid timezone-shifting the day
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(),
    day: date.getUTCDate(),
  };
}

/** Strip redundant "Community Meeting - YYYY-MM-DD" / "Meeting Agenda - YYYY-MM-DD" prefixes */
function cleanTitle(title: string): string {
  return title
    .replace(/^(?:Community Meeting|Meeting Agenda)\s*[-–—]\s*\d{4}-\d{2}-\d{2}$/i, '')
    .trim();
}

function getDay(item: BlogSidebarItem): string {
  const { day } = parseDate(item.date);
  return String(day);
}

function MonthGroup({
  month,
  items,
  defaultOpen,
}: {
  month: string;
  items: BlogSidebarItem[];
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const { pathname } = useLocation();

  return (
    <div className={styles.monthGroup}>
      <button
        className={styles.monthToggle}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className={styles.chevron} data-open={open}>
          ›
        </span>
        {MONTH_NAMES[Number(month)]}
      </button>
      {open && (
        <ul className={styles.dayList}>
          {items.map((item) => {
            const isActive = pathname === item.permalink;
            const day = getDay(item);
            const title = cleanTitle(item.title);
            return (
              <li key={item.permalink} className={styles.dayItem}>
                <Link
                  to={item.permalink}
                  className={`${styles.dayLink} ${isActive ? styles.dayLinkActive : ''}`}
                  title={item.title}
                >
                  <span className={styles.dayNum}>{day}</span>
                  {title && (
                    <span className={styles.dayTitle}>{title}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function YearGroup({
  year,
  months,
  defaultOpen,
}: {
  year: string;
  months: Map<string, BlogSidebarItem[]>;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  // Sort months descending (most recent first)
  const sortedMonths = useMemo(
    () => [...months.entries()].sort(([a], [b]) => Number(b) - Number(a)),
    [months],
  );

  return (
    <div className={styles.yearGroup}>
      <button
        className={styles.yearToggle}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className={styles.chevron} data-open={open}>
          ›
        </span>
        {year}
      </button>
      {open &&
        sortedMonths.map(([month, items]) => (
          <MonthGroup
            key={month}
            month={month}
            items={items}
            defaultOpen={defaultOpen}
          />
        ))}
    </div>
  );
}

interface Props {
  sidebar: BlogSidebar;
}

function CommunitySidebar({ sidebar }: Props) {
  const allItems = useVisibleBlogSidebarItems(sidebar.items);
  // Hide transcript posts from the sidebar; they remain reachable from each
  // summary page's "Read the full transcript →" link and via direct URL.
  const items = useMemo(
    () => allItems.filter((item) => !isTranscriptPermalink(item.permalink)),
    [allItems],
  );
  const grouped = useMemo(() => groupByYearMonth(items), [items]);

  // Sort years descending
  const sortedYears = useMemo(
    () => [...grouped.entries()].sort(([a], [b]) => Number(b) - Number(a)),
    [grouped],
  );

  // Most recent year is open by default
  const latestYear = sortedYears.length > 0 ? sortedYears[0][0] : null;

  if (!items.length) {
    return null;
  }

  return (
    <aside className={`col col--3 ${styles.sidebar}`}>
      <nav
        className={`${styles.nav} thin-scrollbar`}
        aria-label={translate({
          id: 'theme.blog.sidebar.navAriaLabel',
          message: 'Blog recent posts navigation',
          description: 'The ARIA label for recent posts in the blog sidebar',
        })}
      >
        <div className={styles.sidebarTitle}>{sidebar.title}</div>
        {sortedYears.map(([year, months]) => (
          <YearGroup
            key={year}
            year={year}
            months={months}
            defaultOpen={year === latestYear}
          />
        ))}
      </nav>
    </aside>
  );
}

export default memo(CommunitySidebar);
