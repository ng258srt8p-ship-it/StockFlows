import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface ForecastPoint {
  date: string;
  yhat: number;
  lower: number;
  upper: number;
}

interface ActualPoint {
  date: string;
  qty: number;
}

interface ForecastChartProps {
  forecast: ForecastPoint[];
  actual?: ActualPoint[];
  height?: number;
  title?: string;
}

export function ForecastChart({
  forecast,
  actual,
  height = 350,
  title,
}: ForecastChartProps) {
  // Merge actual and forecast data by date
  const actualMap = new Map(actual?.map((a) => [a.date, a.qty]) || []);
  const mergedData = forecast.map((f) => ({
    date: f.date,
    predicted: f.yhat,
    lower: f.lower,
    upper: f.upper,
    actual: actualMap.get(f.date) ?? null,
  }));

  // Find where forecast starts (first date without actual data)
  const forecastStartIdx = mergedData.findIndex((d) => d.actual === null);

  return (
    <div>
      {title && (
        <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={mergedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => {
              const d = new Date(v);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
          />
          <YAxis />
          <Tooltip
            labelFormatter={(v) => new Date(String(v)).toLocaleDateString()}
            formatter={(value: unknown, name: unknown) => [
              Math.round(Number(value)),
              String(name),
            ]}
          />
          <Legend />

          {/* Confidence interval (shaded area) */}
          <Area
            type="monotone"
            dataKey="upper"
            stroke="none"
            fill="#0066cc11"
            name="Upper Bound"
            legendType="none"
          />
          <Area
            type="monotone"
            dataKey="lower"
            stroke="none"
            fill="white"
            name="Lower Bound"
            legendType="none"
          />

          {/* Forecast line */}
          <Area
            type="monotone"
            dataKey="predicted"
            stroke="#0066cc"
            strokeWidth={2}
            fill="#0066cc22"
            name="Forecast"
            dot={false}
          />

          {/* Actual data line */}
          {actual && actual.length > 0 && (
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#008060"
              strokeWidth={2}
              fill="none"
              name="Actual"
              dot={false}
            />
          )}

          {/* Forecast start marker */}
          {forecastStartIdx > 0 && (
            <ReferenceLine
              x={mergedData[forecastStartIdx]?.date}
              stroke="#999"
              strokeDasharray="5 5"
              label={{ value: "Forecast →", position: "top", fontSize: 10 }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
