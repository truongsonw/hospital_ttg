import * as React from 'react';
import { getPublicMenus } from '~/services/menu.service';
import type { MenuDto } from '~/types/system';

const PublicMenusContext = React.createContext<MenuDto[]>([]);

export function PublicMenusProvider({ children }: { children: React.ReactNode }) {
  const [menus, setMenus] = React.useState<MenuDto[]>([]);

  React.useEffect(() => {
    getPublicMenus()
      .then(setMenus)
      .catch(() => {});
  }, []);

  return (
    <PublicMenusContext.Provider value={menus}>
      {children}
    </PublicMenusContext.Provider>
  );
}

export function usePublicMenus(): MenuDto[] {
  return React.useContext(PublicMenusContext);
}
