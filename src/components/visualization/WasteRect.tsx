import type { WasteRegion } from '@/lib/types';

interface WasteRectProps {
  region: WasteRegion;
  boardIndex: number;
  visible?: boolean;
}

export function WasteRect({ region, boardIndex, visible }: WasteRectProps) {
  return (
    <rect
      x={region.x}
      y={region.y}
      width={region.width}
      height={region.height}
      fill={`url(#waste-hatch-${boardIndex})`}
      stroke="var(--border)"
      strokeWidth={0.5}
      style={{
        opacity: visible === undefined ? 1 : visible ? 1 : 0,
        transition: 'opacity 500ms ease-out',
      }}
    />
  );
}
