"use client"

import { Line, LineChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent } from "../ui/chart"

type ProgressChartProps = {
  data: Array<{
    date: string
    volume: number
    workouts: number
  }>
  title: string
  metric: "volume" | "workouts"
}

export default function ProgressChart({ data, title, metric }: ProgressChartProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#5a3714]/70 bg-[linear-gradient(135deg,#2f1808_0%,#1a0f06_100%)] p-2.5 shadow-[0_20px_60px_-20px_rgba(255,153,0,0.5)]">
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-[#ffb547]/10" />

      <div className="relative">
        <h3 className="mb-2.5 text-sm font-bold uppercase tracking-wide text-amber-50">{title}</h3>

        <ChartContainer
          config={{
            [metric]: {
              label: metric === "volume" ? "Volume (lbs)" : "Workouts",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[100px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#fbbf24", fontSize: 9 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#fbbf24", fontSize: 9 }} />
              <Tooltip
                content={<ChartTooltipContent />}
                contentStyle={{
                  backgroundColor: "#1a0f06",
                  border: "1px solid #5a3714",
                  borderRadius: "6px",
                  color: "#fbbf24",
                  fontSize: "11px",
                }}
              />
              <Line
                type="monotone"
                dataKey={metric}
                stroke="var(--color-volume)"
                strokeWidth={2}
                dot={(props: any) => {
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={2}
                      fill="#ff9900"
                      stroke="#ff9900"
                      strokeWidth={1}
                    />
                  )
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  )
}