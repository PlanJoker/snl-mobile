// Design: Dark Brutalism + Neon Accent
// Brand: #012E2B bg, #FFDC73 accent, Space Grotesk + Inter
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAppStore } from "./stores/appStore";
import { useUserStore } from "./stores/userStore";
import BottomNav from "./components/BottomNav";
import HomePage from "./pages/Home";
import CalendarPage from "./pages/Calendar";
import WAMPage from "./pages/WAM";
import GalleryPage from "./pages/Gallery";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";

type AuthView = "landing" | "login" | "register";

function AppContent() {
  const { activeTab } = useAppStore();
  const { currentUserId } = useUserStore();
  const [authView, setAuthView] = useState<AuthView>("landing");

  // Not logged in → show landing / auth
  if (!currentUserId) {
    if (authView === "landing") {
      return (
        <div className="max-w-[480px] mx-auto min-h-screen bg-[#012E2B] relative">
          <Landing
            onLogin={() => setAuthView("login")}
            onRegister={() => setAuthView("register")}
          />
        </div>
      );
    }
    return (
      <div className="max-w-[480px] mx-auto min-h-screen bg-[#012E2B] relative">
        <Auth
          mode={authView === "login" ? "login" : "register"}
          onBack={() => setAuthView("landing")}
          onSuccess={() => setAuthView("landing")}
          onToggleMode={() => setAuthView(authView === "login" ? "register" : "login")}
        />
      </div>
    );
  }

  // Logged in → show main app
  const renderPage = () => {
    switch (activeTab) {
      case "home": return <HomePage />;
      case "calendar": return <CalendarPage />;
      case "wam": return <WAMPage />;
      case "gallery": return <GalleryPage />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-[#012E2B] relative">
      {renderPage()}
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </ThemeProvider>
  );
}
