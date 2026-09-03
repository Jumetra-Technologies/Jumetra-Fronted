import { HARDWARE_ASSETS, getHardwareAsset, getHardwareAssetOrFallback } from "./asset-data";
import type { HardwareAsset } from "./types";

export { HARDWARE_ASSETS, getHardwareAsset, getHardwareAssetOrFallback };
export type { HardwareAsset };

export function getPinById(asset: HardwareAsset, pinId: string) {
  return asset.pins.find((p) => p.id === pinId);
}

export function getConnectedWiresForPin(
  nodeId: string,
  pinId: string,
  wires: Array<{ id?: string; source: string; target: string; sourceHandle?: string; targetHandle?: string; protocol?: string; color?: string; label?: string }>,
) {
  return wires.filter(
    (w) =>
      (w.source === nodeId && w.sourceHandle === pinId) ||
      (w.target === nodeId && w.targetHandle === pinId),
  );
}

export function resolvePinSignalState(
  liveState: Record<string, unknown>,
  pinId: string,
): string | number | boolean | undefined {
  const gpio = liveState.gpio as Record<string, unknown> | undefined;
  if (gpio && pinId in gpio) return gpio[pinId] as string | number | boolean;
  if (pinId in liveState) return liveState[pinId] as string | number | boolean;
  for (const [k, v] of Object.entries(liveState)) {
    if (k.toLowerCase().includes(pinId.toLowerCase())) return v as string | number | boolean;
  }
  return undefined;
}

export function breadboardRowForPin(pinId: string): string | null {
  const match = pinId.match(/^([A-E])(\d+)$/i);
  if (!match) return null;
  return `${match[1].toUpperCase()}-${match[2]}`;
}

export function breadboardPowerRail(pinId: string): "positive" | "negative" | null {
  if (pinId.startsWith("VCC+")) return "positive";
  if (pinId.startsWith("VCC-")) return "negative";
  return null;
}

/** Load asset from filesystem JSON (assets/components/) — falls back to in-memory registry */
export async function loadHardwareAssetFromFiles(componentId: string): Promise<HardwareAsset | null> {
  try {
    const [metadata, pins, animations] = await Promise.all([
      import(`@/assets/components/${componentId}/metadata.json`).then((m) => m.default),
      import(`@/assets/components/${componentId}/pins.json`).then((m) => m.default),
      import(`@/assets/components/${componentId}/animations.json`).then((m) => m.default),
    ]);
    return {
      metadata,
      pins: pins.pins,
      animations: animations.animations,
      svgPath: `/assets/components/${componentId}/component.svg`,
    };
  } catch {
    return getHardwareAsset(componentId);
  }
}
