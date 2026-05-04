import { Outlet } from "react-router";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { SiteSettingsProvider } from "~/context/site-settings.context";
import { PublicMenusProvider } from "~/context/public-menus.context";

export default function MainLayout() {
  return (
    <SiteSettingsProvider>
      <PublicMenusProvider>
        <div className="min-h-screen flex flex-col font-sans">
          <Header />
          <main className="flex-1 bg-white">
            <Outlet />
          </main>
          <Footer />
        </div>
      </PublicMenusProvider>
    </SiteSettingsProvider>
  );
}
