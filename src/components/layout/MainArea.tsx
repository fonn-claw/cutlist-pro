import type { ReactNode } from 'react';

export function MainArea({ children }: { children?: ReactNode }) {
  return (
    <main className="flex-1 overflow-y-auto bg-surface-alt p-6">
      {children || (
        <div className="h-full flex items-center justify-center">
          <p className="text-lg text-text-secondary">
            Add boards and pieces to get started
          </p>
        </div>
      )}
    </main>
  );
}
