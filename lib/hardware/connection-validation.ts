/** Client-side live wiring validation for React Flow isValidConnection. */

export type PinLike = {
  id: string;
  name?: string;
  voltage?: number;
  interfaces?: string[];
};

export type ConnectionValidation = {
  valid: boolean;
  reason?: string;
  color: string;
};

const GREEN = "#16a34a";
const RED = "#dc2626";

function isPower(pin?: PinLike | null): boolean {
  if (!pin) return false;
  const id = (pin.id || pin.name || "").toUpperCase();
  const ifaces = (pin.interfaces || []).map((i) => i.toLowerCase());
  return ifaces.includes("power") || /^(5V|3V3|VCC|VDD|VIN)$/.test(id);
}

function isGround(pin?: PinLike | null): boolean {
  if (!pin) return false;
  const id = (pin.id || pin.name || "").toUpperCase();
  const ifaces = (pin.interfaces || []).map((i) => i.toLowerCase());
  return ifaces.includes("ground") || id.includes("GND");
}

export function validateLiveConnection(
  sourcePin?: PinLike | null,
  targetPin?: PinLike | null,
  opts?: { sourceLabel?: string; targetMaxV?: number },
): ConnectionValidation {
  if (!sourcePin || !targetPin) {
    return { valid: false, reason: "Missing pin", color: RED };
  }
  if (sourcePin.id === targetPin.id && opts?.sourceLabel === undefined) {
    /* same pin id on different boards is OK */
  }

  if (isPower(sourcePin) && isGround(targetPin)) {
    return { valid: false, reason: "Power → ground short", color: RED };
  }
  if (isGround(sourcePin) && isPower(targetPin)) {
    return { valid: false, reason: "Ground → power short", color: RED };
  }

  const srcV = sourcePin.voltage ?? 3.3;
  const tgtV = opts?.targetMaxV ?? targetPin.voltage ?? 3.3;
  const srcIs5 = srcV >= 4.5 || /5V|VIN/i.test(sourcePin.id);
  const tgtIs33Only = tgtV <= 3.4 && !/5V/i.test(targetPin.id);

  if (srcIs5 && tgtIs33Only && (isPower(sourcePin) || Math.abs(srcV - (targetPin.voltage ?? tgtV)) >= 1.0)) {
    const label = opts?.sourceLabel || sourcePin.id;
    return {
      valid: false,
      reason: `Voltage mismatch: ${label} is ${srcV}V`,
      color: RED,
    };
  }

  return { valid: true, color: GREEN };
}

export function inferBusFromHandles(sourceHandle: string, targetHandle: string): {
  type: string;
  address?: string;
} | null {
  const handles = new Set([sourceHandle.toUpperCase(), targetHandle.toUpperCase()]);
  if ([...handles].some((h) => ["SDA", "SCL"].includes(h))) {
    return { type: "I2C", address: "0x3C" };
  }
  if ([...handles].some((h) => ["MOSI", "MISO", "SCK", "CS"].includes(h))) {
    return { type: "SPI" };
  }
  if ([...handles].some((h) => ["TX", "RX", "TX0", "RX0"].includes(h))) {
    return { type: "UART" };
  }
  return null;
}
