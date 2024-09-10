import React from 'react';

function useBodyScrollLock(check: boolean) {
  React.useEffect(() => {
    if (!check) {
      document.body.style.overflow = 'auto';
      return;
    }
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [check]);
}

export { useBodyScrollLock };
