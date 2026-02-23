// Design: Dark Brutalism + Neon Accent — Auth page
import { useState } from "react";
import { Eye, EyeOff, ArrowLeft, BookOpen, User, Lock, Mail, GraduationCap, Layers } from "lucide-react";
import { useUserStore } from "../stores/userStore";
import { useAppStore } from "../stores/appStore";

const UNIVERSITIES = [
  "Monash University", "University of Melbourne", "RMIT University",
  "La Trobe University", "Deakin University", "Swinburne University",
  "Victoria University", "Australian Catholic University", "Other",
];

interface AuthProps {
  mode: "login" | "register";
  onBack: () => void;
  onSuccess: (isAdmin?: boolean) => void;
  onToggleMode: () => void;
}

export default function Auth({ mode, onBack, onSuccess, onToggleMode }: AuthProps) {
  const { loginUser, register } = useUserStore();
  const { setAdminMode } = useAppStore();

  const [form, setForm] = useState({
    username: "", password: "", email: "", displayName: "",
    university: "", major: "", confirmPassword: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));

    if (mode === "login") {
      const res = loginUser(form.username, form.password);
      if (res.success) {
        if (res.isAdmin) {
          setAdminMode(true);
          onSuccess(true);
        } else {
          onSuccess(false);
        }
      } else {
        setError(res.error || "Login failed.");
      }
    } else {
      if (!form.username || !form.password || !form.displayName || !form.university) {
        setError("Please fill in all required fields.");
        setLoading(false);
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }
      if (form.password.length < 6) {
        setError("Password must be at least 6 characters.");
        setLoading(false);
        return;
      }
      const res = register({
        username: form.username,
        password: form.password,
        email: form.email,
        displayName: form.displayName,
        university: form.university,
        major: form.major,
      });
      if (res.success) {
        onSuccess(false);
      } else {
        setError(res.error || "Registration failed.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#012E2B] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-[#0a3d39] border border-[rgba(255,220,115,0.12)] flex items-center justify-center text-[#8fa8a5] active:scale-95 transition-transform"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FFDC73] flex items-center justify-center">
            <BookOpen size={14} className="text-[#012E2B]" strokeWidth={2.5} />
          </div>
          <span className="text-[#F8F8FF] font-bold text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>SNL Study</span>
        </div>
      </div>

      <div className="flex-1 px-6 pb-8 overflow-y-auto">
        <h2 className="text-3xl font-black text-[#F8F8FF] mb-1 mt-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {mode === "login" ? "Welcome back" : "Join SNL"}
        </h2>
        <p className="text-[#8fa8a5] text-sm mb-6">
          {mode === "login" ? "Sign in to your account" : "Create your account to get started"}
        </p>

        {/* Tester hint */}
        {mode === "login" && (
          <div className="bg-[#FFDC73]/10 border border-[#FFDC73]/20 rounded-xl p-3 mb-4">
            <p className="text-[#FFDC73] text-xs font-semibold mb-1">Test Account</p>
            <p className="text-[#8fa8a5] text-xs">Username: <span className="text-[#F8F8FF]">snl_tester01</span></p>
            <p className="text-[#8fa8a5] text-xs">Password: <span className="text-[#F8F8FF]">tester01!</span></p>
            <p className="text-[#8fa8a5] text-xs mt-1">Admin: <span className="text-[#F8F8FF]">snl_admin</span> / <span className="text-[#F8F8FF]">admin123!</span></p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {/* Username */}
          <div>
            <label className="text-[#8fa8a5] text-xs font-semibold mb-1.5 block uppercase tracking-wide">Username *</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8fa8a5]" />
              <input
                type="text"
                value={form.username}
                onChange={(e) => update("username", e.target.value)}
                placeholder="your_username"
                className="w-full bg-[#0a3d39] border border-[rgba(255,220,115,0.12)] rounded-xl pl-9 pr-4 py-3 text-[#F8F8FF] text-sm placeholder-[#8fa8a5] outline-none focus:border-[#FFDC73]/40 transition-colors"
              />
            </div>
          </div>

          {/* Register-only fields */}
          {mode === "register" && (
            <>
              <div>
                <label className="text-[#8fa8a5] text-xs font-semibold mb-1.5 block uppercase tracking-wide">Display Name *</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8fa8a5]" />
                  <input
                    type="text"
                    value={form.displayName}
                    onChange={(e) => update("displayName", e.target.value)}
                    placeholder="John Smith"
                    className="w-full bg-[#0a3d39] border border-[rgba(255,220,115,0.12)] rounded-xl pl-9 pr-4 py-3 text-[#F8F8FF] text-sm placeholder-[#8fa8a5] outline-none focus:border-[#FFDC73]/40 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-[#8fa8a5] text-xs font-semibold mb-1.5 block uppercase tracking-wide">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8fa8a5]" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="you@email.com"
                    className="w-full bg-[#0a3d39] border border-[rgba(255,220,115,0.12)] rounded-xl pl-9 pr-4 py-3 text-[#F8F8FF] text-sm placeholder-[#8fa8a5] outline-none focus:border-[#FFDC73]/40 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-[#8fa8a5] text-xs font-semibold mb-1.5 block uppercase tracking-wide">University *</label>
                <div className="relative">
                  <GraduationCap size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8fa8a5]" />
                  <select
                    value={form.university}
                    onChange={(e) => update("university", e.target.value)}
                    className="w-full bg-[#0a3d39] border border-[rgba(255,220,115,0.12)] rounded-xl pl-9 pr-4 py-3 text-[#F8F8FF] text-sm outline-none focus:border-[#FFDC73]/40 transition-colors appearance-none"
                  >
                    <option value="" className="bg-[#012E2B]">Select university...</option>
                    {UNIVERSITIES.map((u) => (
                      <option key={u} value={u} className="bg-[#012E2B]">{u}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[#8fa8a5] text-xs font-semibold mb-1.5 block uppercase tracking-wide">Major</label>
                <div className="relative">
                  <Layers size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8fa8a5]" />
                  <input
                    type="text"
                    value={form.major}
                    onChange={(e) => update("major", e.target.value)}
                    placeholder="Computer Science"
                    className="w-full bg-[#0a3d39] border border-[rgba(255,220,115,0.12)] rounded-xl pl-9 pr-4 py-3 text-[#F8F8FF] text-sm placeholder-[#8fa8a5] outline-none focus:border-[#FFDC73]/40 transition-colors"
                  />
                </div>
              </div>
            </>
          )}

          {/* Password */}
          <div>
            <label className="text-[#8fa8a5] text-xs font-semibold mb-1.5 block uppercase tracking-wide">Password *</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8fa8a5]" />
              <input
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="••••••••"
                className="w-full bg-[#0a3d39] border border-[rgba(255,220,115,0.12)] rounded-xl pl-9 pr-10 py-3 text-[#F8F8FF] text-sm placeholder-[#8fa8a5] outline-none focus:border-[#FFDC73]/40 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8fa8a5]"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === "register" && (
            <div>
              <label className="text-[#8fa8a5] text-xs font-semibold mb-1.5 block uppercase tracking-wide">Confirm Password *</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8fa8a5]" />
                <input
                  type={showPw ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0a3d39] border border-[rgba(255,220,115,0.12)] rounded-xl pl-9 pr-4 py-3 text-[#F8F8FF] text-sm placeholder-[#8fa8a5] outline-none focus:border-[#FFDC73]/40 transition-colors"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#FFDC73] text-[#012E2B] rounded-2xl py-4 font-bold text-base mt-2 transition-all active:scale-[0.97] disabled:opacity-60"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {loading ? "..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>

          <button
            type="button"
            onClick={onToggleMode}
            className="text-center text-[#8fa8a5] text-sm py-2"
          >
            {mode === "login" ? (
              <>Don't have an account? <span className="text-[#FFDC73] font-semibold">Sign up</span></>
            ) : (
              <>Already have an account? <span className="text-[#FFDC73] font-semibold">Sign in</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
