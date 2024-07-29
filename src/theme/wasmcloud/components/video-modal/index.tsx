import React from 'react';
import styles from './video-modal.module.css';
import YouTubePlayer, { YouTubePlayerProps } from 'react-player/youtube';
import BaseReactPlayer from 'react-player/base';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { getThumbUrl, normalizeUrl } from './youtube';
import { useBodyScrollLock } from '@theme/wasmcloud/hooks/use-body-scroll-lock';
import { useClickOutside } from '@theme/wasmcloud/hooks/use-click-outside';
import { useKeypress } from '@theme/wasmcloud/hooks/use-keypress';

type VideoModalContextValue = {
  url: string;
  options: Omit<YouTubePlayerProps, 'url'>;
  isOpen: boolean;
  modalRef: React.RefObject<HTMLDivElement>;
  open: (url: string) => void;
  close: () => void;
};

const VideoModalContext = React.createContext<VideoModalContextValue | undefined>(undefined);

function useVideoModal(url: string) {
  const context = React.useContext(VideoModalContext);
  const videoUrl = normalizeUrl(url);
  if (!context) {
    throw new Error('useVideoModal must be used within a VideoModalProvider');
  }
  return {
    open: () => context.open(videoUrl),
    close: context.close,
    thumbUrl: getThumbUrl(videoUrl),
  };
}

function VideoModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [url, setUrl] = React.useState('');
  const modalRef = React.useRef<HTMLDivElement>(null);

  const value = React.useMemo(() => {
    const options = {
      controls: true,
      playing: true,
      loop: true,
      width: '100%',
      height: '100%',
    };

    const open = (url: string) => {
      if (isOpen) return;
      setUrl(url);
      setIsOpen(true);
    };

    const close = () => {
      setUrl('');
      setIsOpen(false);
    };

    return {
      modalRef,
      url,
      isOpen,
      options,
      open,
      close,
    };
  }, [url, isOpen]);

  return (
    <VideoModalContext.Provider value={value}>
      {children}
      <BrowserOnly>{() => <GlobalEvents />}</BrowserOnly>
      <VideoModal modalRef={modalRef} />
    </VideoModalContext.Provider>
  );
}

function VideoModal({ modalRef }: { modalRef: React.RefObject<HTMLDivElement> }) {
  const { url, isOpen, options, close } = React.useContext(VideoModalContext);

  return (
    <div className={styles.modal} data-open={isOpen}>
      <div className={styles.modalContent}>
        <div className={styles.video} ref={modalRef}>
          <button className={styles.closeButton} onClick={close}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          {isOpen && <YouTubePlayer url={url} {...options} />}
        </div>
      </div>
    </div>
  );
}

function GlobalEvents() {
  const { close, isOpen, modalRef } = React.useContext(VideoModalContext);

  const handleClickOutside = React.useCallback(() => {
    if (isOpen) close();
  }, [isOpen, close]);

  useClickOutside(modalRef, handleClickOutside);
  useKeypress('Escape', close);
  useBodyScrollLock(isOpen);

  return null;
}

export { VideoModalProvider, useVideoModal };
