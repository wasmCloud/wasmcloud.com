import { HTMLProps, PropsWithChildren } from 'react';
import styles from './styles.module.css';
import clsx from 'clsx';

type BaseProps = PropsWithChildren<HTMLProps<HTMLDivElement>>;

type GridProps = BaseProps & {
  alignLast?: boolean;
  center?: boolean;
};

type GridItemProps = BaseProps;

function Grid({ children, className, alignLast, center, ...props }: GridProps) {
  return (
    <div
      className={clsx(styles.grid, className, {
        [styles.alignLast]: alignLast,
        [styles.center]: center,
      })}
      {...props}
    >
      {children}
    </div>
  );
}

function GridItem({ children, className, ...props }: GridItemProps) {
  return (
    <div className={clsx(styles.gridItem, className)} {...props}>
      {children}
    </div>
  );
}

export { Grid, GridItem };
