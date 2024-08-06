import React, { createContext, useContext, useState } from 'react';
import styles from './switcher.module.css';

const SwitcherContext = createContext<{
  active: string;
  setActive: React.Dispatch<React.SetStateAction<string>>;
}>({
  active: '',
  setActive: () => {},
});

function Switcher({ defaultValue, children }: React.PropsWithChildren<{ defaultValue: string }>) {
  const [active, setActive] = useState(defaultValue);

  return (
    <SwitcherContext.Provider value={{ active, setActive }}>
      <div className={styles.switcher}>{children}</div>
    </SwitcherContext.Provider>
  );
}

function SwitcherList({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  const childrenArray = React.Children.toArray(children);
  const separatedChildren = childrenArray.reduce((acc: Array<typeof child>, child, index) => {
    if (index !== childrenArray.length - 1) {
      acc.push(
        child,
        <img
          src="/pages/home/icon/arrow.svg"
          className={styles.arrow}
          key={`arrow-${index}`}
          alt=""
        />,
      );
    } else {
      acc.push(child);
    }
    return acc;
  }, []);
  return <div className={[styles.list, className].join(' ')}>{separatedChildren}</div>;
}

function SwitcherButton({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { active, setActive } = useContext(SwitcherContext);

  const handleClick = () => {
    setActive(value);
  };

  const isActive = active === value;

  const classList = [
    'button',
    isActive ? undefined : 'button--outline',
    styles.button,
    className,
  ].join(' ');

  return (
    <button className={classList} onClick={handleClick} data-active={isActive}>
      {children}
    </button>
  );
}

function SwitcherContent({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { active } = useContext(SwitcherContext);

  return (
    <div className={[styles.content, className].join(' ')} data-active={active === value}>
      {children}
    </div>
  );
}

export { Switcher, SwitcherList, SwitcherButton, SwitcherContent };
