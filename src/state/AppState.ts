import { Dispatch, SetStateAction, createContext, useContext } from 'react';
import { AnimationConfig } from '@/components/AnimateItems';

export interface AppStateContext {
  // CORE
  previousPathname?: string;
  hasLoaded?: boolean;
  setHasLoaded?: Dispatch<SetStateAction<boolean>>;
  swrTimestamp?: number;
  invalidateSwr?: () => void;
  nextPhotoAnimation?: AnimationConfig;
  setNextPhotoAnimation?: Dispatch<SetStateAction<AnimationConfig | undefined>>;
  clearNextPhotoAnimation?: () => void;
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
  selectedPhotoIds?: string[];
  setSelectedPhotoIds?: Dispatch<SetStateAction<string[] | undefined>>;
  isPerformingSelectEdit?: boolean;
  setIsPerformingSelectEdit?: Dispatch<SetStateAction<boolean>>;
  // DEBUG
  isGridHighDensity?: boolean;
  setIsGridHighDensity?: Dispatch<SetStateAction<boolean>>;
  arePhotosMatted?: boolean;
  setArePhotosMatted?: Dispatch<SetStateAction<boolean>>;
  shouldDebugImageFallbacks?: boolean;
  setShouldDebugImageFallbacks?: Dispatch<SetStateAction<boolean>>;
  shouldShowBaselineGrid?: boolean;
  setShouldShowBaselineGrid?: Dispatch<SetStateAction<boolean>>;
}

export const AppStateContext = createContext<AppStateContext>({});

export const useAppState = () => useContext(AppStateContext);
