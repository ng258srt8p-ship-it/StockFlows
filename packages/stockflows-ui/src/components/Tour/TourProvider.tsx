import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

const TOUR_COMPLETED_KEY = 'sf-tour-completed';

export interface TourContextValue {
  currentStep: number;
  isActive: boolean;
  isCompleted: boolean;
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  completeTour: () => void;
  dismissTour: () => void;
  setCurrentStep: (step: number) => void;
}

const TourContext = createContext<TourContextValue | undefined>(undefined);

export interface TourProviderProps {
  children: React.ReactNode;
}

export const TourProvider: React.FC<TourProviderProps> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(TOUR_COMPLETED_KEY) === 'true';
  });

  useEffect(() => {
    localStorage.setItem(TOUR_COMPLETED_KEY, String(isCompleted));
  }, [isCompleted]);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => prev + 1);
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const completeTour = useCallback(() => {
    setIsCompleted(true);
    setIsActive(false);
    setCurrentStep(0);
  }, []);

  const dismissTour = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
  }, []);

  const value = useMemo(
    () => ({
      currentStep,
      isActive,
      isCompleted,
      startTour,
      nextStep,
      prevStep,
      completeTour,
      dismissTour,
      setCurrentStep,
    }),
    [currentStep, isActive, isCompleted, startTour, nextStep, prevStep, completeTour, dismissTour]
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
};

export const useTourContext = (): TourContextValue => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTourContext must be used within a TourProvider');
  }
  return context;
};
