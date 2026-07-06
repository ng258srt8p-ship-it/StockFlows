import React from 'react';
import './AbcLegend.css';

export interface AbcLegendProps {
  className?: string;
}

export const AbcLegend = ({ className = '' }: AbcLegendProps) => {
  const categories = [
    { class: 'A', label: 'A Items', color: 'var(--p-color-chart-1)', description: 'High value, daily review', count: 10 },
    { class: 'B', label: 'B Items', color: 'var(--p-color-chart-2)', description: 'Medium value, weekly review', count: 15 },
    { class: 'C', label: 'C Items', color: 'var(--p-color-chart-3)', description: 'Low value, monthly review', count: 50 },
  ];

  return (
    <div className={`sf-abc-legend ${className}`}>
      <h4 className="sf-abc-legend__title">ABC Classification</h4>
      <div className="sf-abc-legend__items">
        {categories.map((cat) => (
          <div key={cat.class} className="sf-abc-legend__item">
            <div 
              className="sf-abc-legend__swatch" 
              style={{ backgroundColor: cat.color }}
            />
            <div className="sf-abc-legend__info">
              <span className="sf-abc-legend__label">{cat.label}</span>
              <span className="sf-abc-legend__desc">{cat.description}</span>
            </div>
            <span className="sf-abc-legend__count">{cat.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AbcLegend;