import { useState, useCallback, useEffect, useRef } from 'react';

const TOUR_COMPLETED_KEY = 'stockflows-tour-completed';

/**
 * Check if the tour has already been completed (persisted in localStorage).
 */
function isTourCompleted(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(TOUR_COMPLETED_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Persist tour completion to localStorage.
 */
function persistTourCompleted(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
  } catch {
    // Silently ignore storage errors.
  }
}

/**
 * Shepherd.js step definition (subset of Shepherd.StepOptions).
 */
export interface TourStepConfig {
  id: string;
  title?: string;
  text: string | HTMLElement | (() => string | HTMLElement);
  attachTo?: { element: string | HTMLElement; on?: 'top' | 'bottom' | 'left' | 'right' };
  buttons?: Array<{
    text: string;
    action: () => void;
    classes?: string;
  }>;
  classes?: string;
  highlightClass?: string;
  arrow?: boolean;
  canClickTarget?: boolean;
  floatingUIOptions?: object;
}

export interface UseTourManagerOptions {
  /** Unique identifier for this tour — used for localStorage persistence. */
  tourId?: string;
  /** Steps to register with Shepherd.js */
  steps: TourStepConfig[];
  /** Called when the tour completes (user finishes all steps). */
  onComplete?: () => void;
  /** Called when the tour is dismissed early. */
  onDismiss?: () => void;
}

export interface UseTourManagerResult {
  isActive: boolean;
  currentStep: number;
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  completeTour: () => void;
  dismissTour: () => void;
  isCompleted: boolean;
}

/**
 * Wraps Shepherd.js Tour with state management and localStorage persistence.
 *
 * Shepherd.js is dynamically imported to avoid SSR issues.
 */
export function useTourManager(options: UseTourManagerOptions): UseTourManagerResult {
  const { tourId = 'default', steps, onComplete, onDismiss } = options;

  const tourRef = useRef<unknown>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(() => {
    // Check tour-specific key first, then global key.
    if (typeof window === 'undefined') return false;
    try {
      const specific = localStorage.getItem(`${TOUR_COMPLETED_KEY}-${tourId}`);
      if (specific !== null) return specific === 'true';
      return isTourCompleted();
    } catch {
      return false;
    }
  });

  // Cleanup tour on unmount.
  useEffect(() => {
    return () => {
      const tour = tourRef.current as { cancel?: () => void } | null;
      if (tour?.cancel) {
        tour.cancel();
      }
    };
  }, []);

  const persistCompleted = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`${TOUR_COMPLETED_KEY}-${tourId}`, 'true');
      persistTourCompleted();
    } catch {
      // Silently ignore.
    }
  }, [tourId]);

  const startTour = useCallback(async () => {
    if (steps.length === 0) return;

    // Dynamic import of Shepherd.js to avoid SSR issues.
    const Shepherd = (await import('shepherd.js')).default;
    const tour = new Shepherd.Tour({
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        classes: 'shepherd-theme-arrows',
      },
    });

    // Register steps.
    for (const step of steps) {
      tour.addStep({
        id: step.id,
        title: step.title,
        text: step.text,
        attachTo: step.attachTo,
        buttons: step.buttons ?? [
          { text: 'Next', action: () => tour.next() },
        ],
        classes: step.classes,
        highlightClass: step.highlightClass,
        arrow: step.arrow,
        canClickTarget: step.canClickTarget,
      });
    }

    // Event handlers.
    tour.on('activate', () => {
      setIsActive(true);
    });

    tour.on('complete', () => {
      setIsActive(false);
      setCurrentStep(0);
      setCompleted(true);
      persistCompleted();
      onComplete?.();
    });

    tour.on('cancel', () => {
      setIsActive(false);
      setCurrentStep(0);
      setCompleted(true);
      persistCompleted();
      onDismiss?.();
    });

    tour.on('show', () => {
      const idx = tour.steps.findIndex(
        (s: { id: string }) => s.id === tour.getCurrentStep()?.id,
      );
      setCurrentStep(idx >= 0 ? idx : 0);
    });

    tourRef.current = tour;
    tour.start();
  }, [steps, onComplete, onDismiss, persistCompleted]);

  const nextStep = useCallback(() => {
    const tour = tourRef.current as { next?: () => void } | null;
    tour?.next?.();
  }, []);

  const prevStep = useCallback(() => {
    const tour = tourRef.current as { back?: () => void } | null;
    tour?.back?.();
  }, []);

  const completeTour = useCallback(() => {
    const tour = tourRef.current as { complete?: () => void } | null;
    tour?.complete?.();
  }, []);

  const dismissTour = useCallback(() => {
    const tour = tourRef.current as { cancel?: () => void } | null;
    tour?.cancel?.();
  }, []);

  return {
    isActive,
    currentStep,
    startTour,
    nextStep,
    prevStep,
    completeTour,
    dismissTour,
    isCompleted: completed,
  };
}

export default useTourManager;
