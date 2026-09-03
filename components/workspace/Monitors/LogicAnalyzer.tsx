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

export function LogicAnalyzer() {
  const samples = useSimulationStore((s) => s.gpioSamples);
  const data = samples.slice(-80).map((s) => ({
    t: Number(s.t),
    value: Number(s.value),
    node: String(s.node_id),
  }));

  return (
    <div className="flex h-full flex-col p-2 text-xs">
      <div className="mb-1 font-medium">Logic Analyzer — GPIO / PWM / digital timeline</div>
      {data.length === 0 ? (
        <p className="text-zinc-500">Run simulation to capture digital transitions.</p>
      ) : (
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
            <XAxis dataKey="t" tick={{ fontSize: 10 }} />
            <YAxis domain={[0, 1]} tick={{ fontSize: 10 }} />
            <Tooltip />
            <Line type="stepAfter" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
