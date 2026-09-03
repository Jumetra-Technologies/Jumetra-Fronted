import type { HardwareAsset, HardwarePin } from "./types";

function pin(
  id: string,
  name: string,
  number: number | string,
  x: number,
  y: number,
  side: HardwarePin["side"],
  voltage: number,
  interfaces: HardwarePin["interfaces"],
  signal?: HardwarePin["signal"],
): HardwarePin {
  return { id, name, number, x, y, side, voltage, interfaces, signal };
}

const pwr = (id: string, x: number, y: number, side: HardwarePin["side"], v: number) =>
  pin(id, id, id, x, y, side, v, ["power"], "power");
const gnd = (id: string, x: number, y: number, side: HardwarePin["side"]) =>
  pin(id, id, id, x, y, side, 0, ["ground"], "power");

export const HARDWARE_ASSETS: Record<string, HardwareAsset> = {
  esp32: {
    metadata: {
      id: "esp32",
      name: "ESP32 DevKit V1",
      width: 300,
      height: 150,
      category: "esp32",
      defaultVoltage: 3.3,
      description: "Dual-core WiFi/BT MCU dev board",
      firmwareKey: "firmware_version",
    },
    pins: [
      pwr("3V3", 0.02, 0.12, "left", 3.3),
      gnd("GND1", 0.02, 0.22, "left"),
      pin("EN", "EN", "EN", 0.02, 0.32, "left", 3.3, ["digital"], "input"),
      pin("VP", "VP", 36, 0.02, 0.42, "left", 3.3, ["adc", "analog"], "input"),
      pin("VN", "VN", 39, 0.02, 0.52, "left", 3.3, ["adc", "analog"], "input"),
      pin("D34", "GPIO34", 34, 0.02, 0.62, "left", 3.3, ["adc", "gpio"], "input"),
      pin("D35", "GPIO35", 35, 0.02, 0.72, "left", 3.3, ["adc", "gpio"], "input"),
      pin("D32", "GPIO32", 32, 0.02, 0.82, "left", 3.3, ["gpio", "adc", "pwm"], "bidirectional"),
      pin("D33", "GPIO33", 33, 0.02, 0.92, "left", 3.3, ["gpio", "adc", "pwm"], "bidirectional"),
      pin("D25", "GPIO25", 25, 0.98, 0.12, "right", 3.3, ["gpio", "pwm"], "bidirectional"),
      pin("D26", "GPIO26", 26, 0.98, 0.22, "right", 3.3, ["gpio", "pwm"], "bidirectional"),
      pin("D27", "GPIO27", 27, 0.98, 0.32, "right", 3.3, ["gpio", "pwm"], "bidirectional"),
      pin("D14", "GPIO14", 14, 0.98, 0.42, "right", 3.3, ["gpio", "pwm", "spi"], "bidirectional"),
      pin("D12", "GPIO12", 12, 0.98, 0.52, "right", 3.3, ["gpio", "pwm"], "bidirectional"),
      gnd("GND2", 0.98, 0.62, "right"),
      pin("D13", "GPIO13", 13, 0.98, 0.72, "right", 3.3, ["gpio", "pwm", "spi"], "bidirectional"),
      pin("D2", "GPIO2", 2, 0.98, 0.82, "right", 3.3, ["gpio", "pwm", "i2c"], "bidirectional"),
      pin("D4", "GPIO4", 4, 0.98, 0.92, "right", 3.3, ["gpio", "pwm", "i2c"], "bidirectional"),
      pin("RX", "RX0", 3, 0.5, 0.98, "bottom", 3.3, ["uart", "gpio"], "input"),
      pin("TX", "TX0", 1, 0.62, 0.98, "bottom", 3.3, ["uart", "gpio"], "output"),
      pwr("5V", 0.38, 0.98, "bottom", 5),
      pin("VIN", "VIN", "VIN", 0.26, 0.98, "bottom", 5, ["power"], "power"),
    ],
    animations: [
      { id: "wifi-led", type: "glow", stateKey: "wifi_connected", target: "wifi-led" },
      { id: "power-led", type: "glow", stateKey: "power_on", target: "power-led" },
      { id: "gpio-pulse", type: "pwm", pinRef: "D2", target: "gpio-indicator" },
    ],
    svgPath: "/assets/components/esp32/component.svg",
  },

  "arduino-uno": {
    metadata: {
      id: "arduino-uno",
      name: "Arduino Uno R3",
      width: 280,
      height: 200,
      category: "arduino",
      defaultVoltage: 5,
      description: "ATmega328P development board",
    },
    pins: [
      pwr("5V", 0.02, 0.15, "left", 5),
      pwr("3V3", 0.02, 0.25, "left", 3.3),
      gnd("GND1", 0.02, 0.35, "left"),
      gnd("GND2", 0.02, 0.45, "left"),
      pin("A0", "A0", "A0", 0.02, 0.55, "left", 5, ["adc", "analog"], "input"),
      pin("A1", "A1", "A1", 0.02, 0.65, "left", 5, ["adc", "analog"], "input"),
      pin("A2", "A2", "A2", 0.02, 0.75, "left", 5, ["adc", "analog"], "input"),
      pin("A3", "A3", "A3", 0.02, 0.85, "left", 5, ["adc", "analog"], "input"),
      pin("D13", "D13", 13, 0.98, 0.15, "right", 5, ["gpio", "pwm", "spi"], "bidirectional"),
      pin("D12", "D12", 12, 0.98, 0.25, "right", 5, ["gpio", "spi"], "bidirectional"),
      pin("D11", "D11", 11, 0.98, 0.35, "right", 5, ["gpio", "pwm", "spi"], "bidirectional"),
      pin("D10", "D10", 10, 0.98, 0.45, "right", 5, ["gpio", "pwm", "spi"], "bidirectional"),
      pin("D9", "D9", 9, 0.98, 0.55, "right", 5, ["gpio", "pwm"], "bidirectional"),
      pin("D8", "D8", 8, 0.98, 0.65, "right", 5, ["gpio"], "bidirectional"),
      pin("D7", "D7", 7, 0.98, 0.75, "right", 5, ["gpio"], "bidirectional"),
      pin("D6", "D6", 6, 0.98, 0.85, "right", 5, ["gpio", "pwm"], "bidirectional"),
      pin("D5", "D5", 5, 0.98, 0.95, "right", 5, ["gpio", "pwm"], "bidirectional"),
      pin("SDA", "SDA", "A4", 0.35, 0.98, "bottom", 5, ["i2c", "gpio"], "bidirectional"),
      pin("SCL", "SCL", "A5", 0.45, 0.98, "bottom", 5, ["i2c", "gpio"], "bidirectional"),
      pin("RX", "RX", 0, 0.55, 0.98, "bottom", 5, ["uart", "gpio"], "input"),
      pin("TX", "TX", 1, 0.65, 0.98, "bottom", 5, ["uart", "gpio"], "output"),
    ],
    animations: [
      { id: "built-in-led", type: "glow", pinRef: "D13", stateKey: "led_on", target: "onboard-led" },
    ],
    svgPath: "/assets/components/arduino-uno/component.svg",
  },

  stm32: {
    metadata: {
      id: "stm32",
      name: "STM32 Blue Pill",
      width: 220,
      height: 120,
      category: "stm32",
      defaultVoltage: 3.3,
      description: "STM32F103C8T6 minimal dev board",
    },
    pins: [
      pwr("3V3", 0.02, 0.2, "left", 3.3),
      gnd("GND1", 0.02, 0.35, "left"),
      pin("B11", "PB11", "B11", 0.02, 0.5, "left", 3.3, ["gpio", "i2c"], "bidirectional"),
      pin("B10", "PB10", "B10", 0.02, 0.65, "left", 3.3, ["gpio", "i2c"], "bidirectional"),
      pin("B1", "PB1", "B1", 0.02, 0.8, "left", 3.3, ["gpio", "adc"], "bidirectional"),
      pin("A7", "PA7", "A7", 0.98, 0.2, "right", 3.3, ["gpio", "spi"], "bidirectional"),
      pin("A6", "PA6", "A6", 0.98, 0.35, "right", 3.3, ["gpio", "spi"], "bidirectional"),
      pin("A5", "PA5", "A5", 0.98, 0.5, "right", 3.3, ["gpio", "spi"], "bidirectional"),
      pin("A4", "PA4", "A4", 0.98, 0.65, "right", 3.3, ["gpio", "spi"], "bidirectional"),
      pin("A3", "PA3", "A3", 0.98, 0.8, "right", 3.3, ["gpio", "uart"], "bidirectional"),
      pin("CAN_RX", "CAN_RX", "CAN_RX", 0.4, 0.98, "bottom", 3.3, ["can"], "input"),
      pin("CAN_TX", "CAN_TX", "CAN_TX", 0.55, 0.98, "bottom", 3.3, ["can"], "output"),
    ],
    animations: [{ id: "power-led", type: "glow", stateKey: "power_on", target: "power-led" }],
    svgPath: "/assets/components/stm32/component.svg",
  },

  "raspberry-pi-pico": {
    metadata: {
      id: "raspberry-pi-pico",
      name: "Raspberry Pi Pico",
      width: 260,
      height: 110,
      category: "pico",
      defaultVoltage: 3.3,
      description: "RP2040 dual-core microcontroller board",
    },
    pins: [
      gnd("GND1", 0.02, 0.15, "left"),
      pin("GP0", "GP0", 0, 0.02, 0.3, "left", 3.3, ["gpio", "uart"], "bidirectional"),
      pin("GP1", "GP1", 1, 0.02, 0.45, "left", 3.3, ["gpio", "uart"], "bidirectional"),
      gnd("GND2", 0.02, 0.6, "left"),
      pin("GP2", "GP2", 2, 0.02, 0.75, "left", 3.3, ["gpio", "i2c"], "bidirectional"),
      pin("GP3", "GP3", 3, 0.02, 0.9, "left", 3.3, ["gpio", "i2c"], "bidirectional"),
      pin("GP4", "GP4", 4, 0.98, 0.15, "right", 3.3, ["gpio", "spi"], "bidirectional"),
      pin("GP5", "GP5", 5, 0.98, 0.3, "right", 3.3, ["gpio", "spi"], "bidirectional"),
      gnd("GND3", 0.98, 0.45, "right"),
      pin("GP6", "GP6", 6, 0.98, 0.6, "right", 3.3, ["gpio", "spi"], "bidirectional"),
      pin("GP7", "GP7", 7, 0.98, 0.75, "right", 3.3, ["gpio", "spi"], "bidirectional"),
      pin("GP8", "GP8", 8, 0.98, 0.9, "right", 3.3, ["gpio", "pwm"], "bidirectional"),
      pwr("3V3", 0.4, 0.98, "bottom", 3.3),
      pin("VBUS", "VBUS", "VBUS", 0.55, 0.98, "bottom", 5, ["power"], "power"),
    ],
    animations: [],
    svgPath: "/assets/components/raspberry-pi-pico/component.svg",
  },

  breadboard: {
    metadata: {
      id: "breadboard",
      name: "Breadboard",
      width: 400,
      height: 280,
      category: "prototyping",
      defaultVoltage: 5,
      description: "830-point solderless breadboard",
    },
    pins: [
      ...Array.from({ length: 30 }, (_, i) => {
        const row = Math.floor(i / 5);
        const col = i % 5;
        const x = 0.08 + col * 0.035;
        const y = 0.2 + row * 0.08;
        return pin(`A${i + 1}`, `A${i + 1}`, i + 1, x, y, "top", 5, ["digital"], "bidirectional");
      }),
      pwr("VCC+", 0.02, 0.08, "left", 5),
      gnd("VCC-", 0.02, 0.92, "left"),
      pwr("VCC+2", 0.98, 0.08, "right", 5),
      gnd("VCC-2", 0.98, 0.92, "right"),
    ],
    animations: [],
    svgPath: "/assets/components/breadboard/component.svg",
  },

  led: {
    metadata: { id: "led", name: "LED", width: 60, height: 80, category: "displays", defaultVoltage: 3.3 },
    pins: [
      pin("A", "Anode", "A", 0.5, 0.08, "top", 3.3, ["digital", "pwm"], "input"),
      pin("C", "Cathode", "C", 0.5, 0.92, "bottom", 0, ["ground"], "power"),
    ],
    animations: [{ id: "led-glow", type: "glow", stateKey: "on", target: "led-body" }],
    svgPath: "/assets/components/led/component.svg",
  },

  relay: {
    metadata: { id: "relay", name: "Relay Module", width: 80, height: 100, category: "robotics", defaultVoltage: 5 },
    pins: [
      pwr("VCC", 0.15, 0.08, "top", 5),
      gnd("GND", 0.85, 0.08, "top"),
      pin("IN", "IN", "IN", 0.5, 0.08, "top", 5, ["digital"], "input"),
      pin("NO", "NO", "NO", 0.25, 0.92, "bottom", 5, ["digital"], "output"),
      pin("COM", "COM", "COM", 0.5, 0.92, "bottom", 5, ["digital"], "bidirectional"),
      pin("NC", "NC", "NC", 0.75, 0.92, "bottom", 5, ["digital"], "output"),
    ],
    animations: [{ id: "relay-switch", type: "switch", stateKey: "active", target: "relay-arm" }],
    svgPath: "/assets/components/relay/component.svg",
  },

  servo: {
    metadata: { id: "servo", name: "Servo Motor", width: 90, height: 110, category: "robotics", defaultVoltage: 5 },
    pins: [
      pwr("VCC", 0.2, 0.92, "bottom", 5),
      gnd("GND", 0.5, 0.92, "bottom"),
      pin("SIG", "Signal", "SIG", 0.8, 0.92, "bottom", 5, ["pwm"], "input"),
    ],
    animations: [{ id: "servo-rotate", type: "rotate", stateKey: "angle", target: "servo-arm", min: 0, max: 180 }],
    svgPath: "/assets/components/servo/component.svg",
  },

  "hc-sr04": {
    metadata: { id: "hc-sr04", name: "HC-SR04", width: 120, height: 70, category: "sensors", defaultVoltage: 5 },
    pins: [
      pwr("VCC", 0.2, 0.92, "bottom", 5),
      pin("TRIG", "TRIG", "TRIG", 0.4, 0.92, "bottom", 5, ["digital"], "output"),
      pin("ECHO", "ECHO", "ECHO", 0.6, 0.92, "bottom", 5, ["digital"], "input"),
      gnd("GND", 0.8, 0.92, "bottom"),
    ],
    animations: [{ id: "ultrasonic-pulse", type: "pulse", stateKey: "distance_cm", target: "transducer" }],
    svgPath: "/assets/components/hc-sr04/component.svg",
  },

  pir: {
    metadata: { id: "pir", name: "PIR Sensor", width: 80, height: 100, category: "sensors", defaultVoltage: 5 },
    pins: [
      pwr("VCC", 0.2, 0.92, "bottom", 5),
      pin("OUT", "OUT", "OUT", 0.5, 0.92, "bottom", 5, ["digital"], "output"),
      gnd("GND", 0.8, 0.92, "bottom"),
    ],
    animations: [{ id: "pir-detect", type: "glow", stateKey: "motion", target: "dome" }],
    svgPath: "/assets/components/pir/component.svg",
  },

  dht11: {
    metadata: { id: "dht11", name: "DHT11", width: 70, height: 90, category: "sensors", defaultVoltage: 3.3 },
    pins: [
      pwr("VCC", 0.2, 0.92, "bottom", 3.3),
      pin("DATA", "DATA", "DATA", 0.5, 0.92, "bottom", 3.3, ["digital"], "bidirectional"),
      gnd("GND", 0.8, 0.92, "bottom"),
    ],
    animations: [{ id: "dht-read", type: "text", stateKey: "temperature_c", target: "readout" }],
    svgPath: "/assets/components/dht11/component.svg",
  },

  dht22: {
    metadata: { id: "dht22", name: "DHT22", width: 70, height: 90, category: "sensors", defaultVoltage: 3.3 },
    pins: [
      pwr("VCC", 0.2, 0.92, "bottom", 3.3),
      pin("DATA", "DATA", "DATA", 0.5, 0.92, "bottom", 3.3, ["digital"], "bidirectional"),
      gnd("GND", 0.8, 0.92, "bottom"),
    ],
    animations: [{ id: "dht-read", type: "text", stateKey: "temperature_c", target: "readout" }],
    svgPath: "/assets/components/dht22/component.svg",
  },

  lcd: {
    metadata: { id: "lcd", name: "LCD 1602", width: 160, height: 80, category: "displays", defaultVoltage: 5 },
    pins: [
      pwr("VCC", 0.1, 0.92, "bottom", 5),
      gnd("GND", 0.2, 0.92, "bottom"),
      pin("SDA", "SDA", "SDA", 0.35, 0.92, "bottom", 5, ["i2c"], "bidirectional"),
      pin("SCL", "SCL", "SCL", 0.45, 0.92, "bottom", 5, ["i2c"], "bidirectional"),
    ],
    animations: [{ id: "lcd-text", type: "text", stateKey: "display_text", target: "lcd-screen" }],
    svgPath: "/assets/components/lcd/component.svg",
  },

  oled: {
    metadata: { id: "oled", name: "OLED SSD1306", width: 120, height: 70, category: "displays", defaultVoltage: 3.3 },
    pins: [
      pwr("VCC", 0.2, 0.92, "bottom", 3.3),
      gnd("GND", 0.35, 0.92, "bottom"),
      pin("SDA", "SDA", "SDA", 0.5, 0.92, "bottom", 3.3, ["i2c"], "bidirectional"),
      pin("SCL", "SCL", "SCL", 0.65, 0.92, "bottom", 3.3, ["i2c"], "bidirectional"),
    ],
    animations: [{ id: "oled-text", type: "text", stateKey: "display_text", target: "oled-screen" }],
    svgPath: "/assets/components/oled/component.svg",
  },

  "push-button": {
    metadata: { id: "push-button", name: "Push Button", width: 60, height: 70, category: "sensors", defaultVoltage: 3.3 },
    pins: [
      pin("1", "Pin 1", 1, 0.3, 0.92, "bottom", 3.3, ["digital"], "bidirectional"),
      pin("2", "Pin 2", 2, 0.7, 0.92, "bottom", 3.3, ["digital"], "bidirectional"),
    ],
    animations: [{ id: "btn-press", type: "switch", stateKey: "pressed", target: "button-cap" }],
    svgPath: "/assets/components/push-button/component.svg",
  },

  potentiometer: {
    metadata: { id: "potentiometer", name: "Potentiometer", width: 70, height: 80, category: "sensors", defaultVoltage: 3.3 },
    pins: [
      pin("1", "Leg 1", 1, 0.2, 0.92, "bottom", 3.3, ["analog"], "input"),
      pin("W", "Wiper", "W", 0.5, 0.92, "bottom", 3.3, ["analog", "adc"], "output"),
      pin("3", "Leg 3", 3, 0.8, 0.92, "bottom", 3.3, ["analog"], "input"),
    ],
    animations: [{ id: "pot-rotate", type: "rotate", stateKey: "value", target: "knob", min: 0, max: 1023 }],
    svgPath: "/assets/components/potentiometer/component.svg",
  },

  buzzer: {
    metadata: { id: "buzzer", name: "Buzzer", width: 60, height: 70, category: "robotics", defaultVoltage: 5 },
    pins: [
      pin("+", "Positive", "+", 0.35, 0.92, "bottom", 5, ["digital", "pwm"], "input"),
      pin("-", "Negative", "-", 0.65, 0.92, "bottom", 0, ["ground"], "power"),
    ],
    animations: [{ id: "buzzer-pulse", type: "pwm", stateKey: "active", target: "buzzer-body" }],
    svgPath: "/assets/components/buzzer/component.svg",
  },

  resistor: {
    metadata: { id: "resistor", name: "Resistor", width: 80, height: 30, category: "passive", defaultVoltage: 0 },
    pins: [
      pin("1", "Lead 1", 1, 0.08, 0.5, "left", 0, ["analog"], "bidirectional"),
      pin("2", "Lead 2", 2, 0.92, 0.5, "right", 0, ["analog"], "bidirectional"),
    ],
    animations: [],
    svgPath: "/assets/components/resistor/component.svg",
  },

  capacitor: {
    metadata: { id: "capacitor", name: "Capacitor", width: 50, height: 60, category: "passive", defaultVoltage: 0 },
    pins: [
      pin("+", "Positive", "+", 0.35, 0.92, "bottom", 0, ["analog"], "bidirectional"),
      pin("-", "Negative", "-", 0.65, 0.92, "bottom", 0, ["analog"], "bidirectional"),
    ],
    animations: [],
    svgPath: "/assets/components/capacitor/component.svg",
  },

  "jumper-wire": {
    metadata: { id: "jumper-wire", name: "Jumper Wire", width: 40, height: 40, category: "prototyping", defaultVoltage: 0 },
    pins: [
      pin("A", "End A", "A", 0.15, 0.5, "left", 0, ["digital"], "bidirectional"),
      pin("B", "End B", "B", 0.85, 0.5, "right", 0, ["digital"], "bidirectional"),
    ],
    animations: [],
    svgPath: "/assets/components/jumper-wire/component.svg",
  },
};

export const HARDWARE_COMPONENT_IDS = Object.keys(HARDWARE_ASSETS);

export function getHardwareAsset(componentId: string): HardwareAsset | null {
  return HARDWARE_ASSETS[componentId] ?? null;
}

export function getHardwareAssetOrFallback(
  componentId: string,
  catalogPins?: Array<{ name?: string; type?: string; id?: string }>,
  voltageHint?: number,
): HardwareAsset {
  const asset = getHardwareAsset(componentId);
  if (asset) return asset;
  const v = voltageHint ?? 3.3;
  if (catalogPins && catalogPins.length > 0) {
    const pins = catalogPins.map((p, i) => {
      const name = String(p.name || p.id || `P${i}`);
      const typ = String(p.type || "GPIO").toUpperCase();
      const y = 0.15 + (i / Math.max(catalogPins.length - 1, 1)) * 0.7;
      const ifaces =
        typ === "POWER"
          ? (["power"] as HardwarePin["interfaces"])
          : typ === "GROUND"
            ? (["ground"] as HardwarePin["interfaces"])
            : typ === "I2C"
              ? (["i2c", "gpio"] as HardwarePin["interfaces"])
              : typ === "SPI"
                ? (["spi", "gpio"] as HardwarePin["interfaces"])
                : typ === "UART"
                  ? (["uart", "gpio"] as HardwarePin["interfaces"])
                  : typ === "PWM"
                    ? (["pwm", "gpio"] as HardwarePin["interfaces"])
                    : (["digital", "gpio"] as HardwarePin["interfaces"]);
      return pin(name, name, name, 0.5, y, "left", typ === "GROUND" ? 0 : v, ifaces, typ === "POWER" || typ === "GROUND" ? "power" : "bidirectional");
    });
    return {
      metadata: {
        id: componentId,
        name: componentId,
        width: 90,
        height: Math.max(80, 24 + catalogPins.length * 22),
        category: "generic",
        defaultVoltage: v,
      },
      pins,
      animations: [],
      svgPath: `/assets/components/generic/component.svg`,
    };
  }
  return {
    metadata: {
      id: componentId,
      name: componentId,
      width: 140,
      height: 80,
      category: "generic",
      defaultVoltage: 3.3,
    },
    pins: [
      pin("in", "IN", "IN", 0.02, 0.5, "left", 3.3, ["digital"], "input"),
      pin("out", "OUT", "OUT", 0.98, 0.5, "right", 3.3, ["digital"], "output"),
    ],
    animations: [],
    svgPath: "/assets/components/generic/component.svg",
  };
}
