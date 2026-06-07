import * as React from "react";
import * as authService from "~/services/auth.service";
import type { UserDto } from "~/types/auth";

interface CurrentUser extends UserDto {
  permissions: string[];
}

interface AuthContextValue {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearAuthState: () => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const clearAuthState = React.useCallback(() => {
    authService.clearSession();
    setUser(null);
  }, []);

  React.useEffect(() => {
    async function init() {
      try {
        const refreshed = await authService.tryRefresh();
        if (refreshed) {
          const me = await authService.getMeWithPermissions();
          setUser(me);
        }
      } catch {
        // Not authenticated
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  const login = React.useCallback(async (username: string, password: string) => {
    await authService.login(username, password);
    const me = await authService.getMeWithPermissions();
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

  const refreshUser = React.useCallback(async () => {
    const me = await authService.getMeWithPermissions();
    setUser(me);
  }, []);

  const hasPermission = React.useCallback(
    (permission: string) => {
      if (!user) return false;
      return user.permissions.includes(permission);
    },
    [user],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        hasPermission,
        login,
        logout,
        changePassword,
        refreshUser,
        clearAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
