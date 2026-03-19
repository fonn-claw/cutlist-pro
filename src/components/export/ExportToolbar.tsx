'use client';

import { useState } from 'react';
import type { Board, CutPiece } from '@/lib/types';
import { exportToPng } from '@/lib/export-png';
import { buildShareUrl } from '@/lib/url-state';

interface ExportToolbarProps {
  boards: Board[];
  pieces: CutPiece[];
  kerf: number;
}

export function ExportToolbar({ boards, pieces, kerf }: ExportToolbarProps) {
  const [copyLabel, setCopyLabel] = useState('Copy Link');

  const handleExportPng = async () => {
    try {
      await exportToPng('cutting-diagrams');
    } catch (err) {
      console.error('PNG export failed:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = async () => {
    try {
      const url = buildShareUrl(boards, pieces, kerf);
      await navigator.clipboard.writeText(url);
      setCopyLabel('Copied!');
      setTimeout(() => setCopyLabel('Copy Link'), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const buttonClass =
    'text-sm bg-surface-alt border border-border rounded px-3 py-1.5 text-text-secondary hover:text-text-primary transition-colors';

  return (
    <div className="flex gap-2 flex-wrap" data-no-print>
      <button onClick={handleExportPng} className={buttonClass}>
        Export PNG
      </button>
      <button onClick={handlePrint} className={buttonClass}>
        Print
      </button>
      <button onClick={handleCopyLink} className={buttonClass}>
        {copyLabel}
      </button>
    </div>
  );
}
