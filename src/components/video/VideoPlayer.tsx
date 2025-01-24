'use client';
import { useEffect, useRef } from 'react';

type VideoPlayerProps = {
  playbackTimeRef: React.RefObject<number>;
} & React.VideoHTMLAttributes<HTMLVideoElement>;

export const VideoPlayer = ({ playbackTimeRef, src, ...rest }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = playbackTimeRef.current;
    }
  }, [src, playbackTimeRef]);

  return <video ref={videoRef} {...rest} />;
};
