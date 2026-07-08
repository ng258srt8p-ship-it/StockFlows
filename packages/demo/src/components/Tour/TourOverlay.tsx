import React, { useEffect, useRef } from 'react';
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import './tour.css';
import { tourSteps } from './tourSteps';
import { useDemoStore } from '../../store/useStore';

interface TourOverlayProps {
  children: React.ReactNode;
}

export const TourOverlay: React.FC<TourOverlayProps> = ({ children }) => {
  const { tourActive, tourStep, nextTourStep, endTour, setActiveRoute } = useDemoStore();
  const tourRef = useRef<any>(null);

  useEffect(() => {
    if (!tourActive) {
      if (tourRef.current) {
        tourRef.current.complete();
        tourRef.current = null;
      }
      return;
    }

    const tour = new Shepherd.Tour({
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        classes: 'tour-dark',
        scrollTo: false,
        modalOverlayOpeningPadding: 8,
      },
      tourOptions: {
        useModalOverlay: true,
      },
    });

    tourRef.current = tour;

    tourSteps.forEach((step, i) => {
      const targetEl = document.querySelector(step.attachTo);

      tour.addStep({
        id: step.id,
        title: step.title,
        text: step.text,
        attachTo: targetEl ? { element: step.attachTo, on: 'bottom-start' } : undefined,
        buttons: [
          ...(i > 0
            ? [
                {
                  text: 'Back',
                  action: tour.back,
                  classes: 'shepherd-button-secondary',
                },
              ]
            : []),
          {
            text: i === tourSteps.length - 1 ? 'Done' : 'Next',
            action: i === tourSteps.length - 1 ? () => { endTour(); tour.complete(); } : () => {
              if (step.route) setActiveRoute(step.route);
              tour.next();
            },
            classes: 'shepherd-button-primary',
          },
        ],
        classes: 'tour-dark',
        canClickTarget: false,
      });
    });

    tour.start();

    return () => {
      if (tourRef.current) {
        tourRef.current.complete();
        tourRef.current = null;
      }
    };
  }, [tourActive]);

  return <>{children}</>;
};
