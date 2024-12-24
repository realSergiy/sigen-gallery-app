export const VIDEO_WIDTH_SMALL = 50;
// Height determined by intrinsic photo aspect ratio
export const VIDEO_WIDTH_MEDIUM = 300;
// Height determined by intrinsic photo aspect ratio
export const VIDEO_WIDTH_LARGE = 1000;

export type VideoProps = {
  showControls?: boolean;
  aspectRatio: number;
  blurCompatibilityMode?: boolean;
  className?: string;
  videoClassName?: string;
  src: string;
  alt: string;
  blurDataURL?: string;
};
