// Design: Dark Brutalism + Neon Accent — Home Dashboard
// Brand: #012E2B bg, #FFDC73 accent, Space Grotesk headers
import { useState, useRef } from "react";
import { Bell, LogOut, MapPin, Clock, ChevronRight, Plus, Trash2, Target, Camera, Upload, Globe, CheckCircle2, X, TrendingUp, BookOpen } from "lucide-react";
import { useAppStore } from "../stores/appStore";
import { useUserStore } from "../stores/userStore";
import { useAdminStore } from "../stores/adminStore";
import { useWAMStore } from "../stores/wamStore";
import Card from "../components/Card";
import PageHeader from "../components/PageHeader";
import { toast } from "sonner";

export default function HomePage() {
  const { setActiveTab, setAdminMode } = useAppStore();
  const { getGoals, addGoal, removeGoal, userPhotos, currentUserId, addUserPhoto, markPhotoSubmitted, removeUserPhoto, logoutUser } = useUserStore();
  const { announcements, sessions, submitUserPhoto } = useAdminStore();
  const { calculateWAM, semesters } = useWAMStore();
  const goals = getGoals();
  const wam = calculateWAM();
  const myPhotos = userPhotos.filter((p) => p.userId === currentUserId);

  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalForm, setGoalForm] = useState({ semesterName: "", targetWAM: "", targetGrade: "", note: "" });
  const [photoCaption, setPhotoCaption] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const nextSession = [...sessions].sort((a, b) => a.date.localeCompare(b.date))[0];
  const pinnedAnnouncements = announcements.filter((a) => a.pinned).slice(0, 2);

  const handleAddGoal = () => {
    if (!goalForm.semesterName || !goalForm.targetWAM) return;
    addGoal({
      semesterId: Date.now().toString(),
      semesterName: goalForm.semesterName,
      targetWAM: parseFloat(goalForm.targetWAM),
      targetGrade: goalForm.targetGrade,
      note: goalForm.note,
    });
    setGoalForm({ semesterName: "", targetWAM: "", targetGrade: "", note: "" });
    setShowGoalForm(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (!photoPreview || !currentUserId) return;
    addUserPhoto({ userId: currentUserId, src: photoPreview, caption: photoCaption });
    setPhotoPreview(null);
    setPhotoCaption("");
    if (fileRef.current) fileRef.current.value = "";
    toast.success("Photo uploaded!");
  };

  const [submittedIds, setSubmittedIds] = useState<Set<string>>(() => new Set<string>(myPhotos.filter((p) => p.submitted).map((p) => p.id)));
  const handleSubmit = (photo: typeof myPhotos[0]) => {
    if (submittedIds.has(photo.id)) return;
    setSubmittedIds((prev) => { const next = new Set<string>(Array.from(prev)); next.add(photo.id); return next; });
    submitUserPhoto({ userId: currentUserId!, username: "", displayName: "", src: photo.src, caption: photo.caption });
    markPhotoSubmitted(photo.id);
    toast.success("Submitted to gallery!");
  };

  const getWAMColor = (w: number) => w >= 80 ? "#4ade80" : w >= 70 ? "#FFDC73" : w >= 60 ? "#fb923c" : "#f87171";

  return (
    <div className="page-container bg-[#012E2B]">
      <PageHeader
        title="Hi, there 👋"
        subtitle="Saturday Normal Library"
        accent
        right={
          <button type="button" onClick={() => { logoutUser(); setAdminMode(false); }} className="w-8 h-8 rounded-xl bg-[#0a3d39] border border-[rgba(255,220,115,0.12)] flex items-center justify-center text-[#8fa8a5] active:scale-95">
            <LogOut size={15} />
          </button>
        }
      />

      <div className="px-4 pt-6 pb-24 flex flex-col gap-5">
        {/* Announcements */}
        {pinnedAnnouncements.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Bell size={14} className="text-[#FFDC73]" />
              <h2 className="text-[#F8F8FF] text-sm font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Announcements</h2>
            </div>
            <div className="flex flex-col gap-2">
              {pinnedAnnouncements.map((a) => (
                <Card key={a.id} className="border-l-2 border-l-[#FFDC73]">
                  <p className="text-[#F8F8FF] text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{a.title}</p>
                  <p className="text-[#8fa8a5] text-xs mt-1 leading-relaxed">{a.content}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Next Session */}
        {nextSession && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={14} className="text-[#FFDC73]" />
              <h2 className="text-[#F8F8FF] text-sm font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Next Session</h2>
            </div>
            <Card glow className="bg-gradient-to-br from-[#0a3d39] to-[#0d4a45]">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-[#FFDC73] text-xs font-semibold uppercase tracking-wide mb-1">{nextSession.topic}</p>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock size={12} className="text-[#8fa8a5]" />
                    <span className="text-[#F8F8FF] text-sm">{nextSession.date} · {nextSession.startTime}–{nextSession.endTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-[#8fa8a5]" />
                    <span className="text-[#8fa8a5] text-sm">{nextSession.location}</span>
                  </div>
                  {nextSession.notes && (
                    <p className="text-[#8fa8a5] text-xs mt-2 italic">{nextSession.notes}</p>
                  )}
                </div>
                <div className="bg-[#FFDC73]/10 border border-[#FFDC73]/20 rounded-xl px-2 py-1 ml-3">
                  <p className="text-[#FFDC73] text-xs font-bold">{nextSession.maxAttendees}</p>
                  <p className="text-[#8fa8a5] text-[10px]">spots</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* WAM Summary */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-[#FFDC73]" />
              <h2 className="text-[#F8F8FF] text-sm font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>WAM Overview</h2>
            </div>
            <button type="button" onClick={() => setActiveTab("wam")} className="flex items-center gap-1 text-[#FFDC73] text-xs font-semibold">
              Details <ChevronRight size={12} />
            </button>
          </div>
          <Card>
            {semesters.length > 0 ? (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[#FFDC73]/10 border border-[#FFDC73]/20">
                  <span className="text-xl font-black" style={{ color: "#FFDC73", fontFamily: "'Space Grotesk', sans-serif" }}>{semesters.length}</span>
                </div>
                <div>
                  <p className="text-[#F8F8FF] text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Semesters Tracked</p>
                  <p className="text-[#8fa8a5] text-xs">Go to WAM tab for full calculation</p>
                  <button type="button" onClick={() => setActiveTab("wam")} className="text-[#FFDC73] text-xs font-semibold mt-0.5">View WAM →</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#0d4a45] flex items-center justify-center">
                  <TrendingUp size={20} className="text-[#8fa8a5]" />
                </div>
                <div>
                  <p className="text-[#F8F8FF] text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>No WAM data yet</p>
                  <button type="button" onClick={() => setActiveTab("wam")} className="text-[#FFDC73] text-xs font-semibold mt-0.5">Add semesters →</button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Study Goals */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target size={14} className="text-[#FFDC73]" />
              <h2 className="text-[#F8F8FF] text-sm font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Study Goals</h2>
            </div>
            <button type="button" onClick={() => setShowGoalForm(!showGoalForm)} className="w-7 h-7 rounded-lg bg-[#FFDC73]/10 border border-[#FFDC73]/20 flex items-center justify-center text-[#FFDC73]">
              <Plus size={14} />
            </button>
          </div>

          {showGoalForm && (
            <Card className="mb-2">
              <div className="flex flex-col gap-2">
                <input type="text" placeholder="Semester (e.g. Sem 1 2025)" value={goalForm.semesterName} onChange={(e) => setGoalForm((f) => ({ ...f, semesterName: e.target.value }))} className="w-full bg-[#012E2B] border border-[rgba(255,220,115,0.12)] rounded-xl px-3 py-2.5 text-[#F8F8FF] text-sm placeholder-[#8fa8a5] outline-none focus:border-[#FFDC73]/40" />
                <div className="flex gap-2">
                  <input type="number" placeholder="Target WAM" value={goalForm.targetWAM} onChange={(e) => setGoalForm((f) => ({ ...f, targetWAM: e.target.value }))} className="flex-1 bg-[#012E2B] border border-[rgba(255,220,115,0.12)] rounded-xl px-3 py-2.5 text-[#F8F8FF] text-sm placeholder-[#8fa8a5] outline-none focus:border-[#FFDC73]/40" />
                  <input type="text" placeholder="Grade (HD)" value={goalForm.targetGrade} onChange={(e) => setGoalForm((f) => ({ ...f, targetGrade: e.target.value }))} className="flex-1 bg-[#012E2B] border border-[rgba(255,220,115,0.12)] rounded-xl px-3 py-2.5 text-[#F8F8FF] text-sm placeholder-[#8fa8a5] outline-none focus:border-[#FFDC73]/40" />
                </div>
                <input type="text" placeholder="Note (optional)" value={goalForm.note} onChange={(e) => setGoalForm((f) => ({ ...f, note: e.target.value }))} className="w-full bg-[#012E2B] border border-[rgba(255,220,115,0.12)] rounded-xl px-3 py-2.5 text-[#F8F8FF] text-sm placeholder-[#8fa8a5] outline-none focus:border-[#FFDC73]/40" />
                <div className="flex gap-2">
                  <button type="button" onClick={handleAddGoal}  className="flex-1 bg-[#FFDC73] text-[#012E2B] rounded-xl py-2.5 text-sm font-bold disabled:opacity-50" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    "Add Goal"
                  </button>
                  <button type="button" onClick={() => setShowGoalForm(false)} className="px-4 bg-[#0d4a45] text-[#8fa8a5] rounded-xl py-2.5 text-sm">Cancel</button>
                </div>
              </div>
            </Card>
          )}

          {goals.length === 0 ? (
            <Card><p className="text-[#8fa8a5] text-sm text-center py-2">No goals yet. Add your first study goal!</p></Card>
          ) : (
            <div className="flex flex-col gap-2">
              {goals.map((g) => (
                <Card key={g.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-[#F8F8FF] text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{g.semesterName}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[#FFDC73] text-xs font-bold">WAM {g.targetWAM}</span>
                        {g.targetGrade && <span className="text-[#8fa8a5] text-xs">{g.targetGrade}</span>}
                      </div>
                      {g.note && <p className="text-[#8fa8a5] text-xs mt-1 italic">{g.note}</p>}
                    </div>
                    <button type="button" onClick={() => removeGoal(g.id)} className="text-[#8fa8a5] p-1 active:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* My Photos */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Camera size={14} className="text-[#FFDC73]" />
            <h2 className="text-[#F8F8FF] text-sm font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>My Photos</h2>
            <span className="text-[#8fa8a5] text-xs">({myPhotos.length})</span>
          </div>

          {/* Upload */}
          <Card className="mb-3">
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            {photoPreview ? (
              <div className="flex flex-col gap-2">
                <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                  <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setPhotoPreview(null)} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white">
                    <X size={12} />
                  </button>
                </div>
                <input type="text" placeholder="Add a caption..." value={photoCaption} onChange={(e) => setPhotoCaption(e.target.value)} className="w-full bg-[#012E2B] border border-[rgba(255,220,115,0.12)] rounded-xl px-3 py-2 text-[#F8F8FF] text-sm placeholder-[#8fa8a5] outline-none" />
                <button type="button" onClick={handleUpload}  className="w-full bg-[#FFDC73] text-[#012E2B] rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  <Upload size={14} /> "Upload Photo"
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()} className="w-full border-2 border-dashed border-[rgba(255,220,115,0.2)] rounded-xl py-6 flex flex-col items-center gap-2 text-[#8fa8a5] active:border-[#FFDC73]/40">
                <Camera size={24} />
                <span className="text-sm">Tap to upload a photo</span>
              </button>
            )}
          </Card>

          {myPhotos.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {myPhotos.map((photo) => (
                <div key={photo.id} className="bg-[#0a3d39] border border-[rgba(255,220,115,0.12)] rounded-2xl overflow-hidden">
                  <button type="button" onClick={() => setLightbox(photo.src)} className="block w-full aspect-square overflow-hidden">
                    <img src={photo.src} alt={photo.caption || "photo"} className="w-full h-full object-cover" />
                  </button>
                  <div className="p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        photo.status === "approved" ? "bg-green-500/20 text-green-400" :
                        photo.status === "rejected" ? "bg-red-500/20 text-red-400" :
                        "bg-[#FFDC73]/10 text-[#FFDC73]"
                      }`}>
                        {photo.status === "approved" ? "Approved" : photo.status === "rejected" ? "Rejected" : "Pending"}
                      </span>
                      <button type="button" onClick={() => removeUserPhoto(photo.id)} className="text-[#8fa8a5] active:text-red-400">
                        <Trash2 size={12} />
                      </button>
                    </div>
                    {photo.caption && <p className="text-[#8fa8a5] text-[10px] truncate">{photo.caption}</p>}
                    {!submittedIds.has(photo.id) ? (
                      <button type="button" onClick={() => handleSubmit(photo)}  className="mt-1.5 w-full flex items-center justify-center gap-1 bg-[#012E2B] border border-[rgba(255,220,115,0.2)] rounded-lg py-1.5 text-[#FFDC73] text-[10px] font-bold disabled:opacity-50">
                        <Globe size={10} /> Submit to Gallery
                      </button>
                    ) : (
                      <div className="mt-1.5 w-full flex items-center justify-center gap-1 bg-green-500 rounded-lg py-1.5 text-white text-[10px] font-bold cursor-not-allowed">
                        <CheckCircle2 size={10} /> Submitted!
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95" onClick={() => setLightbox(null)}>
          <button type="button" onClick={() => setLightbox(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
            <X size={20} />
          </button>
          <img src={lightbox} alt="photo" className="max-w-[90vw] max-h-[85vh] rounded-2xl object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
