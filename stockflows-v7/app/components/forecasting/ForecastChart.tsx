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
        <h3 className="text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={mergedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
            tickFormatter={(v) => {
              const d = new Date(v);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
          />
          <YAxis tick={{ fill: "var(--text-secondary)" }} />
          <Tooltip
            labelFormatter={(v) => new Date(String(v)).toLocaleDateString()}
            formatter={(value: unknown, name: unknown) => [
              Math.round(Number(value)),
              String(name),
            ]}
            contentStyle={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}
          />
          <Legend wrapperStyle={{ color: "var(--text-secondary)" }} />

          {/* Confidence interval (shaded area) */}
          <Area
            type="monotone"
            dataKey="upper"
            stroke="none"
            fill="var(--accent-primary)"
            fillOpacity={0.07}
            name="Upper Bound"
            legendType="none"
          />
          <Area
            type="monotone"
            dataKey="lower"
            stroke="none"
            fill="var(--bg-primary)"
            name="Lower Bound"
            legendType="none"
          />

          {/* Forecast line */}
          <Area
            type="monotone"
            dataKey="predicted"
            stroke="var(--info)"
            strokeWidth={2}
            fill="var(--info)"
            fillOpacity={0.13}
            name="Forecast"
            dot={false}
          />

          {/* Actual data line */}
          {actual && actual.length > 0 && (
            <Area
              type="monotone"
              dataKey="actual"
              stroke="var(--success)"
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
              stroke="var(--text-tertiary)"
              strokeDasharray="5 5"
              label={{ value: "Forecast ->", position: "top", fontSize: 10, fill: "var(--text-secondary)" }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
