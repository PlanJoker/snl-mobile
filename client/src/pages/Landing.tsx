// Design: Dark Brutalism + Neon Accent — Landing page
// Brand: #012E2B bg, #FFDC73 accent, Space Grotesk display font
import { BookOpen, MapPin, Clock, Users, ArrowRight, Star } from "lucide-react";

interface LandingProps {
  onLogin: () => void;
  onRegister: () => void;
}

export default function Landing({ onLogin, onRegister }: LandingProps) {
  return (
    <div className="min-h-screen bg-[#012E2B] flex flex-col overflow-y-auto">
      {/* Hero Section */}
      <div className="relative flex-1 flex flex-col px-6 pt-16 pb-8">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#FFDC73] opacity-5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 left-0 w-48 h-48 rounded-full bg-[#FFDC73] opacity-5 blur-3xl pointer-events-none" />

        {/* Logo / Brand */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-[#FFDC73] flex items-center justify-center">
            <BookOpen size={20} className="text-[#012E2B]" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[#FFDC73] text-xs font-semibold tracking-[0.2em] uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Saturday Normal Library
            </p>
          </div>
        </div>

        {/* Hero Text */}
        <div className="mb-8">
          <h1 className="text-5xl font-black text-[#F8F8FF] leading-[1.05] mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Study<br />
            <span className="text-[#FFDC73]">Together.</span><br />
            Grow<br />
            <span className="text-[#FFDC73]">Together.</span>
          </h1>
          <p className="text-[#8fa8a5] text-base leading-relaxed max-w-xs">
            Melbourne's most vibrant student study community. Every Saturday, we connect and grow.
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-[#0a3d39] border border-[rgba(255,220,115,0.12)] rounded-2xl p-3">
            <Clock size={16} className="text-[#FFDC73] mb-2" />
            <p className="text-[#F8F8FF] text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Every Saturday</p>
            <p className="text-[#8fa8a5] text-xs">1:00 – 5:00 PM</p>
          </div>
          <div className="bg-[#0a3d39] border border-[rgba(255,220,115,0.12)] rounded-2xl p-3">
            <MapPin size={16} className="text-[#FFDC73] mb-2" />
            <p className="text-[#F8F8FF] text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>oSpace</p>
            <p className="text-[#8fa8a5] text-xs">Brunswick, VIC</p>
          </div>
          <div className="bg-[#0a3d39] border border-[rgba(255,220,115,0.12)] rounded-2xl p-3">
            <Users size={16} className="text-[#FFDC73] mb-2" />
            <p className="text-[#F8F8FF] text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Community</p>
            <p className="text-[#8fa8a5] text-xs">All universities</p>
          </div>
          <div className="bg-[#0a3d39] border border-[rgba(255,220,115,0.12)] rounded-2xl p-3">
            <Star size={16} className="text-[#FFDC73] mb-2" />
            <p className="text-[#F8F8FF] text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Free</p>
            <p className="text-[#8fa8a5] text-xs">Open to all</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3 mt-auto">
          <button
            type="button"
            onClick={onLogin}
            className="w-full flex items-center justify-center gap-2 bg-[#FFDC73] text-[#012E2B] rounded-2xl py-4 font-bold text-base transition-all active:scale-[0.97]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Sign In
            <ArrowRight size={18} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={onRegister}
            className="w-full flex items-center justify-center gap-2 border-2 border-[rgba(255,220,115,0.3)] text-[#F8F8FF] rounded-2xl py-4 font-semibold text-base transition-all active:scale-[0.97] hover:border-[#FFDC73]/60"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Create Account
          </button>
        </div>

        {/* Instagram */}
        <p className="text-center text-[#8fa8a5] text-xs mt-4">
          Follow us{" "}
          <a
            href="https://instagram.com/snl.study"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FFDC73] font-semibold"
          >
            @SNL.STUDY
          </a>
        </p>
      </div>
    </div>
  );
}
