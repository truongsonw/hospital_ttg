import * as React from 'react';
import * as authService from '~/services/auth.service';
import type { UserDto } from '~/types/auth';

interface AuthContextValue {
  user: UserDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function init() {
      try {
        const refreshed = await authService.tryRefresh();
        if (refreshed) {
          const me = await authService.getMe();
          setUser(me);
        }
      } catch {
        // No valid session
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  const login = React.useCallback(async (username: string, password: string) => {
    await authService.login(username, password);
    const me = await authService.getMe();
    setUser(me);
  }, []);

  const logout = React.useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const changePassword = React.useCallback(
    async (currentPassword: string, newPassword: string) => {
      await authService.changePassword(currentPassword, newPassword);
      setUser(null);
    },
    [],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        logout,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
