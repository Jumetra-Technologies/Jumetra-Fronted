export type PinInterface =
  | "gpio"
  | "pwm"
  | "adc"
  | "uart"
  | "spi"
  | "i2c"
  | "can"
  | "digital"
  | "analog"
  | "power"
  | "ground";

export type PinSide = "left" | "right" | "top" | "bottom";

export interface HardwarePin {
  id: string;
  name: string;
  number: number | string;
  x: number;
  y: number;
  side: PinSide;
  voltage: number;
  interfaces: PinInterface[];
  signal?: "input" | "output" | "bidirectional" | "power";
}

export interface HardwareAnimation {
  id: string;
  type: "glow" | "rotate" | "text" | "digital" | "pwm" | "switch" | "pulse";
  pinRef?: string;
  stateKey?: string;
  target: string;
  min?: number;
  max?: number;
}

export interface HardwareMetadata {
  id: string;
  name: string;
  width: number;
  height: number;
  category: string;
  defaultVoltage: number;
  description?: string;
  firmwareKey?: string;
}

export interface HardwareAsset {
  metadata: HardwareMetadata;
  pins: HardwarePin[];
  animations: HardwareAnimation[];
  svgPath: string;
}

export interface PinSelection {
  nodeId: string;
  pinId: string;
}

export interface WiringSource {
  nodeId: string;
  pinId: string;
  protocol: string;
}

export type ZoomDetail = "outline" | "labels" | "silkscreen";

export function zoomDetailLevel(zoom: number): ZoomDetail {
  if (zoom < 0.55) return "outline";
  if (zoom < 1.05) return "labels";
  return "silkscreen";
}
