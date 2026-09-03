"use client";

import type { HardwareAsset, ZoomDetail } from "@/lib/hardware/types";
import type { WorkspaceNode } from "@/lib/workspace-types";
import { resolvePinSignalState } from "@/lib/hardware/registry";

type Props = {
  asset: HardwareAsset;
  node: WorkspaceNode;
  zoomDetail: ZoomDetail;
  hoveredPin?: string | null;
  selectedPin?: string | null;
  connectedPins?: Set<string>;
};

function isActive(state: Record<string, unknown>, key?: string, pinRef?: string): boolean {
  if (key && state[key]) return Boolean(state[key]);
  if (pinRef) {
    const v = resolvePinSignalState(state, pinRef);
    return v === true || v === 1 || v === "HIGH" || (typeof v === "number" && v > 0);
  }
  return false;
}

function BoardSvg({ componentId, state, zoomDetail }: { componentId: string; state: Record<string, unknown>; zoomDetail: ZoomDetail }) {
  const ledOn = isActive(state, "on") || isActive(state, "led_on") || isActive(state, undefined, "A");
  const relayOn = isActive(state, "active") || isActive(state, "closed");
  const servoAngle = Number(state.angle_deg ?? state.angle ?? 90);
  const temp = state.temperature_c ?? state.temp;
  const displayText = String(state.display_text ?? temp ?? "");
  const motion = isActive(state, "motion");
  const pressed = isActive(state, "pressed");
  const showLabels = zoomDetail !== "outline";
  const showSilk = zoomDetail === "silkscreen";

  switch (componentId) {
    case "esp32":
      return (
        <g>
          <rect x="4" y="4" width="292" height="142" rx="8" fill="#1E293B" stroke="#334155" strokeWidth="2" />
          <rect x="20" y="20" width="80" height="50" rx="4" fill="#374151" stroke="#4B5563" />
          <text x="60" y="50" textAnchor="middle" fill="#94A3B8" fontSize={showSilk ? 9 : 7} fontFamily="monospace">ESP32</text>
          <rect x="120" y="30" width="160" height="90" rx="4" fill="#111827" stroke="#374151" />
          {showLabels && (
            <text x="200" y="55" textAnchor="middle" fill="#64748B" fontSize={8}>DevKit V1</text>
          )}
          <circle cx="260" cy="24" r={5} fill={isActive(state, "power_on", undefined) ? "#22C55E" : "#374151"} className="power-led" />
          <circle cx="275" cy="24" r={5} fill={isActive(state, "wifi_connected") ? "#3B82F6" : "#374151"} className="wifi-led" />
          <rect x="30" y="100" width="240" height="8" rx="2" fill="#374151" />
          {showSilk && <text x="150" y="130" textAnchor="middle" fill="#475569" fontSize={7}>USB · EN · BOOT</text>}
        </g>
      );
    case "arduino-uno":
      return (
        <g>
          <rect x="4" y="4" width="272" height="192" rx="6" fill="#00789D" stroke="#005A75" strokeWidth="2" />
          <rect x="200" y="20" width="60" height="30" rx="3" fill="#C0C0C0" stroke="#888" />
          <rect x="30" y="40" width="160" height="100" rx="4" fill="#1F2937" stroke="#374151" />
          <text x="110" y="95" textAnchor="middle" fill="#9CA3AF" fontSize={showSilk ? 11 : 9} fontWeight="bold">UNO R3</text>
          <circle cx="250" cy="70" r={6} fill={ledOn ? "#FBBF24" : "#374151"} className="onboard-led" />
          {showLabels && <text x="250" y="90" textAnchor="middle" fill="#E2E8F0" fontSize={7}>L</text>}
        </g>
      );
    case "stm32":
      return (
        <g>
          <rect x="4" y="4" width="212" height="112" rx="4" fill="#2563EB" stroke="#1D4ED8" strokeWidth="2" />
          <rect x="80" y="30" width="60" height="50" rx="2" fill="#1E293B" stroke="#334155" />
          <text x="110" y="60" textAnchor="middle" fill="#93C5FD" fontSize={showLabels ? 8 : 6}>STM32F103</text>
          {showSilk && <text x="110" y="95" textAnchor="middle" fill="#BFDBFE" fontSize={7}>Blue Pill</text>}
          <circle cx="190" cy="20" r={4} fill={isActive(state, "power_on") ? "#EF4444" : "#374151"} />
        </g>
      );
    case "raspberry-pi-pico":
      return (
        <g>
          <rect x="4" y="4" width="252" height="102" rx="6" fill="#059669" stroke="#047857" strokeWidth="2" />
          <rect x="90" y="25" width="72" height="52" rx="3" fill="#1F2937" />
          <text x="126" y="55" textAnchor="middle" fill="#6EE7B7" fontSize={showLabels ? 9 : 7}>RP2040</text>
          {showSilk && <text x="126" y="88" textAnchor="middle" fill="#A7F3D0" fontSize={7}>Raspberry Pi Pico</text>}
        </g>
      );
    case "breadboard":
      return (
        <g>
          <rect x="4" y="4" width="392" height="272" rx="4" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
          <rect x="12" y="12" width="376" height="16" rx="2" fill="#EF4444" opacity={0.7} />
          <rect x="12" y="252" width="376" height="16" rx="2" fill="#2563EB" opacity={0.7} />
          {Array.from({ length: 10 }).map((_, row) =>
            Array.from({ length: 30 }).map((__, col) => (
              <circle
                key={`${row}-${col}`}
                cx={24 + col * 12}
                cy={40 + row * 20}
                r={showSilk ? 2.5 : 1.5}
                fill="#94A3B8"
              />
            )),
          )}
          {showLabels && (
            <text x="200" y="140" textAnchor="middle" fill="#64748B" fontSize={10}>830-Point Breadboard</text>
          )}
        </g>
      );
    case "led":
    case "rgb-led": {
      const pwm = Number(state.pwm ?? (ledOn ? 1 : 0));
      const brightness = Math.max(0, Math.min(1, Number(state.brightness ?? 0) / 255 || pwm));
      const glowing = ledOn || brightness > 0.05;
      return (
        <g>
          <rect x="20" y="50" width="20" height="24" rx="2" fill="#94A3B8" />
          <ellipse
            cx="30"
            cy="35"
            rx="14"
            ry="18"
            fill={glowing ? `rgba(251, 191, 36, ${0.4 + brightness * 0.6})` : "#FCA5A5"}
            stroke="#EF4444"
            strokeWidth="2"
            className="led-body"
            opacity={glowing ? 0.7 + brightness * 0.3 : 0.6}
            data-signal={glowing ? "HIGH" : "LOW"}
          />
          {glowing && (
            <ellipse cx="30" cy="35" rx={18 + brightness * 10} ry={22 + brightness * 10} fill="#FBBF24" opacity={0.15 + brightness * 0.25} />
          )}
        </g>
      );
    }
    case "relay":
      return (
        <g>
          <rect x="8" y="8" width="64" height="84" rx="4" fill="#1E293B" stroke="#475569" strokeWidth="2" />
          <rect x="16" y="20" width="48" height="30" rx="2" fill="#374151" />
          <line x1="24" y1={relayOn ? 35 : 45} x2="56" y2={relayOn ? 45 : 35} stroke="#F59E0B" strokeWidth="3" className="relay-arm" />
          {showLabels && (
            <text x="40" y="70" textAnchor="middle" fill={relayOn ? "#22C55E" : "#94A3B8"} fontSize={7}>
              {relayOn ? "ON" : "OFF"}
            </text>
          )}
        </g>
      );
    case "servo":
      return (
        <g>
          <rect x="10" y="30" width="70" height="50" rx="4" fill="#374151" stroke="#64748B" strokeWidth="2" />
          <g transform={`rotate(${servoAngle - 90} 45 45)`} className="servo-arm">
            <rect x="42" y="20" width="6" height="30" rx="2" fill="#EF4444" />
          </g>
          <circle cx="45" cy="45" r="8" fill="#1F2937" stroke="#64748B" />
          {showLabels && (
            <text x="45" y="95" textAnchor="middle" fill="#64748B" fontSize={7}>
              {servoAngle}°
            </text>
          )}
        </g>
      );
    case "dc-motor":
    case "stepper-motor":
    case "stepper": {
      const rotating = Boolean(state.rotating) || Number(state.speed ?? 0) > 0.05;
      const rpm = Number(state.rpm ?? 0);
      return (
        <g>
          <circle cx="40" cy="40" r="28" fill="#1E293B" stroke="#475569" strokeWidth="2" />
          <g className="motor-rotor">
            {rotating ? (
              <animateTransform attributeName="transform" type="rotate" from="0 40 40" to="360 40 40" dur="1s" repeatCount="indefinite" />
            ) : null}
            <rect x="36" y="18" width="8" height="44" rx="2" fill={rotating ? "#38BDF8" : "#64748B"} />
            <rect x="18" y="36" width="44" height="8" rx="2" fill={rotating ? "#38BDF8" : "#64748B"} />
          </g>
          <circle cx="40" cy="40" r="8" fill="#0F172A" />
          {showLabels && (
            <text x="40" y="82" textAnchor="middle" fill="#94A3B8" fontSize={7}>
              {rpm ? `${rpm} rpm` : "MOTOR"}
            </text>
          )}
        </g>
      );
    }
    case "hc-sr04":
      return (
        <g>
          <rect x="4" y="10" width="112" height="50" rx="4" fill="#1E293B" stroke="#475569" strokeWidth="2" />
          <circle cx="35" cy="35" r="14" fill="#64748B" className="transducer" />
          <circle cx="85" cy="35" r="14" fill="#64748B" className="transducer" />
          {showLabels && <text x="60" y="38" textAnchor="middle" fill="#94A3B8" fontSize={7}>HC-SR04</text>}
        </g>
      );
    case "pir":
      return (
        <g>
          <rect x="15" y="40" width="50" height="40" rx="3" fill="#1E293B" stroke="#475569" />
          <ellipse cx="40" cy="30" rx="22" ry="18" fill={motion ? "#FBBF24" : "#E2E8F0"} className="dome" opacity={motion ? 1 : 0.7} />
        </g>
      );
    case "dht11":
    case "dht22":
    case "am2302":
    case "ds18b20":
      return (
        <g>
          <rect x="15" y="20" width="40" height="55" rx="4" fill="#2563EB" stroke="#1D4ED8" strokeWidth="2" />
          <rect x="20" y="30" width="30" height="16" rx="2" fill="#0F172A" />
          <text x="35" y="42" textAnchor="middle" fill="#22D3EE" fontSize={showSilk ? 7 : 5} className="readout">
            {displayText ? `${displayText}°C` : componentId.toUpperCase()}
          </text>
        </g>
      );
    case "lcd":
    case "lcd-16x2":
      return (
        <g>
          <rect x="4" y="8" width="152" height="64" rx="3" fill="#1E293B" stroke="#475569" strokeWidth="2" />
          <rect x="12" y="16" width="136" height="40" rx="2" fill="#065F46" className="lcd-screen" />
          <text x="80" y="38" textAnchor="middle" fill="#6EE7B7" fontSize={showSilk ? 8 : 6}>
            {displayText || "LCD 16x2"}
          </text>
        </g>
      );
    case "oled":
    case "oled-ssd1306":
      return (
        <g>
          <rect x="4" y="8" width="112" height="54" rx="3" fill="#0F172A" stroke="#334155" strokeWidth="2" />
          <rect x="10" y="14" width="100" height="36" rx="1" fill="#000" className="oled-screen" />
          <text x="60" y="36" textAnchor="middle" fill="#22D3EE" fontSize={showSilk ? 7 : 5}>
            {displayText || "OLED"}
          </text>
        </g>
      );
    case "push-button":
      return (
        <g>
          <rect x="10" y="20" width="40" height="35" rx="3" fill="#374151" />
          <circle cx="30" cy={pressed ? 32 : 28} r="12" fill={pressed ? "#94A3B8" : "#EF4444"} className="button-cap" />
        </g>
      );
    case "potentiometer":
      return (
        <g>
          <rect x="15" y="35" width="40" height="30" rx="2" fill="#374151" />
          <g transform={`rotate(${((Number(state.value ?? 512) / 1023) * 270) - 135} 35 50)`} className="knob">
            <circle cx="35" cy="50" r="14" fill="#64748B" stroke="#94A3B8" />
            <rect x="33" y="38" width="4" height="10" fill="#F8FAFC" />
          </g>
        </g>
      );
    case "buzzer":
      return (
        <g>
          <circle cx="30" cy="35" r="18" fill="#374151" stroke="#64748B" strokeWidth="2" className="buzzer-body" />
          <circle cx="30" cy="35" r="8" fill={isActive(state, "active") ? "#F59E0B" : "#1F2937"} />
        </g>
      );
    case "resistor":
      return (
        <g>
          <line x1="4" y1="15" x2="20" y2="15" stroke="#94A3B8" strokeWidth="2" />
          <rect x="20" y="8" width="40" height="14" rx="3" fill="#FDE68A" stroke="#D97706" strokeWidth="1" />
          <line x1="60" y1="15" x2="76" y2="15" stroke="#94A3B8" strokeWidth="2" />
          {showSilk && <text x="40" y="26" textAnchor="middle" fill="#92400E" fontSize={6}>1K</text>}
        </g>
      );
    case "capacitor":
      return (
        <g>
          <line x1="25" y1="10" x2="25" y2="50" stroke="#94A3B8" strokeWidth="2" />
          <rect x="15" y="18" width="20" height="24" rx="10" fill="#1E40AF" stroke="#3B82F6" />
          <line x1="25" y1="50" x2="25" y2="58" stroke="#94A3B8" strokeWidth="2" />
        </g>
      );
    case "jumper-wire":
      return (
        <g>
          <path d="M 6 20 Q 20 4 34 20" fill="none" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    default:
      return (
        <g>
          <rect x="4" y="4" width="132" height="72" rx="6" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="2" />
          <text x="70" y="44" textAnchor="middle" fill="#64748B" fontSize={9}>{componentId}</text>
        </g>
      );
  }
}

export function ComponentSvg({
  asset,
  node,
  zoomDetail,
  hoveredPin,
  selectedPin,
  connectedPins,
}: Props) {
  const { metadata } = asset;
  const physical = node.device_mode === "physical";
  const healthOk = node.available;

  return (
    <svg
      width={metadata.width}
      height={metadata.height}
      viewBox={`0 0 ${metadata.width} ${metadata.height}`}
      className="overflow-visible"
      role="img"
      aria-label={metadata.name}
    >
      <BoardSvg componentId={metadata.id} state={node.live_state || {}} zoomDetail={zoomDetail} />

      {physical && showSilk(zoomDetail) && (
        <g>
          <rect x={4} y={metadata.height - 18} width={metadata.width - 8} height={14} rx={3} fill="#EFF6FF" stroke="#BFDBFE" />
          <text x={8} y={metadata.height - 7} fill="#2563EB" fontSize={7} fontFamily="monospace">
            {healthOk ? "● PHYSICAL" : "○ OFFLINE"}
            {node.live_state?.firmware_version ? ` · ${String(node.live_state.firmware_version)}` : ""}
            {node.live_state?.voltage_v ? ` · ${String(node.live_state.voltage_v)}V` : ""}
          </text>
        </g>
      )}

      {asset.pins.map((p) => {
        const cx = p.x * metadata.width;
        const cy = p.y * metadata.height;
        const hovered = hoveredPin === p.id;
        const selected = selectedPin === p.id;
        const connected = connectedPins?.has(p.id);
        const showPin = zoomDetail !== "outline" || hovered || selected || connected;
        if (!showPin) return null;
        const isPower = p.interfaces.includes("power");
        const isGnd = p.interfaces.includes("ground");
        const fill = isPower ? "#EF4444" : isGnd ? "#64748B" : connected ? "#2563EB" : hovered ? "#F59E0B" : "#1E293B";
        return (
          <g key={p.id} className="pin-marker" data-pin={p.id}>
            <circle cx={cx} cy={cy} r={hovered || selected ? 5 : 4} fill={fill} stroke="#FFF" strokeWidth={1.5} />
            {zoomDetail === "silkscreen" && (
              <text x={cx + (p.side === "left" ? -6 : 6)} y={cy + 3} textAnchor={p.side === "left" ? "end" : "start"} fill="#475569" fontSize={6} fontFamily="monospace">
                {p.name}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function showSilk(zoomDetail: ZoomDetail): boolean {
  return zoomDetail === "silkscreen" || zoomDetail === "labels";
}
