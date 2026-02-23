// Design: Dark Brutalism + Neon Accent
// Brand: #012E2B bg, #FFDC73 accent, Space Grotesk + Inter
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useUserStore } from "./stores/userStore";
import { useAppStore } from "./stores/appStore";
import BottomNav from "./components/BottomNav";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import HomePage from "./pages/Home";
import CalendarPage from "./pages/Calendar";
import WAMPage from "./pages/WAM";
import GalleryPage from "./pages/Gallery";
import AdminPage from "./pages/Admin";

type AppScreen = "landing" | "login" | "register" | "app";

export default function App() {
  const { currentUserId } = useUserStore();
  const { activeTab, isAdminMode } = useAppStore();
  const [screen, setScreen] = useState<AppScreen>(currentUserId ? "app" : "landing");

  const handleAuthSuccess = (isAdmin?: boolean) => {
    setScreen("app");
  };

  // If user is already logged in, go straight to app
  if (currentUserId && screen === "landing") {
    setScreen("app");
  }

  if (screen === "landing") {
    return (
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <div className="max-w-[480px] mx-auto min-h-screen">
            <Landing
              onLogin={() => setScreen("login")}
              onRegister={() => setScreen("register")}
            />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    );
  }

  if (screen === "login" || screen === "register") {
    return (
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <div className="max-w-[480px] mx-auto min-h-screen">
            <Auth
              mode={screen}
              onBack={() => setScreen("landing")}
              onSuccess={handleAuthSuccess}
              onToggleMode={() => setScreen(screen === "login" ? "register" : "login")}
            />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    );
  }

  const renderPage = () => {
    if (isAdminMode && activeTab === "admin") return <AdminPage />;
    switch (activeTab) {
      case "home": return <HomePage />;
      case "calendar": return <CalendarPage />;
      case "wam": return <WAMPage />;
      case "gallery": return <GalleryPage />;
      case "admin": return isAdminMode ? <AdminPage /> : <HomePage />;
      default: return <HomePage />;
    }
  };

  return (
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <Toaster />
        <div className="max-w-[480px] mx-auto min-h-screen bg-[#012E2B] relative">
          {renderPage()}
          <BottomNav />
        </div>
      </TooltipProvider>
    </ThemeProvider>
  );
}
