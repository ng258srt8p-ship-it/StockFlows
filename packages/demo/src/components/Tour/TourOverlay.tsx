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
  const { tourActive, endTour, setActiveRoute } = useDemoStore();
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
      useModalOverlay: true,
    });

    tourRef.current = tour;

    tourSteps.forEach((step, i) => {
      const isLast = i === tourSteps.length - 1;

      tour.addStep({
        id: step.id,
        title: step.title,
        text: step.text,
        attachTo: { element: step.attachTo, on: 'bottom-start' },
        beforeShowPromise: () => {
          return new Promise<void>((resolve) => {
            if (step.route) {
              setActiveRoute(step.route);
            }
            setTimeout(resolve, 200);
          });
        },
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
            text: isLast ? 'Done' : 'Next',
            action: isLast
              ? () => {
                  endTour();
                  tour.complete();
                }
              : tour.next,
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
