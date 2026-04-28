import * as React from 'react';
import { getAllSiteSettings, settingsToMap } from '~/services/site-settings.service';

const SiteSettingsContext = React.createContext<Record<string, string>>({});

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    getAllSiteSettings()
      .then(settingsToMap)
      .then(setSettings)
      .catch(() => {});
  }, []);

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings(): Record<string, string> {
  return React.useContext(SiteSettingsContext);
}
