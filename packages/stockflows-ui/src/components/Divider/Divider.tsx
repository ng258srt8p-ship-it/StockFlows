import React from 'react';
import './Divider.css';

export interface DividerProps {
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({ className }) => {
  return (
    <hr className={`sf-divider ${className || ''}`.trim()} />
  );
};

export default Divider;
