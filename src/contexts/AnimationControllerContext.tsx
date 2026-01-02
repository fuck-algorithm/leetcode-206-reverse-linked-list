import { createContext, useContext, RefObject } from 'react';
import { AnimationController } from '../controllers/AnimationController';

type ControllerType = AnimationController | null;

interface AnimationControllerContextType {
  controllerRef: RefObject<ControllerType>;
}

export const AnimationControllerContext = createContext<AnimationControllerContextType | null>(null);

export const useAnimationController = () => {
  const context = useContext(AnimationControllerContext);
  if (!context) {
    throw new Error('useAnimationController must be used within AnimationControllerProvider');
  }
  return context;
};
