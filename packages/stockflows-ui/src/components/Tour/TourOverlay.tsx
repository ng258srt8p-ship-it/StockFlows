import React, { useEffect, useRef } from 'react';
import Shepherd from 'shepherd.js';
import { useTourContext } from './TourProvider';
import { TOUR_STEPS } from './TourSteps';

export const TourOverlay: React.FC = () => {
  const { isActive, currentStep, nextStep, prevStep, completeTour, dismissTour, setCurrentStep } =
    useTourContext();
  const tourRef = useRef<Shepherd.Tour | null>(null);

  useEffect(() => {
    if (!isActive) {
      tourRef.current?.cancel();
      tourRef.current = null;
      return;
    }

    const tour = new Shepherd.Tour({
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        classes: 'shepherd-theme-stockflows',
        scrollTo: { behavior: 'smooth', block: 'center' },
      },
      useModalOverlay: true,
      keyboardNavigation: false, // handled manually below
    });

    TOUR_STEPS.forEach((stepDef) => {
      tour.addStep({
        id: stepDef.id,
        title: stepDef.title,
        text: stepDef.text,
        attachTo: { element: stepDef.target, on: stepDef.position },
        buttons: [
          {
            text: 'Back',
            classes: 'secondary',
            action: () => {
              const current = tour.getCurrentStep();
              const idx = tour.steps.findIndex((s: Shepherd.Step) => s.id === current?.id);
              if (idx > 0) {
                setCurrentStep(idx - 1);
                tour.back();
              }
            },
          },
          {
            text: 'Next',
            action: () => {
              const current = tour.getCurrentStep();
              const idx = tour.steps.findIndex((s: Shepherd.Step) => s.id === current?.id);
              if (idx < tour.steps.length - 1) {
                setCurrentStep(idx + 1);
                tour.next();
              } else {
                completeTour();
                tour.complete();
              }
            },
          },
        ],
        when: {
          show: () => {
            const current = tour.getCurrentStep();
            const idx = tour.steps.findIndex((s: Shepherd.Step) => s.id === current?.id);
            if (idx >= 0) setCurrentStep(idx);
          },
        },
      });
    });

    tour.on('complete', () => {
      tourRef.current = null;
    });

    tour.on('cancel', () => {
      tourRef.current = null;
    });

    tourRef.current = tour;
    tour.start();

    return () => {
      tour.cancel();
      tourRef.current = null;
    };
  }, [isActive]);

  // Sync Shepherd with TourProvider state
  useEffect(() => {
    if (!tourRef.current || !isActive) return;
    const tour = tourRef.current;
    const stepId = TOUR_STEPS[currentStep]?.id;
    if (stepId && tour.getCurrentStep()?.id !== stepId) {
      tour.show(stepId);
    }
  }, [currentStep, isActive]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dismissTour();
      } else if (e.key === 'ArrowRight') {
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        prevStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, dismissTour, nextStep, prevStep]);

  return null; // Shepherd manages its own DOM
};
