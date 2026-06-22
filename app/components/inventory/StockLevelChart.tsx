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
        className="flex items-center justify-center bg-gray-50 rounded"
        style={{ height }}
      >
        <p className="text-gray-500">No stock data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          tickFormatter={(v) => {
            const d = new Date(v);
            return `${d.getMonth() + 1}/${d.getDate()}`;
          }}
        />
        <YAxis />
        <Tooltip
          labelFormatter={(v) => new Date(v).toLocaleDateString()}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="quantity"
          stroke="#0066cc"
          strokeWidth={2}
          name="Stock Level"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="reorderPoint"
          stroke="#ff6600"
          strokeDasharray="5 5"
          name="Reorder Point"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
