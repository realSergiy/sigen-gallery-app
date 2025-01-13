import React, { useCallback, useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx/lite';

type VideoWithFallbackProps = {
  src: string;
  className?: string;
  videoClassName?: string;
  blurCompatibilityLevel?: 'none' | 'low' | 'high';
  poster?: string;
  showControls?: boolean;
} & React.VideoHTMLAttributes<HTMLVideoElement>;

export default function VideoWithFallback(props: VideoWithFallbackProps) {
  const {
    src,
    className,
    blurCompatibilityLevel = 'low',
    videoClassName = 'object-cover h-full',
    poster,
    showControls = false,
    ...rest
  } = props;

  const [wasCached, setWasCached] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [didError, setDidError] = useState(false);
  const [hideFallback, setHideFallback] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const onLoadedData = useCallback(() => setIsLoading(false), []);
  const onError = useCallback(() => setDidError(true), []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (videoRef.current?.readyState && videoRef.current.readyState >= 2) {
        setWasCached(true);
      } else {
        setWasCached(false);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading && !didError) {
      const hideTimer = setTimeout(() => setHideFallback(true), 1000);
      return () => clearTimeout(hideTimer);
    }
  }, [isLoading, didError]);

  const showFallback = !wasCached && !hideFallback;

  const getBlurClass = () => {
    switch (blurCompatibilityLevel) {
      case 'high':
        return 'blur-[4px] scale-[1.05]';
      case 'low':
        return 'blur-[2px] scale-[1.01]';
      default:
        return '';
    }
  };

  return (
    <div className={clsx(className, 'relative flex')}>
      {showFallback && (
        <div className={clsx('bg-main absolute inset-0 transition-opacity', 'opacity-100')} />
      )}
      <video
        ref={videoRef}
        controls={showControls}
        controlsList="nodownload noremoteplayback"
        className={clsx(videoClassName, getBlurClass())}
        onLoadedData={onLoadedData}
        onError={onError}
        poster={poster}
        disablePictureInPicture
        disableRemotePlayback
        muted
        {...rest}
      >
        <source src={src} />
      </video>
    </div>
  );
}
