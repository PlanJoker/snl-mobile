// Design: Dark Brutalism + Neon Accent — Admin Panel
// Brand: #012E2B bg, #FFDC73 accent, Space Grotesk headers
import { useState, useRef } from "react";
import { Plus, Trash2, Edit3, Check, X, Pin, Eye, EyeOff, Upload, Image, Bell, CalendarDays, CheckCircle2, XCircle, Clock, ShieldCheck, LogOut } from "lucide-react";
import { useAdminStore } from "../stores/adminStore";
import { useAppStore } from "../stores/appStore";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";

type AdminTab = "announcements" | "sessions" | "gallery" | "submissions";

export default function AdminPage() {
  const {
    announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement,
    sessions, addSession, updateSession, deleteSession,
    galleryPhotos, addGalleryPhoto, deleteGalleryPhoto, togglePhotoVisibility, updatePhotoCaption,
    userSubmittedPhotos, reviewUserPhoto,
  } = useAdminStore();
  const { setAdminMode, setActiveTab } = useAppStore();

  const [activeTab, setTab] = useState<AdminTab>("announcements");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [showAddAnn, setShowAddAnn] = useState(false);
  const [annForm, setAnnForm] = useState({ title: "", content: "", pinned: false });
  const [showAddSession, setShowAddSession] = useState(false);
  const [sessionForm, setSessionForm] = useState({ date: "", startTime: "13:00", endTime: "17:00", location: "oSpace Brunswick", topic: "", maxAttendees: "30", notes: "" });
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadCaption, setUploadCaption] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const pendingCount = userSubmittedPhotos.filter((p) => p.status === "pending").length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setUploadPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleAddPhoto = () => {
    if (!uploadPreview) return;
    addGalleryPhoto({ src: uploadPreview, caption: uploadCaption, visible: true, source: "admin" });
    setUploadPreview(null);
    setUploadCaption("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleLogout = () => {
    setAdminMode(false);
    setActiveTab("home");
  };

  const TABS: { id: AdminTab; label: string; badge?: number }[] = [
    { id: "announcements", label: "Notices" },
    { id: "sessions", label: "Sessions" },
    { id: "gallery", label: "Gallery" },
    { id: "submissions", label: "Submissions", badge: pendingCount },
  ];

  return (
    <div className="page-container bg-[#012E2B]">
      <PageHeader
        title="Admin Panel"
        subtitle="SNL Study Management"
        accent
        right={
          <button type="button" onClick={handleLogout} className="flex items-center gap-1.5 bg-[#0a3d39] border border-[rgba(255,220,115,0.12)] text-[#8fa8a5] rounded-xl px-3 py-1.5 text-xs font-semibold">
            <LogOut size={12} /> Exit
          </button>
        }
      />

      {/* Admin badge */}
      <div className="px-4 pt-2">
        <div className="flex items-center gap-2 bg-[#FFDC73]/10 border border-[#FFDC73]/20 rounded-xl px-3 py-2 mb-3">
          <ShieldCheck size={14} className="text-[#FFDC73]" />
          <span className="text-[#FFDC73] text-xs font-semibold">Administrator Mode</span>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="px-4 mb-4">
        <div className="flex bg-[#0a3d39] rounded-xl p-1 gap-0.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all relative ${
                activeTab === t.id ? "bg-[#FFDC73] text-[#012E2B]" : "text-[#8fa8a5]"
              }`}
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {t.label}
              {t.badge !== undefined && t.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-4 flex flex-col gap-3">
        {/* ── Announcements ── */}
        {activeTab === "announcements" && (
          <>
            <button
              type="button"
              onClick={() => setShowAddAnn(!showAddAnn)}
              className="flex items-center gap-2 bg-[#FFDC73] text-[#012E2B] rounded-xl px-4 py-2.5 text-sm font-bold self-start"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <Plus size={14} /> New Announcement
            </button>

            {showAddAnn && (
              <Card>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="Title"
                    value={annForm.title}
                    onChange={(e) => setAnnForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full bg-[#012E2B] border border-[rgba(255,220,115,0.12)] rounded-xl px-3 py-2.5 text-[#F8F8FF] text-sm placeholder-[#8fa8a5] outline-none focus:border-[#FFDC73]/40"
                  />
                  <textarea
                    placeholder="Content"
                    value={annForm.content}
                    onChange={(e) => setAnnForm((f) => ({ ...f, content: e.target.value }))}
                    rows={3}
                    className="w-full bg-[#012E2B] border border-[rgba(255,220,115,0.12)] rounded-xl px-3 py-2.5 text-[#F8F8FF] text-sm placeholder-[#8fa8a5] outline-none focus:border-[#FFDC73]/40 resize-none"
                  />
                  <label className="flex items-center gap-2 text-[#8fa8a5] text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={annForm.pinned}
                      onChange={(e) => setAnnForm((f) => ({ ...f, pinned: e.target.checked }))}
                      className="accent-[#FFDC73]"
                    />
                    Pin announcement
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!annForm.title) return;
                        addAnnouncement({ title: annForm.title, content: annForm.content, pinned: annForm.pinned });
                        setAnnForm({ title: "", content: "", pinned: false });
                        setShowAddAnn(false);
                      }}
                      className="flex-1 bg-[#FFDC73] text-[#012E2B] rounded-xl py-2.5 text-sm font-bold"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      Post
                    </button>
                    <button type="button" onClick={() => setShowAddAnn(false)} className="px-4 bg-[#0d4a45] text-[#8fa8a5] rounded-xl py-2.5 text-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              </Card>
            )}

            {announcements.map((a) => (
              <Card key={a.id} className={a.pinned ? "border-l-2 border-l-[#FFDC73]" : ""}>
                {editingId === a.id ? (
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={editForm.title ?? a.title}
                      onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                      className="w-full bg-[#012E2B] border border-[rgba(255,220,115,0.12)] rounded-xl px-3 py-2 text-[#F8F8FF] text-sm outline-none"
                    />
                    <textarea
                      value={editForm.content ?? a.content}
                      onChange={(e) => setEditForm((f) => ({ ...f, content: e.target.value }))}
                      rows={3}
                      className="w-full bg-[#012E2B] border border-[rgba(255,220,115,0.12)] rounded-xl px-3 py-2 text-[#F8F8FF] text-sm outline-none resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          updateAnnouncement(a.id, { title: editForm.title ?? a.title, content: editForm.content ?? a.content });
                          setEditingId(null);
                        }}
                        className="flex-1 bg-[#FFDC73] text-[#012E2B] rounded-xl py-2 text-sm font-bold"
                      >
                        Save
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} className="px-4 bg-[#0d4a45] text-[#8fa8a5] rounded-xl py-2 text-sm">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        {a.pinned && <Pin size={11} className="text-[#FFDC73] shrink-0" />}
                        <p className="text-[#F8F8FF] text-sm font-semibold truncate" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{a.title}</p>
                      </div>
                      <p className="text-[#8fa8a5] text-xs leading-relaxed">{a.content}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button type="button" onClick={() => { setEditingId(a.id); setEditForm({ title: a.title, content: a.content }); }} className="text-[#8fa8a5] p-1">
                        <Edit3 size={13} />
                      </button>
                      <button type="button" onClick={() => updateAnnouncement(a.id, { pinned: !a.pinned })} className={`p-1 ${a.pinned ? "text-[#FFDC73]" : "text-[#8fa8a5]"}`}>
                        <Pin size={13} />
                      </button>
                      <button type="button" onClick={() => deleteAnnouncement(a.id)} className="text-[#8fa8a5] p-1 active:text-red-400">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </>
        )}

        {/* ── Sessions ── */}
        {activeTab === "sessions" && (
          <>
            <button
              type="button"
              onClick={() => setShowAddSession(!showAddSession)}
              className="flex items-center gap-2 bg-[#FFDC73] text-[#012E2B] rounded-xl px-4 py-2.5 text-sm font-bold self-start"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <Plus size={14} /> New Session
            </button>

            {showAddSession && (
              <Card>
                <div className="flex flex-col gap-2">
                  <input type="date" value={sessionForm.date} onChange={(e) => setSessionForm((f) => ({ ...f, date: e.target.value }))}
                    className="w-full bg-[#012E2B] border border-[rgba(255,220,115,0.12)] rounded-xl px-3 py-2.5 text-[#F8F8FF] text-sm outline-none focus:border-[#FFDC73]/40" />
                  <div className="flex gap-2">
                    <input type="time" value={sessionForm.startTime} onChange={(e) => setSessionForm((f) => ({ ...f, startTime: e.target.value }))}
                      className="flex-1 bg-[#012E2B] border border-[rgba(255,220,115,0.12)] rounded-xl px-3 py-2.5 text-[#F8F8FF] text-sm outline-none" />
                    <input type="time" value={sessionForm.endTime} onChange={(e) => setSessionForm((f) => ({ ...f, endTime: e.target.value }))}
                      className="flex-1 bg-[#012E2B] border border-[rgba(255,220,115,0.12)] rounded-xl px-3 py-2.5 text-[#F8F8FF] text-sm outline-none" />
                  </div>
                  <input type="text" placeholder="Location" value={sessionForm.location} onChange={(e) => setSessionForm((f) => ({ ...f, location: e.target.value }))}
                    className="w-full bg-[#012E2B] border border-[rgba(255,220,115,0.12)] rounded-xl px-3 py-2.5 text-[#F8F8FF] text-sm placeholder-[#8fa8a5] outline-none" />
                  <input type="text" placeholder="Topic" value={sessionForm.topic} onChange={(e) => setSessionForm((f) => ({ ...f, topic: e.target.value }))}
                    className="w-full bg-[#012E2B] border border-[rgba(255,220,115,0.12)] rounded-xl px-3 py-2.5 text-[#F8F8FF] text-sm placeholder-[#8fa8a5] outline-none" />
                  <div className="flex gap-2">
                    <input type="number" placeholder="Max attendees" value={sessionForm.maxAttendees} onChange={(e) => setSessionForm((f) => ({ ...f, maxAttendees: e.target.value }))}
                      className="flex-1 bg-[#012E2B] border border-[rgba(255,220,115,0.12)] rounded-xl px-3 py-2.5 text-[#F8F8FF] text-sm placeholder-[#8fa8a5] outline-none" />
                  </div>
                  <textarea placeholder="Notes" value={sessionForm.notes} onChange={(e) => setSessionForm((f) => ({ ...f, notes: e.target.value }))} rows={2}
                    className="w-full bg-[#012E2B] border border-[rgba(255,220,115,0.12)] rounded-xl px-3 py-2.5 text-[#F8F8FF] text-sm placeholder-[#8fa8a5] outline-none resize-none" />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => {
                      if (!sessionForm.date) return;
                      addSession({ date: sessionForm.date, startTime: sessionForm.startTime, endTime: sessionForm.endTime, location: sessionForm.location, topic: sessionForm.topic, maxAttendees: parseInt(sessionForm.maxAttendees) || 30, notes: sessionForm.notes });
                      setSessionForm({ date: "", startTime: "13:00", endTime: "17:00", location: "oSpace Brunswick", topic: "", maxAttendees: "30", notes: "" });
                      setShowAddSession(false);
                    }} className="flex-1 bg-[#FFDC73] text-[#012E2B] rounded-xl py-2.5 text-sm font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Add Session
                    </button>
                    <button type="button" onClick={() => setShowAddSession(false)} className="px-4 bg-[#0d4a45] text-[#8fa8a5] rounded-xl py-2.5 text-sm">Cancel</button>
                  </div>
                </div>
              </Card>
            )}

            {sessions.map((s) => (
              <Card key={s.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-[#FFDC73] text-xs font-bold uppercase tracking-wide">{s.topic || "Study Session"}</p>
                    <p className="text-[#F8F8FF] text-sm font-semibold mt-0.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.date}</p>
                    <p className="text-[#8fa8a5] text-xs">{s.startTime} – {s.endTime} · {s.location}</p>
                    {s.notes && <p className="text-[#8fa8a5] text-xs mt-1 italic">{s.notes}</p>}
                    <p className="text-[#8fa8a5] text-xs mt-0.5">Max: {s.maxAttendees} attendees</p>
                  </div>
                  <button type="button" onClick={() => deleteSession(s.id)} className="text-[#8fa8a5] p-1 active:text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              </Card>
            ))}
          </>
        )}

        {/* ── Gallery ── */}
        {activeTab === "gallery" && (
          <>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 bg-[#FFDC73] text-[#012E2B] rounded-xl px-4 py-2.5 text-sm font-bold self-start"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <Upload size={14} /> Upload Photo
            </button>

            {uploadPreview && (
              <Card>
                <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-2">
                  <img src={uploadPreview} alt="preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setUploadPreview(null)} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white">
                    <X size={12} />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Caption (optional)"
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  className="w-full bg-[#012E2B] border border-[rgba(255,220,115,0.12)] rounded-xl px-3 py-2 text-[#F8F8FF] text-sm placeholder-[#8fa8a5] outline-none mb-2"
                />
                <button type="button" onClick={handleAddPhoto} className="w-full bg-[#FFDC73] text-[#012E2B] rounded-xl py-2.5 text-sm font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Add to Gallery
                </button>
              </Card>
            )}

            {galleryPhotos.length === 0 ? (
              <Card>
                <div className="flex flex-col items-center gap-2 py-4">
                  <Image size={28} className="text-[#8fa8a5]" />
                  <p className="text-[#8fa8a5] text-sm">No photos uploaded yet.</p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {galleryPhotos.map((p) => (
                  <div key={p.id} className="bg-[#0a3d39] border border-[rgba(255,220,115,0.12)] rounded-2xl overflow-hidden">
                    <div className="aspect-square overflow-hidden">
                      <img src={p.src} alt={p.caption} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-2">
                      <p className="text-[#8fa8a5] text-[10px] truncate mb-1">{p.caption || "No caption"}</p>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => togglePhotoVisibility(p.id)} className={`flex-1 flex items-center justify-center gap-1 rounded-lg py-1 text-[10px] font-semibold ${p.visible ? "bg-green-500/20 text-green-400" : "bg-[#0d4a45] text-[#8fa8a5]"}`}>
                          {p.visible ? <><Eye size={10} /> Visible</> : <><EyeOff size={10} /> Hidden</>}
                        </button>
                        <button type="button" onClick={() => deleteGalleryPhoto(p.id)} className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Submissions ── */}
        {activeTab === "submissions" && (
          <>
            <p className="text-[#8fa8a5] text-xs">{pendingCount} pending review</p>
            {userSubmittedPhotos.length === 0 ? (
              <Card>
                <div className="flex flex-col items-center gap-2 py-4">
                  <Image size={28} className="text-[#8fa8a5]" />
                  <p className="text-[#8fa8a5] text-sm">No submissions yet.</p>
                </div>
              </Card>
            ) : (
              userSubmittedPhotos.map((p) => (
                <Card key={p.id}>
                  <div className="flex gap-3">
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                      <img src={p.src} alt={p.caption} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#F8F8FF] text-sm font-semibold truncate" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{p.displayName}</p>
                      <p className="text-[#8fa8a5] text-xs">@{p.username}</p>
                      {p.caption && <p className="text-[#8fa8a5] text-xs mt-1 italic truncate">{p.caption}</p>}
                      <div className="flex items-center gap-1 mt-2">
                        {p.status === "pending" ? (
                          <>
                            <button type="button" onClick={() => reviewUserPhoto(p.id, "approved")} className="flex-1 flex items-center justify-center gap-1 bg-green-500/20 text-green-400 rounded-lg py-1.5 text-xs font-semibold">
                              <CheckCircle2 size={12} /> Approve
                            </button>
                            <button type="button" onClick={() => reviewUserPhoto(p.id, "rejected")} className="flex-1 flex items-center justify-center gap-1 bg-red-500/20 text-red-400 rounded-lg py-1.5 text-xs font-semibold">
                              <XCircle size={12} /> Reject
                            </button>
                          </>
                        ) : (
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.status === "approved" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                            {p.status === "approved" ? "✓ Approved" : "✗ Rejected"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
