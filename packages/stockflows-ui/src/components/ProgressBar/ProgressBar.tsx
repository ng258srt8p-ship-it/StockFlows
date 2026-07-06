import React from 'react';
import './ProgressBar.css';

export interface ProgressBarProps {
  value: number;
  label?: string;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  color,
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className="sf-progress-bar">
      {label && (
        <div className="sf-progress-bar__label">
          {label}
          <span className="sf-progress-bar__value">{clampedValue}%</span>
        </div>
      )}
      <div className="sf-progress-bar__track">
        <div
          className="sf-progress-bar__fill"
          style={{
            width: `${clampedValue}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
