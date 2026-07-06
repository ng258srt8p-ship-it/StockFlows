import React from 'react';
import './TourStep.css';
import { useTourContext } from '../Tour/TourProvider';

export type TourStepPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TourStepProps {
  stepId: string;
  title: string;
  content: string;
  position?: TourStepPosition;
}

/**
 * A simple wrapper component for a Shepherd.js tour step.
 * Renders a tooltip-like element that can be anchored to a target.
 * For the full guided tour, use TourProvider + TourOverlay instead.
 */
export const TourStep: React.FC<TourStepProps> = ({
  stepId,
  title,
  content,
  position = 'bottom',
}) => {
  const { isActive, currentStep } = useTourContext();
  // This component is a lightweight anchor — the actual Shepherd
  // overlay is managed by TourOverlay. It simply renders the
  // step content for static previews or non-overlay use cases.
  return (
    <div className={`sf-tour-step sf-tour-step--${position}`} data-tour-step={stepId}>
      <div className="sf-tour-step__title">{title}</div>
      <div className="sf-tour-step__content">{content}</div>
    </div>
  );
};

export default TourStep;
