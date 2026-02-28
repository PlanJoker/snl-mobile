// Design: Dark Brutalism + Neon Accent — Bottom tab navigation
// Brand: #012E2B bg, #FFDC73 active, Space Grotesk labels
import { Home, CalendarDays, Calculator, Images, ShieldCheck } from "lucide-react";
import { useAppStore, type TabId } from "../stores/appStore";
import { useAuth } from "../_core/hooks/useAuth";

const TABS: { id: TabId; label: string; icon: React.ElementType; adminOnly?: boolean }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "wam", label: "WAM", icon: Calculator },
  { id: "gallery", label: "Gallery", icon: Images },
  { id: "admin", label: "Admin", icon: ShieldCheck, adminOnly: true },
];

export default function BottomNav() {
  const { activeTab, setActiveTab } = useAppStore();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // Show admin tab only for admin users
  const visibleTabs = TABS.filter((t) => !t.adminOnly || isAdmin);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-[480px] mx-auto">
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-[#012E2B]/95 backdrop-blur-xl border-t border-[rgba(255,220,115,0.12)]" />
      <div className="relative flex items-center justify-around px-2 py-2 pb-safe">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[56px] ${
                isActive
                  ? "text-[#FFDC73]"
                  : "text-[#8fa8a5] hover:text-[#F8F8FF]"
              }`}
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              {/* Active indicator dot */}
              <div className="relative">
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className="transition-all duration-200"
                  style={isActive ? { filter: "drop-shadow(0 0 6px rgba(255,220,115,0.6))" } : {}}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#FFDC73]" />
                )}
              </div>
              <span
                className="text-[10px] font-semibold tracking-wide transition-all duration-200"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
