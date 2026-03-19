'use client';

import { useRef } from 'react';
import { BOARD_PRESETS } from '@/lib/board-presets';

const MM_PER_INCH = 25.4;

interface BoardPresetsProps {
  onSelect: (lengthMm: number, widthMm: number) => void;
}

export function BoardPresets({ onSelect }: BoardPresetsProps) {
  const selectRef = useRef<HTMLSelectElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value, 10);
    if (isNaN(index)) return;

    const preset = BOARD_PRESETS[index];
    if (!preset) return;

    onSelect(preset.lengthIn * MM_PER_INCH, preset.widthIn * MM_PER_INCH);

    // Reset select to placeholder
    if (selectRef.current) {
      selectRef.current.value = '';
    }
  };

  return (
    <div className="mb-3">
      <label className="text-xs text-text-secondary block mb-1">Preset</label>
      <select
        ref={selectRef}
        onChange={handleChange}
        defaultValue=""
        className="w-full p-2 rounded bg-surface-alt border border-border text-text-primary text-sm"
      >
        <option value="" disabled>
          Select a preset...
        </option>
        {BOARD_PRESETS.map((preset, i) => (
          <option key={preset.name} value={i}>
            {preset.name}
          </option>
        ))}
      </select>
    </div>
  );
}
