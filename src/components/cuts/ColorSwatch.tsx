'use client';

import { useState, useEffect, useRef } from 'react';
import { CUT_PIECE_PALETTE } from '@/lib/color-palette';

interface ColorSwatchProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorSwatch({ value, onChange }: ColorSwatchProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(prev => !prev);
        }}
        className="w-5 h-5 rounded-full border border-border flex-shrink-0"
        style={{ backgroundColor: value }}
        aria-label="Change color"
      />
      {open && (
        <div className="absolute z-10 mt-1 p-2 bg-surface border border-border rounded shadow-lg grid grid-cols-5 gap-1">
          {CUT_PIECE_PALETTE.map(color => (
            <button
              key={color}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(color);
                setOpen(false);
              }}
              className={`w-5 h-5 rounded-full ${color === value ? 'ring-2 ring-accent' : ''}`}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
