import type { ReactNode } from 'react';

export function Sidebar({ children }: { children?: ReactNode }) {
  return (
    <aside className="w-full md:w-80 md:flex-shrink-0 overflow-y-auto
                       border-b md:border-b-0 md:border-r border-border bg-surface p-4">
      <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
        Inputs
      </h2>
      {children || (
        <p className="text-sm text-text-secondary">
          Board and cut piece inputs will appear here.
        </p>
      )}
    </aside>
  );
}
