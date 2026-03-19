'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { UnitSystem } from '@/lib/types';

interface UnitContextType {
  units: UnitSystem;
  toggleUnits: () => void;
  setUnits: (units: UnitSystem) => void;
}

const UnitContext = createContext<UnitContextType | null>(null);

export function UnitProvider({ children }: { children: ReactNode }) {
  const [units, setUnits] = useState<UnitSystem>('imperial');

  const toggleUnits = () => {
    setUnits(prev => prev === 'imperial' ? 'metric' : 'imperial');
  };

  return (
    <UnitContext.Provider value={{ units, toggleUnits, setUnits }}>
      {children}
    </UnitContext.Provider>
  );
}

export function useUnits(): UnitContextType {
  const context = useContext(UnitContext);
  if (!context) {
    throw new Error('useUnits must be used within a UnitProvider');
  }
  return context;
}
