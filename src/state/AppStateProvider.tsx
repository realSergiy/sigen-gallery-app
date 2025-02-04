'use client';

import { useState, useEffect, ReactNode, useCallback } from 'react';
import { AnimationConfig } from '@/components/AnimateItems';
import usePathnames from '@/utility/usePathnames';
import { getAuthAction } from '@/auth/actions';
import useSWR from 'swr';
import { HIGH_DENSITY_GRID, MATTE_PHOTOS } from '@/site/config';
import { getPhotosHiddenMetaCachedAction } from '@/photo/serverFunctions';
import { useTimeout } from '@/hooks';
import { AppStateContext } from './AppState';

export default function AppStateProvider({ children }: { children: ReactNode }) {
  const { previousPathname } = usePathnames();

  // CORE
  const [hasLoaded, setHasLoaded] = useState(false);
  const [swrTimestamp, setSwrTimestamp] = useState(Date.now());
  const [nextPhotoAnimation, setNextPhotoAnimation] = useState<AnimationConfig>();
  const [shouldRespondToKeyboardCommands, setShouldRespondToKeyboardCommands] = useState(true);
  const [isCommandKOpen, setIsCommandKOpen] = useState(false);
  // ADMIN
  const [userEmail, setUserEmail] = useState<string>();
  const [adminUpdateTimes, setAdminUpdateTimes] = useState<Date[]>([]);
  const [hiddenPhotosCount, setHiddenPhotosCount] = useState(0);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[] | undefined>();
  const [isPerformingSelectEdit, setIsPerformingSelectEdit] = useState(false);

  // DEBUG
  const [isGridHighDensity, setIsGridHighDensity] = useState(HIGH_DENSITY_GRID);
  const [arePhotosMatted, setArePhotosMatted] = useState(MATTE_PHOTOS);
  const [shouldDebugImageFallbacks, setShouldDebugImageFallbacks] = useState(false);
  const [shouldShowBaselineGrid, setShouldShowBaselineGrid] = useState(false);

  const invalidateSwr = useCallback(() => setSwrTimestamp(Date.now()), []);

  const { data } = useSWR('getAuth', getAuthAction);
  useEffect(() => {
    setUserEmail(data?.user?.email ?? undefined);
  }, [data]);
  const isUserSignedIn = Boolean(userEmail);

  useTimeout(
    async () => {
      if (isUserSignedIn) {
        await getPhotosHiddenMetaCachedAction().then(({ count }) => setHiddenPhotosCount(count));
      } else {
        setHiddenPhotosCount(0);
      }
    },
    100,
    [isUserSignedIn],
  );

  const registerAdminUpdate = useCallback(
    () => setAdminUpdateTimes(updates => [...updates, new Date()]),
    [],
  );

  useEffect(() => {
    setHasLoaded?.(true);
  }, []);

  return (
    <AppStateContext.Provider
      value={{
        // CORE
        previousPathname,
        hasLoaded,
        setHasLoaded,
        swrTimestamp,
        invalidateSwr,
        nextPhotoAnimation,
        setNextPhotoAnimation,
        clearNextPhotoAnimation: () => setNextPhotoAnimation?.(undefined),
        shouldRespondToKeyboardCommands,
        setShouldRespondToKeyboardCommands,
        isCommandKOpen,
        setIsCommandKOpen,
        // ADMIN
        userEmail,
        setUserEmail,
        isUserSignedIn,
        adminUpdateTimes,
        registerAdminUpdate,
        hiddenPhotosCount,
        selectedPhotoIds,
        setSelectedPhotoIds,
        isPerformingSelectEdit,
        setIsPerformingSelectEdit,
        // DEBUG
        isGridHighDensity,
        setIsGridHighDensity,
        arePhotosMatted,
        setArePhotosMatted,
        shouldDebugImageFallbacks,
        setShouldDebugImageFallbacks,
        shouldShowBaselineGrid,
        setShouldShowBaselineGrid,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}
