import type { WasteRegion } from '@/lib/types';

interface WasteRectProps {
  region: WasteRegion;
  boardIndex: number;
}

export function WasteRect({ region, boardIndex }: WasteRectProps) {
  return (
    <rect
      x={region.x}
      y={region.y}
      width={region.width}
      height={region.height}
      fill={`url(#waste-hatch-${boardIndex})`}
      stroke="var(--border)"
      strokeWidth={0.5}
    />
  );
}
