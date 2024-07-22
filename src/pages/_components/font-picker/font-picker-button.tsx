import React from 'react';
import styles from './styles.module.css';

type FontOption = {
  fontName: string;
  googleSource?: string;
  label?: string;
  category: FontCategory;
  weight?: string;
  headingWeight?: string;
  hero?: string;
  heading?: string;
  subheading?: string;
};

type FontCategory = (typeof CATEGORIES)[number];

const CATEGORIES = ['Strong', 'Fresh', 'Playful'] as const;

const FONTS: FontOption[] = [
  {
    category: 'Strong',
    label: 'DM Serif Text (current heading)',
    fontName: 'DM Serif Text',
  },
  {
    category: 'Fresh',
    label: 'Inter (current body)',
    fontName: 'Inter',
    weight: '600',
  },
  {
    category: 'Strong',
    fontName: 'Alegreya',
    googleSource: 'Alegreya:wght@700',
  },
  {
    category: 'Playful',
    fontName: 'BioRhyme',
    googleSource: 'BioRhyme:wght@600',
  },
  { category: 'Fresh', fontName: 'Caprasimo', weight: '400' },
  {
    category: 'Playful',
    fontName: 'Chivo Mono',
    googleSource: 'Chivo+Mono:wght@500',
  },
  { category: 'Fresh', fontName: 'Fraunces', weight: '600' },
  { category: 'Fresh', fontName: 'Gabarito', weight: '600' },
  {
    category: 'Fresh',
    fontName: 'Kufam',
    googleSource: 'Kufam:wght@600',
    weight: '600',
  },
  { category: 'Strong', fontName: 'Lalezar', weight: '400' },
  { category: 'Playful', fontName: 'Lilita One', weight: '400' },
  {
    category: 'Strong',
    fontName: 'Oswald',
    googleSource: 'Oswald:wght@500',
    weight: '500',
  },
  {
    category: 'Playful',
    fontName: 'Jersey 10',
  },
  {
    category: 'Strong',
    fontName: 'Platypi',
    googleSource: 'Platypi:wght@500',
    weight: '500',
  },
  { category: 'Strong', fontName: 'Suez One', weight: '400' },
  { category: 'Playful', fontName: 'Titan One', weight: '400' },
  { category: 'Fresh', fontName: 'Young Serif', weight: '400' },
  { category: 'Playful', fontName: 'Slackey', weight: '400' },
];

const VARIABLES: Record<string, Exclude<keyof FontOption, 'category' | 'label'>> = {
  '--hero-heading-font-family': 'fontName',
  '--hero-heading-font-size': 'hero',
  '--hero-heading-font-weight': 'weight',
  '--section-heading-font-family': 'fontName',
  '--section-heading-font-weight': 'weight',
  '--section-heading-font-size': 'heading',
  '--section-subheading-font-size': 'subheading',
  '--section-subheading-font-weight': 'headingWeight',
  '--ifm-heading-font-family': 'fontName',
  '--ifm-heading-font-weight': 'weight',
};

const STORAGE_KEY = 'wc-dev-font-family';

function FontPickerButton() {
  const [selectedFont, setFont] = React.useState(() => {
    const storedFont = localStorage.getItem(STORAGE_KEY);
    return storedFont && FONTS.find((f) => f && f.fontName === storedFont)
      ? storedFont
      : Object.keys(FONTS)[0];
  });
  const selectedFontObj = FONTS.find((f) => f.fontName === selectedFont);
  const linkRef = React.useRef<HTMLLinkElement | null>(null);
  const [visible, setVisible] = React.useState(false);
  const toggleVisible = () => setVisible((v) => !v);
  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFont(e.target.value);
    localStorage.setItem(STORAGE_KEY, e.target.value);
  };

  React.useEffect(() => {
    if (!selectedFontObj) return;
    linkRef.current?.remove();

    // Add the new font link
    const link = addStylesheetLink(selectedFontObj);
    linkRef.current = link;

    // Update the font properties
    updateProperties(selectedFontObj);

    return () => {
      updateProperties();
      link.remove();
    };
  }, [selectedFontObj]);

  return (
    <div className={styles.picker}>
      <button onClick={toggleVisible}>✍️</button>
      <select value={selectedFont} data-active={visible} onChange={handleFontChange}>
        {CATEGORIES.map((category) => (
          <optgroup key={category} label={category}>
            {FONTS.filter((font) => font.category === category).map((font) => (
              <option key={font.fontName} value={font.fontName}>
                {font.label ?? font.fontName}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}

function addStylesheetLink(font: FontOption) {
  const link = document.createElement('link');
  const googleFontName = font.googleSource ?? font.fontName.replace(/ /g, '+');
  link.href = `https://fonts.googleapis.com/css2?family=${googleFontName}&display=fallback`;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
  return link;
}

function updateProperties(font?: FontOption) {
  Object.entries(VARIABLES).forEach(([property, key]) => {
    const value = font ? font[key] : null;
    if (!value) {
      document.documentElement.style.removeProperty(property);
      return;
    }
    document.documentElement.style.setProperty(property, key === 'fontName' ? `'${value}'` : value);
  });
}

export { FontPickerButton };
