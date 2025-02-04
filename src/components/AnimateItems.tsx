'use client';

import { ReactNode, useRef } from 'react';
import { type Variant, motion } from 'framer-motion';
import { useAppState } from '@/state/AppState';
import usePrefersReducedMotion from '@/utility/usePrefersReducedMotion';

const IGNORE_CAN_START = true;

export type AnimationType = 'none' | 'scale' | 'left' | 'right' | 'bottom';

export type AnimationConfig = {
  type?: AnimationType;
  duration?: number;
  staggerDelay?: number;
  scaleOffset?: number;
  distanceOffset?: number;
};

type Props = {
  className?: string;
  classNameItem?: string;
  items: ReactNode[];
  itemKeys?: string[];
  canStart?: boolean;
  animateFromAppState?: boolean;
  animateOnFirstLoadOnly?: boolean;
  staggerOnFirstLoadOnly?: boolean;
  onAnimationComplete?: () => void;
} & AnimationConfig;

function AnimateItems({
  className,
  classNameItem,
  items,
  itemKeys,
  canStart = true,
  type = 'scale',
  duration = 0.6,
  staggerDelay = 0.1,
  scaleOffset = 0.9,
  distanceOffset = 20,
  animateFromAppState,
  animateOnFirstLoadOnly,
  staggerOnFirstLoadOnly,
  onAnimationComplete,
}: Props) {
  const { hasLoaded, nextPhotoAnimation, clearNextPhotoAnimation } = useAppState();

  const prefersReducedMotion = usePrefersReducedMotion();

  const hasLoadedInitial = useRef(hasLoaded);
  const nextPhotoAnimationInitial = useRef(nextPhotoAnimation);

  const shouldAnimate =
    type !== 'none' &&
    !prefersReducedMotion &&
    !(animateOnFirstLoadOnly && hasLoadedInitial.current);
  const shouldStagger = !(staggerOnFirstLoadOnly && hasLoadedInitial.current);

  const typeResolved = animateFromAppState
    ? (nextPhotoAnimationInitial.current?.type ?? type)
    : type;

  const durationResolved = animateFromAppState
    ? (nextPhotoAnimationInitial.current?.duration ?? duration)
    : duration;

  const getInitialVariant = (): Variant => {
    switch (typeResolved) {
      case 'left':
        return {
          opacity: 0,
          transform: `translateX(${distanceOffset}px)`,
        };
      case 'right':
        return {
          opacity: 0,
          transform: `translateX(${-distanceOffset}px)`,
        };
      case 'bottom':
        return {
          opacity: 0,
          transform: `translateY(${distanceOffset}px)`,
        };
      default:
        return {
          opacity: 0,
          transform: `translateY(${distanceOffset}px) scale(${scaleOffset})`,
        };
    }
  };

  return (
    <motion.div
      className={className}
      initial={shouldAnimate ? 'hidden' : false}
      animate={canStart || IGNORE_CAN_START ? 'show' : 'hidden'}
      variants={
        shouldStagger
          ? {
              show: {
                transition: {
                  staggerChildren: staggerDelay,
                },
              },
            }
          : undefined
      }
      onAnimationComplete={() => {
        if (animateFromAppState) {
          clearNextPhotoAnimation?.();
        }
        onAnimationComplete?.();
      }}
    >
      {items.map((item, index) => (
        <motion.div
          key={itemKeys ? itemKeys[index] : index}
          className={classNameItem}
          variants={{
            hidden: getInitialVariant(),
            show: {
              opacity: 1,
              transform: 'translateX(0) translateY(0) scale(1)',
            },
          }}
          transition={{
            duration: durationResolved,
            easing: 'easeOut',
          }}
        >
          {item}
        </motion.div>
      ))}
    </motion.div>
  );
}

export default AnimateItems;
