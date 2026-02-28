// Design: Dark Brutalism + Neon Accent
// Brand: #012E2B bg, #FFDC73 accent, Space Grotesk + Inter
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAppStore } from "./stores/appStore";
import BottomNav from "./components/BottomNav";
import HomePage from "./pages/Home";
import CalendarPage from "./pages/Calendar";
import WAMPage from "./pages/WAM";
import GalleryPage from "./pages/Gallery";

function AppContent() {
  const { activeTab } = useAppStore();

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
