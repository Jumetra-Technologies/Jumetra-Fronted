"use client";

import type { ReactElement } from "react";

/**
 * Flat, recognizable component illustrations (Wokwi-style) for the circuit
 * visualizer. Each icon is a self-contained 64x64 SVG so it can be dropped
 * straight into a ReactFlow node without extra assets/network requests.
 */

type IconProps = { active?: boolean; className?: string };

function Pins({ count, y, color = "#c4c4c4" }: { count: number; y: number; color?: string }) {
  const gap = 56 / (count - 1);
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <rect key={i} x={4 + i * gap - 1.2} y={y} width={2.4} height={7} fill={color} rx={0.5} />
      ))}
    </>
  );
}

export function Esp32Icon({ active, className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className}>
      <rect x="6" y="10" width="52" height="44" rx="3" fill="#1c1c1c" stroke="#000" strokeWidth="0.5" />
      <rect x="6" y="10" width="52" height="44" rx="3" fill="url(#esp32grad)" />
      <defs>
        <linearGradient id="esp32grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2b2b2b" />
          <stop offset="100%" stopColor="#101010" />
        </linearGradient>
      </defs>
      <rect x="16" y="16" width="32" height="20" rx="1.5" fill="#3a3a3a" stroke="#555" strokeWidth="0.5" />
      <rect x="19" y="19" width="26" height="14" rx="1" fill="#0f0f0f" />
      <rect x="10" y="4" width="14" height="8" rx="1" fill="#8a8a8a" />
      <Pins count={13} y={4} />
      <Pins count={13} y={53} />
      <circle cx="52" cy="44" r={active ? 2.6 : 2} fill={active ? "#f97316" : "#7c2d12"}>
        {active ? (
          <animate attributeName="opacity" values="1;0.35;1" dur="1s" repeatCount="indefinite" />
        ) : null}
      </circle>
      <circle cx="52" cy="44" r="2" fill="#dc2626" opacity={active ? 0 : 1} />
    </svg>
  );
}

export function ArduinoUnoIcon({ active, className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className}>
      <rect x="4" y="8" width="56" height="48" rx="3" fill="#0f8b8d" />
      <rect x="4" y="8" width="56" height="48" rx="3" fill="url(#unoGrad)" />
      <defs>
        <linearGradient id="unoGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#12a1a3" />
          <stop offset="100%" stopColor="#0a6d6f" />
        </linearGradient>
      </defs>
      <rect x="10" y="14" width="16" height="12" rx="1" fill="#1a1a1a" />
      <rect x="30" y="14" width="10" height="10" rx="1" fill="#c9a227" />
      <circle cx="49" cy="19" r="6" fill="#d0d0d0" />
      <circle cx="49" cy="19" r="4" fill="#e8e8e8" />
      <Pins count={8} y={6} color="#111" />
      <Pins count={10} y={51} color="#111" />
      <rect x="10" y="34" width="20" height="6" rx="1" fill="#111" />
      <circle cx="49" cy="44" r={active ? 2.6 : 2} fill={active ? "#22c55e" : "#14532d"}>
        {active ? (
          <animate attributeName="opacity" values="1;0.35;1" dur="1s" repeatCount="indefinite" />
        ) : null}
      </circle>
    </svg>
  );
}

export function Stm32Icon({ active, className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className}>
      <rect x="6" y="10" width="52" height="44" rx="3" fill="#0f2744" />
      <rect x="6" y="10" width="52" height="44" rx="3" fill="url(#stmGrad)" />
      <defs>
        <linearGradient id="stmGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e3a5f" />
          <stop offset="100%" stopColor="#0a1a2f" />
        </linearGradient>
      </defs>
      <rect x="18" y="18" width="28" height="18" rx="1" fill="#0e1f38" stroke="#3b82f6" strokeWidth="0.6" />
      <text x="32" y="30" fontSize="6" fill="#60a5fa" textAnchor="middle" fontFamily="ui-monospace, monospace">
        STM32
      </text>
      <Pins count={12} y={4} color="#93c5fd" />
      <Pins count={12} y={53} color="#93c5fd" />
      <circle cx="50" cy="44" r={active ? 2.6 : 2} fill={active ? "#3b82f6" : "#1e3a5f"}>
        {active ? (
          <animate attributeName="opacity" values="1;0.35;1" dur="1s" repeatCount="indefinite" />
        ) : null}
      </circle>
    </svg>
  );
}

export function DhtIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className}>
      <rect x="14" y="6" width="36" height="26" rx="3" fill="#2563eb" />
      <rect x="18" y="10" width="28" height="16" rx="2" fill="#1e40af" />
      {Array.from({ length: 5 }).map((_, i) => (
        <rect key={i} x={21 + i * 5} y="13" width="2.4" height="10" fill="#3b82f6" rx="0.5" />
      ))}
      <rect x="27" y="32" width="10" height="16" fill="#d4d4d8" />
      <rect x="20" y="46" width="2.4" height="12" fill="#a1a1aa" />
      <rect x="31" y="46" width="2.4" height="12" fill="#a1a1aa" />
      <rect x="42" y="46" width="2.4" height="12" fill="#a1a1aa" />
    </svg>
  );
}

export function UltrasonicIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className}>
      <rect x="6" y="20" width="52" height="20" rx="2" fill="#0f9d58" />
      <rect x="6" y="20" width="52" height="20" rx="2" fill="url(#hcGrad)" />
      <defs>
        <linearGradient id="hcGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
      </defs>
      <circle cx="22" cy="30" r="9" fill="#c0c0c0" stroke="#8a8a8a" />
      <circle cx="22" cy="30" r="6" fill="#8a8a8a" />
      <circle cx="42" cy="30" r="9" fill="#c0c0c0" stroke="#8a8a8a" />
      <circle cx="42" cy="30" r="6" fill="#8a8a8a" />
      <Pins count={4} y={40} color="#333" />
    </svg>
  );
}

export function PirIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className}>
      <rect x="14" y="26" width="36" height="20" rx="2" fill="#1a1a1a" />
      <path d="M14 26 Q32 6 50 26 Z" fill="#f4f4f5" opacity="0.9" />
      <circle cx="32" cy="20" r="10" fill="#e4e4e7" opacity="0.85" />
      <Pins count={3} y={46} color="#a1a1aa" />
    </svg>
  );
}

export function SoilMoistureIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className}>
      <rect x="18" y="4" width="28" height="16" rx="2" fill="#166534" />
      <rect x="21" y="7" width="22" height="10" rx="1" fill="#22c55e" opacity="0.5" />
      <rect x="24" y="20" width="4" height="36" fill="#71717a" />
      <rect x="36" y="20" width="4" height="36" fill="#71717a" />
      <Pins count={3} y={2} color="#a1a1aa" />
    </svg>
  );
}

export function LedIcon({ active, className }: IconProps) {
  const color = active ? "#ef4444" : "#7f1d1d";
  return (
    <svg viewBox="0 0 64 64" className={className}>
      {active ? <circle cx="32" cy="22" r="20" fill={color} opacity="0.25" /> : null}
      <path d="M20 30 a12 12 0 1 1 24 0 v10 h-24 z" fill={color} />
      <path d="M20 30 a12 12 0 1 1 24 0 v10 h-24 z" fill="url(#ledShine)" opacity="0.5" />
      <defs>
        <radialGradient id="ledShine" cx="35%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="24" y="40" width="2.4" height="18" fill="#c4c4c4" />
      <rect x="38" y="40" width="2.4" height="14" fill="#c4c4c4" />
    </svg>
  );
}

export function RelayIcon({ active, className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className}>
      <rect x="6" y="10" width="52" height="40" rx="2" fill="#1d4ed8" />
      <rect x="30" y="16" width="22" height="20" rx="2" fill="#18181b" />
      <rect x="34" y="20" width="14" height="4" fill={active ? "#22c55e" : "#3f3f46"} />
      <circle cx="41" cy="30" r={active ? 2.4 : 1.8} fill={active ? "#22c55e" : "#52525b"}>
        {active ? (
          <animate attributeName="opacity" values="1;0.4;1" dur="0.8s" repeatCount="indefinite" />
        ) : null}
      </circle>
      <Pins count={3} y={4} color="#e4e4e7" />
      <Pins count={3} y={50} color="#e4e4e7" />
    </svg>
  );
}

export function ServoIcon({ active, className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className}>
      <rect x="16" y="18" width="32" height="34" rx="2" fill="#2563eb" />
      <rect x="16" y="18" width="32" height="10" rx="2" fill="#f4f4f5" />
      <circle cx="32" cy="14" r="7" fill="#e4e4e7" stroke="#a1a1aa" />
      <g style={active ? { transformOrigin: "32px 14px", animation: "servoSweep 1.2s ease-in-out infinite" } : undefined}>
        <rect x="31" y="2" width="2" height="12" fill="#f97316" />
      </g>
      <style>{`@keyframes servoSweep { 0%,100% { transform: rotate(-25deg);} 50% { transform: rotate(25deg);} }`}</style>
      <Pins count={3} y={52} color="#e4e4e7" />
    </svg>
  );
}

export function GenericChipIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className}>
      <rect x="14" y="14" width="36" height="36" rx="2" fill="#3f3f46" />
      <rect x="20" y="20" width="24" height="24" rx="1" fill="#18181b" />
      <Pins count={6} y={8} color="#a1a1aa" />
      <Pins count={6} y={51} color="#a1a1aa" />
    </svg>
  );
}

const ICONS: Record<string, (p: IconProps) => ReactElement> = {
  esp32: Esp32Icon,
  "esp32-s3": Esp32Icon,
  "esp32-c3": Esp32Icon,
  "arduino-uno": ArduinoUnoIcon,
  "arduino-mega": ArduinoUnoIcon,
  "arduino-nano": ArduinoUnoIcon,
  stm32: Stm32Icon,
  dht11: DhtIcon,
  dht22: DhtIcon,
  "hc-sr04": UltrasonicIcon,
  pir: PirIcon,
  "soil-moisture": SoilMoistureIcon,
  led: LedIcon,
  relay: RelayIcon,
  servo: ServoIcon,
};

/** Resolve the best-fit hardware illustration for a given component id. */
export function HardwareIcon({
  componentId,
  active,
  className,
}: {
  componentId: string;
  active?: boolean;
  className?: string;
}) {
  const Icon = ICONS[componentId] || GenericChipIcon;
  return <Icon active={active} className={className} />;
}