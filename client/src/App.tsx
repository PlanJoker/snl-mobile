// Design: Dark Brutalism + Neon Accent
// Brand: #012E2B bg, #FFDC73 accent, Space Grotesk + Inter
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./_core/hooks/useAuth";
import { getLoginUrl } from "./const";
import { trpc } from "./lib/trpc";
import { useAppStore } from "./stores/appStore";
import BottomNav from "./components/BottomNav";
import Landing from "./pages/Landing";
import HomePage from "./pages/Home";
import CalendarPage from "./pages/Calendar";
import WAMPage from "./pages/WAM";
import GalleryPage from "./pages/Gallery";
import AdminPage from "./pages/Admin";

function AppContent() {
  const { user, loading } = useAuth();
  const { activeTab } = useAppStore();

  if (loading) {
    return (
      <div className="max-w-[480px] mx-auto min-h-screen bg-[#012E2B] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFDC73]/20 flex items-center justify-center animate-pulse">
            <span className="text-[#FFDC73] text-xl">📚</span>
          </div>
          <p className="text-[#8fa8a5] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-[480px] mx-auto min-h-screen">
        <Landing onLogin={() => { window.location.href = getLoginUrl(); }} onRegister={() => { window.location.href = getLoginUrl(); }} />
      </div>
    );
  }

  const isAdmin = user.role === "admin";

  const renderPage = () => {
    switch (activeTab) {
      case "home": return <HomePage />;
      case "calendar": return <CalendarPage />;
      case "wam": return <WAMPage />;
      case "gallery": return <GalleryPage />;
      case "admin": return isAdmin ? <AdminPage /> : <HomePage />;
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
