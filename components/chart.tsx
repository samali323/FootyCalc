"use client"
import {
  AreaChart as RechartsAreaChart,
  BarChart as RechartsBarChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface ChartProps {
  type: "area" | "bar"
  data: { name: string; value: number }[]
  color?: string
}

export function Chart({ type, data, color = "emerald" }: ChartProps) {
  const colorMap = {
    emerald: {
      gradient: ["rgba(16, 185, 129, 0.2)", "rgba(16, 185, 129, 0)"],
      stroke: "#10b981",
      fill: "#10b981",
    },
    blue: {
      gradient: ["rgba(59, 130, 246, 0.2)", "rgba(59, 130, 246, 0)"],
      stroke: "#3b82f6",
      fill: "#3b82f6",
    },
    purple: {
      gradient: ["rgba(139, 92, 246, 0.2)", "rgba(139, 92, 246, 0)"],
      stroke: "#8b5cf6",
      fill: "#8b5cf6",
    },
    amber: {
      gradient: ["rgba(245, 158, 11, 0.2)", "rgba(245, 158, 11, 0)"],
      stroke: "#f59e0b",
      fill: "#f59e0b",
    },
    red: {
      gradient: ["rgba(239, 68, 68, 0.2)", "rgba(239, 68, 68, 0)"],
      stroke: "#ef4444",
      fill: "#ef4444",
    },
    green: {
      gradient: ["rgba(34, 197, 94, 0.2)", "rgba(34, 197, 94, 0)"],
      stroke: "#22c55e",
      fill: "#22c55e",
    },
  }

  const colors = colorMap[color as keyof typeof colorMap] || colorMap.emerald

  if (type === "area") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`colorValue-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.gradient[0]} stopOpacity={0.8} />
              <stop offset="95%" stopColor={colors.gradient[1]} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="name"
            tick={{ fill: "#94a3b8" }}
            axisLine={{ stroke: "#334155" }}
            tickLine={{ stroke: "#334155" }}
          />
          <YAxis
            tick={{ fill: "#94a3b8" }}
            axisLine={{ stroke: "#334155" }}
            tickLine={{ stroke: "#334155" }}
            tickFormatter={(value) => `${value.toLocaleString()}`}
          />
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              borderColor: "#475569",
              color: "#f8fafc",
              borderRadius: "0.375rem",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            }}
            itemStyle={{ color: "#f8fafc" }}
            formatter={(value: number) => [`${value.toLocaleString()} tonnes`, "Emissions"]}
            labelStyle={{ color: "#94a3b8" }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={colors.stroke}
            fillOpacity={1}
            fill={`url(#colorValue-${color})`}
            strokeWidth={3}
            activeDot={{ r: 8, strokeWidth: 0, fill: colors.stroke }}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="name"
          tick={{ fill: "#94a3b8" }}
          axisLine={{ stroke: "#334155" }}
          tickLine={{ stroke: "#334155" }}
        />
        <YAxis
          tick={{ fill: "#94a3b8" }}
          axisLine={{ stroke: "#334155" }}
          tickLine={{ stroke: "#334155" }}
          tickFormatter={(value) => `${value.toLocaleString()}`}
        />
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b",
            borderColor: "#475569",
            color: "#f8fafc",
            borderRadius: "0.375rem",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          }}
          itemStyle={{ color: "#f8fafc" }}
          formatter={(value: number) => [`${value.toLocaleString()} tonnes`, "Emissions"]}
          labelStyle={{ color: "#94a3b8" }}
        />
        <Bar dataKey="value" fill={colors.fill} radius={[4, 4, 0, 0]} barSize={30} />
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}
