/** Canvas-local pin click bridge — avoids storing callbacks in global UI zustand. */

type PinClickHandler = (nodeId: string, pinId: string) => void;

let handler: PinClickHandler | null = null;

export function setPinClickHandler(fn: PinClickHandler | null): void {
  handler = fn;
}

export function invokePinClick(nodeId: string, pinId: string): void {
  handler?.(nodeId, pinId);
}
