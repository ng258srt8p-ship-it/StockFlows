import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  date: string;
  quantity: number;
  reorderPoint: number;
}

interface StockLevelChartProps {
  data: DataPoint[];
  height?: number;
}

export function StockLevelChart({ data, height = 300 }: StockLevelChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded"
        style={{ height, backgroundColor: "var(--bg-tertiary)" }}
      >
        <p style={{ color: "var(--text-tertiary)" }}>No stock data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
          tickFormatter={(v) => {
            const d = new Date(v);
            return `${d.getMonth() + 1}/${d.getDate()}`;
          }}
        />
        <YAxis tick={{ fill: "var(--text-secondary)" }} />
        <Tooltip
          labelFormatter={(v) => new Date(v).toLocaleDateString()}
          contentStyle={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}
        />
        <Legend wrapperStyle={{ color: "var(--text-secondary)" }} />
        <Line
          type="monotone"
          dataKey="quantity"
          stroke="var(--accent-primary)"
          strokeWidth={2}
          name="Stock Level"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="reorderPoint"
          stroke="var(--warning)"
          strokeDasharray="5 5"
          name="Reorder Point"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
