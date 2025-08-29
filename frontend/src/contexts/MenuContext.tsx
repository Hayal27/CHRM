import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MenuContextType {
  refreshTrigger: number;
  triggerMenuRefresh: () => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};

interface MenuProviderProps {
  children: ReactNode;
}

export const MenuProvider: React.FC<MenuProviderProps> = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerMenuRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <MenuContext.Provider value={{ refreshTrigger, triggerMenuRefresh }}>
      {children}
    </MenuContext.Provider>
  );
};