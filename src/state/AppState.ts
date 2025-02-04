import { Dispatch, SetStateAction, createContext, useContext } from 'react';
import { AnimationConfig } from '@/components/AnimateItems';

export type AppState = {
  // CORE
  previousPathname?: string;
  hasLoaded?: boolean;
  setHasLoaded?: Dispatch<SetStateAction<boolean>>;
  swrTimestamp?: number;
  invalidateSwr?: () => void;
  nextPhotoAnimation?: AnimationConfig;
  setNextPhotoAnimation?: Dispatch<SetStateAction<AnimationConfig | undefined>>;
  clearNextPhotoAnimation?: () => void;
  nextVideoAnimation?: AnimationConfig;
  setNextVideoAnimation?: Dispatch<SetStateAction<AnimationConfig | undefined>>;
  clearNextVideoAnimation?: () => void;
  shouldRespondToKeyboardCommands?: boolean;
  setShouldRespondToKeyboardCommands?: Dispatch<SetStateAction<boolean>>;
  isCommandKOpen?: boolean;
  setIsCommandKOpen?: Dispatch<SetStateAction<boolean>>;
  //  ADMIN
  userEmail?: string;
  setUserEmail?: Dispatch<SetStateAction<string | undefined>>;
  isUserSignedIn?: boolean;
  adminUpdateTimes?: Date[];
  registerAdminUpdate?: () => void;
  hiddenPhotosCount?: number;
  hiddenVideosCount?: number;
  selectedPhotoIds?: string[];
  setSelectedPhotoIds?: Dispatch<SetStateAction<string[] | undefined>>;
  selectedVideoIds?: string[];
  setSelectedVideoIds?: Dispatch<SetStateAction<string[] | undefined>>;
  isPerformingSelectEdit?: boolean;
  setIsPerformingSelectEdit?: Dispatch<SetStateAction<boolean>>;
  // DEBUG
  isGridHighDensity?: boolean;
  setIsGridHighDensity?: Dispatch<SetStateAction<boolean>>;
  arePhotosMatted?: boolean;
  setArePhotosMatted?: Dispatch<SetStateAction<boolean>>;
  areVideosMatted?: boolean;
  setAreVideosMatted?: Dispatch<SetStateAction<boolean>>;
  shouldDebugImageFallbacks?: boolean;
  setShouldDebugImageFallbacks?: Dispatch<SetStateAction<boolean>>;
  shouldShowBaselineGrid?: boolean;
  setShouldShowBaselineGrid?: Dispatch<SetStateAction<boolean>>;
};

export const AppStateContext = createContext<AppState>({});

export const useAppState = () => useContext(AppStateContext);
