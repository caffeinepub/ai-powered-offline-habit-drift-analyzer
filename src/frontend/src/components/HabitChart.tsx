import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { type ForecastPoint, formatDate } from "../lib/analytics";

interface HabitChartProps {
  historicalSeries: ForecastPoint[];
  forecastedSeries: ForecastPoint[];
  unit: string;
  color: string;
}

interface ChartDataPoint {
  date: string;
  historical?: number;
  forecast?: number;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { color: string; name: string; value?: number }[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-border/50 rounded-sm px-3 py-2 text-xs shadow-lg">
        <p className="text-muted-foreground mb-1">{label}</p>
        {payload.map((p) => (
          <p
            key={p.name}
            style={{ color: p.color }}
            className="font-mono font-semibold"
          >
            {p.name}: {p.value?.toFixed(1)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function HabitChart({
  historicalSeries,
  forecastedSeries,
  unit,
  color,
}: HabitChartProps) {
  const data: ChartDataPoint[] = [];

  for (const p of historicalSeries) {
    data.push({ date: formatDate(p.date), historical: p.value });
  }

  if (forecastedSeries.length > 0 && historicalSeries.length > 0) {
    const lastHistorical = historicalSeries[historicalSeries.length - 1];
    data.push({
      date: formatDate(lastHistorical.date),
      historical: lastHistorical.value,
      forecast: lastHistorical.value,
    });
    for (const p of forecastedSeries) {
      data.push({ date: formatDate(p.date), forecast: p.value });
    }
  }

  if (data.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-xs text-muted-foreground">
        No data to display
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={140}>
      <LineChart
        data={data}
        margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.05)"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }}
          tickLine={false}
          axisLine={false}
          width={30}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="historical"
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3, fill: color }}
          name={`Actual (${unit})`}
          connectNulls={false}
        />
        <Line
          type="monotone"
          dataKey="forecast"
          stroke={color}
          strokeWidth={1.5}
          strokeDasharray="4 3"
          dot={false}
          activeDot={{ r: 3, fill: color }}
          name={`Forecast (${unit})`}
          connectNulls={false}
          opacity={0.6}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
