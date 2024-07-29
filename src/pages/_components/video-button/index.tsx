import { useVideoModal } from '@theme/wasmcloud/components/video-modal';
import styles from './video-button.module.css';

type VideoButtonProps = {
  url: string;
  title: string;
};

function VideoButton({ url, title }: VideoButtonProps) {
  const { open, thumbUrl } = useVideoModal(url);

  return (
    <div className={styles.videoButton}>
      <button onClick={open}>Play Video</button>
      <img src={thumbUrl} alt={title} />
    </div>
  );
}

export { VideoButton };
