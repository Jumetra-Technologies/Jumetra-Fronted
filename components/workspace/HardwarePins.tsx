"use client";

import { useState } from "react";
import { PinBadge } from "./PinBadge";
import { PinTooltip } from "./PinTooltip";
import type { HardwarePin } from "./hardware-types";

export function HardwarePins({
  pins,
  onPinClick,
}: {
  pins: HardwarePin[];
  onPinClick?: (pin: HardwarePin) => void;
}) {
  const [hover, setHover] = useState<HardwarePin | null>(null);

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1">
        {pins.map((pin) => (
          <div
            key={pin.name}
            className="relative"
            onMouseEnter={() => setHover(pin)}
            onMouseLeave={() => setHover(null)}
          >
            <PinBadge pin={pin} onClick={() => onPinClick?.(pin)} />
          </div>
        ))}
      </div>
      {hover && (
        <div className="pointer-events-none absolute left-0 top-full z-20 mt-1">
          <PinTooltip pin={hover} />
        </div>
      )}
    </div>
  );
}
