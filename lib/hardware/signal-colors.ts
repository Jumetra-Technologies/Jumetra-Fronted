export const SIGNAL_COLORS: Record<string, string> = {
  digital: "#2563EB",
  gpio: "#2563EB",
  analog: "#10B981",
  adc: "#10B981",
  pwm: "#F59E0B",
  i2c: "#7C3AED",
  spi: "#DB2777",
  uart: "#0891B2",
  can: "#EA580C",
  power: "#EF4444",
  ground: "#64748B",
};

export function protocolForPin(interfaces: string[]): string {
  const priority = ["i2c", "spi", "uart", "can", "pwm", "adc", "analog", "digital", "gpio"];
  for (const p of priority) {
    if (interfaces.includes(p)) return p === "gpio" ? "digital" : p;
  }
  return "digital";
}

export function inferWireProtocol(
  sourceInterfaces: string[],
  targetInterfaces: string[],
): string {
  for (const p of ["i2c", "spi", "uart", "can", "pwm", "adc", "analog"]) {
    if (sourceInterfaces.includes(p) && targetInterfaces.includes(p)) return p;
  }
  if (sourceInterfaces.includes("power") || targetInterfaces.includes("power")) return "power";
  if (sourceInterfaces.includes("ground") || targetInterfaces.includes("ground")) return "ground";
  return protocolForPin(sourceInterfaces);
}

export function signalColor(protocol?: string): string {
  if (!protocol) return SIGNAL_COLORS.digital;
  return SIGNAL_COLORS[protocol] ?? SIGNAL_COLORS.digital;
}
