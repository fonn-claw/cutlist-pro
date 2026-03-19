'use client';

import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { UnitToggle } from '@/components/ui/UnitToggle';

export function Header() {
  return (
    <header className="h-14 flex-shrink-0 border-b border-border bg-surface flex items-center justify-between px-4">
      <span className="text-lg font-semibold text-accent">CutList Pro</span>
      <div className="flex items-center gap-2">
        <UnitToggle />
        <ThemeToggle />
      </div>
    </header>
  );
}
