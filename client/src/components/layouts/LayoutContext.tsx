// src/contexts/LayoutContext.tsx
import { createContext, useState, useContext, ReactNode } from 'react';

interface LayoutContextType {
  headerActions: ReactNode | null;
  setHeaderActions: (actions: ReactNode | null) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const [headerActions, setHeaderActions] = useState<ReactNode | null>(null);

  return (
    <LayoutContext.Provider value={{ headerActions, setHeaderActions }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};
