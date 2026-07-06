import React from 'react';
import { Card as PolarisCard } from '@shopify/polaris';
import { Forecast } from '../../types';
import { Badge } from '../Badge/Badge';
import { KpiCard } from '../KpiCard/KpiCard';
import './ForecastCard.css';

export interface ForecastCardProps {
  forecast: Forecast;
  onViewDetails?: (forecast: Forecast) => void;
}

export const ForecastCard = ({ forecast, onViewDetails, ...props }: ForecastCardProps) => {
  const accuracy = forecast.accuracy ?? 0;
  const predictedDemand = forecast.predictedDemand ?? forecast.predicted;
  const currentStock = forecast.currentStock ?? forecast.current;
  const daysOfStock = forecast.daysOfStock ?? '—';
  const reorderPoint = forecast.reorderPoint ?? 0;
  const safetyStock = forecast.safetyStock ?? 0;

  const statusColor = accuracy >= 80 ? 'success' : accuracy >= 60 ? 'warning' : 'critical';
  
  return (
    <div className="sf-forecast-card" {...props}>
      <PolarisCard padding="400">
        <div className="sf-forecast-card__header">
          <div className="sf-forecast-card__title-section">
            <h3 className="sf-forecast-card__title">{forecast.productName}</h3>
            <p className="sf-forecast-card__sku">{forecast.sku}</p>
          </div>
          <Badge variant={statusColor}>{`${accuracy}% accuracy`}</Badge>
        </div>
        
        <div className="sf-forecast-card__metrics">
          <div className="sf-forecast-card__metric">
            <span className="sf-forecast-card__metric-label">Predicted Demand</span>
            <span className="sf-forecast-card__metric-value">{predictedDemand.toLocaleString()}</span>
          </div>
          <div className="sf-forecast-card__metric">
            <span className="sf-forecast-card__metric-label">Current Stock</span>
            <span className="sf-forecast-card__metric-value">{currentStock.toLocaleString()}</span>
          </div>
          <div className="sf-forecast-card__metric">
            <span className="sf-forecast-card__metric-label">Days of Stock</span>
            <span className="sf-forecast-card__metric-value">{daysOfStock}</span>
          </div>
          <div className="sf-forecast-card__metric">
            <span className="sf-forecast-card__metric-label">Method</span>
            <span className="sf-forecast-card__metric-value">{forecast.method}</span>
          </div>
        </div>
        
        <div className="sf-forecast-card__actions">
          <KpiCard
            title="Reorder Point"
            value={reorderPoint.toLocaleString()}
            subtitle="Auto-calculated"
            icon={<span className="material-symbols-outlined">inventory_2</span>}
          />
          <KpiCard
            title="Safety Stock"
            value={safetyStock.toLocaleString()}
            subtitle="Buffer inventory"
            icon={<span className="material-symbols-outlined">shield</span>}
          />
        </div>
        
        {onViewDetails && (
          <button 
            className="sf-forecast-card__details-btn"
            onClick={() => onViewDetails(forecast)}
          >
            View Details →
          </button>
        )}
      </PolarisCard>
    </div>
  );
};

export default ForecastCard;