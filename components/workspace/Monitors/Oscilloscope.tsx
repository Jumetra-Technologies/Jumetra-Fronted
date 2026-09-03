"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useSimulationStore } from "@/stores/simulation-store";

export function Oscilloscope() {
  const samples = useSimulationStore((s) => s.adcSamples);
  const data = samples.slice(-120).map((s) => ({
    t: Number(s.t),
    value: Number(s.value),
  }));

  return (
    <div className="flex h-full flex-col p-2 text-xs">
      <div className="mb-1 font-medium">Oscilloscope — ADC / Voltage waveforms</div>
      {data.length === 0 ? (
        <p className="text-zinc-500">Run simulation with analog sensors to capture waveforms.</p>
      ) : (
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
            <XAxis dataKey="t" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#059669" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
