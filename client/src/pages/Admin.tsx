// Design: Dark Brutalism + Neon Accent — Admin Panel
// Brand: #012E2B bg, #FFDC73 accent
import { useState, useRef } from "react";
import {
  Bell, Calendar, Users, Image, Check, X, Trash2,
  Plus, Loader2, Upload, Camera, Eye, EyeOff, Pin, PinOff, FlaskConical, Link
} from "lucide-react";
import { trpc } from "../lib/trpc";
import { toast } from "sonner";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";

type AdminTab = "announcements" | "sessions" | "gallery" | "submissions";

export default function AdminPage() {
  const utils = trpc.useUtils();
  const [activeTab, setActiveTab] = useState<AdminTab>("announcements");

  // ─── Announcements ─────────────────────────────────────────────────────────
  const { data: announcements = [], isLoading: annLoading } = trpc.announcements.list.useQuery();
  const createAnnMut = trpc.announcements.create.useMutation({
    onSuccess: () => { utils.announcements.list.invalidate(); toast.success("Announcement created!"); setAnnForm({ title: "", content: "", pinned: false }); setShowAnnForm(false); },
    onError: () => toast.error("Failed to create announcement"),
  });
  const deleteAnnMut = trpc.announcements.delete.useMutation({
    onSuccess: () => { utils.announcements.list.invalidate(); toast.success("Deleted."); },
  });
  const updateAnnMut = trpc.announcements.update.useMutation({
    onSuccess: () => utils.announcements.list.invalidate(),
  });
  const [showAnnForm, setShowAnnForm] = useState(false);
  const [annForm, setAnnForm] = useState({ title: "", content: "", pinned: false });

  // ─── Sessions ──────────────────────────────────────────────────────────────
  const { data: sessions = [], isLoading: sessLoading } = trpc.sessions.list.useQuery();
  const createSessMut = trpc.sessions.create.useMutation({
    onSuccess: () => { utils.sessions.list.invalidate(); toast.success("Session created!"); setSessForm({ date: "", startTime: "", endTime: "", location: "", topic: "", maxAttendees: "50", notes: "" }); setShowSessForm(false); },
    onError: () => toast.error("Failed to create session"),
  });
  const deleteSessMut = trpc.sessions.delete.useMutation({
    onSuccess: () => { utils.sessions.list.invalidate(); toast.success("Deleted."); },
  });
  const [showSessForm, setShowSessForm] = useState(false);
  const [sessForm, setSessForm] = useState({ date: "", startTime: "", endTime: "", location: "", topic: "", maxAttendees: "50", notes: "" });

  // ─── Gallery ───────────────────────────────────────────────────────────────
  const { data: allGallery = [], isLoading: galLoading } = trpc.gallery.listAll.useQuery();
  const uploadGalMut = trpc.gallery.upload.useMutation({
    onSuccess: () => { utils.gallery.listAll.invalidate(); utils.gallery.list.invalidate(); toast.success("Photo uploaded!"); setGalPreview(null); setGalCaption(""); if (galFileRef.current) galFileRef.current.value = ""; },
    onError: () => toast.error("Upload failed"),
  });
  const toggleVisMut = trpc.gallery.toggleVisibility.useMutation({
    onSuccess: () => { utils.gallery.listAll.invalidate(); utils.gallery.list.invalidate(); },
  });
  const deleteGalMut = trpc.gallery.delete.useMutation({
    onSuccess: () => { utils.gallery.listAll.invalidate(); utils.gallery.list.invalidate(); toast.success("Deleted."); },
  });
  const seedDefaultMut = trpc.gallery.seedDefault.useMutation({
    onSuccess: (data) => { utils.gallery.listAll.invalidate(); utils.gallery.list.invalidate(); toast.success(`Added ${data.count} SNL photos!`); },
    onError: () => toast.error("Failed to seed photos"),
  });
  const addByUrlMut = trpc.gallery.addByUrl.useMutation({
    onSuccess: () => { utils.gallery.listAll.invalidate(); utils.gallery.list.invalidate(); toast.success("Photo added!"); setUrlInput(""); setUrlCaption(""); setShowUrlForm(false); },
    onError: () => toast.error("Failed to add photo by URL"),
  });
  const [galPreview, setGalPreview] = useState<string | null>(null);
  const [galCaption, setGalCaption] = useState("");
  const galFileRef = useRef<HTMLInputElement>(null);
  const [showUrlForm, setShowUrlForm] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlCaption, setUrlCaption] = useState("");

  // ─── User Submissions ──────────────────────────────────────────────────────
  const { data: allUserPhotos = [], isLoading: subLoading } = trpc.userPhotos.allPhotos.useQuery();
  const updateStatusMut = trpc.userPhotos.updateStatus.useMutation({
    onSuccess: () => { utils.userPhotos.allPhotos.invalidate(); utils.gallery.list.invalidate(); toast.success("Status updated!"); },
    onError: () => toast.error("Failed to update status"),
  });

  const pendingPhotos = allUserPhotos.filter((p) => p.submitted && p.status === "pending");

  const handleGalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setGalPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleGalUpload = () => {
    if (!galPreview) return;
    const base64 = galPreview.replace(/^data:[^;]+;base64,/, "");
    const mimeMatch = galPreview.match(/^data:([^;]+);/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
    uploadGalMut.mutate({ base64, caption: galCaption || undefined, mimeType });
  };

  const tabs: { key: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: "announcements", label: "Announce", icon: <Bell size={14} /> },
    { key: "sessions", label: "Sessions", icon: <Calendar size={14} /> },
    { key: "gallery", label: "Gallery", icon: <Image size={14} /> },
    { key: "submissions", label: "Submissions", icon: <Users size={14} />, badge: pendingPhotos.length },
  ];

  return (
    <div className="page-container bg-[#012E2B]">
      <PageHeader title="Admin Panel" subtitle="Manage SNL content" accent />

      <div className="px-4 pt-2 pb-4 flex flex-col gap-4">
        {/* Tab Bar */}
        <div className="flex gap-1 bg-[#0a3d39] rounded-2xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold transition-colors relative ${
                activeTab === tab.key ? "bg-[#FFDC73] text-[#012E2B]" : "text-[#8fa8a5]"
              }`}
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.badge != null && tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─── Announcements ─── */}
        {activeTab === "announcements" && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-[#F8F8FF] text-sm font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Announcements
              </h2>
              <button
                type="button"
                onClick={() => setShowAnnForm(!showAnnForm)}
                className="flex items-center gap-1.5 bg-[#FFDC73]/10 border border-[#FFDC73]/20 text-[#FFDC73] rounded-xl px-3 py-1.5 text-xs font-bold"
              >
                <Plus size={12} /> New
              </button>
            </div>

            {showAnnForm && (
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
                      onClick={() => createAnnMut.mutate(annForm)}
                      disabled={createAnnMut.isPending || !annForm.title || !annForm.content}
                      className="flex-1 bg-[#FFDC73] text-[#012E2B] rounded-xl py-2.5 text-sm font-bold disabled:opacity-50"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {createAnnMut.isPending ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Post"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAnnForm(false)}
                      className="px-4 bg-[#0d4a45] text-[#8fa8a5] rounded-xl text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </Card>
            )}

            {annLoading ? (
              <div className="flex justify-center py-4"><Loader2 size={24} className="text-[#FFDC73] animate-spin" /></div>
            ) : announcements.length === 0 ? (
              <Card><p className="text-[#8fa8a5] text-sm text-center py-2">No announcements yet.</p></Card>
            ) : (
              <div className="flex flex-col gap-2">
                {announcements.map((ann) => (
                  <Card key={ann.id} className={ann.pinned ? "border-l-2 border-l-[#FFDC73]" : ""}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {ann.pinned && <span className="text-[#FFDC73] text-[10px] font-bold">📌 PINNED</span>}
                          <p className="text-[#F8F8FF] text-sm font-semibold truncate" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            {ann.title}
                          </p>
                        </div>
                        <p className="text-[#8fa8a5] text-xs leading-relaxed line-clamp-2">{ann.content}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateAnnMut.mutate({ id: ann.id, pinned: !ann.pinned })}
                          className="text-[#8fa8a5] p-1 active:text-[#FFDC73]"
                        >
                          {ann.pinned ? <PinOff size={13} /> : <Pin size={13} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteAnnMut.mutate({ id: ann.id })}
                          className="text-[#8fa8a5] p-1 active:text-red-400"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* ─── Sessions ─── */}
        {activeTab === "sessions" && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-[#F8F8FF] text-sm font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Study Sessions
              </h2>
              <button
                type="button"
                onClick={() => setShowSessForm(!showSessForm)}
                className="flex items-center gap-1.5 bg-[#FFDC73]/10 border border-[#FFDC73]/20 text-[#FFDC73] rounded-xl px-3 py-1.5 text-xs font-bold"
              >
                <Plus size={12} /> New
              </button>
            </div>

            {showSessForm && (
              <Card>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="Topic"
                    value={sessForm.topic}
                    onChange={(e) => setSessForm((f) => ({ ...f, topic: e.target.value }))}
                    className="w-full bg-[#012E2B] border border-[rgba(255,220,115,0.12)] rounded-xl px-3 py-2.5 text-[#F8F8FF] text-sm placeholder-[#8fa8a5] outline-none"
                  />
                  <input
                    type="date"
                    value={sessForm.date}
                    onChange={(e) => setSessForm((f) => ({ ...f, date: e.target.value }))}
                    className="w-full bg-[#012E2B] border border-[rgba(255,220,115,0.12)] rounded-xl px-3 py-2.5 text-[#F8F8FF] text-sm outline-none"
                  />
                  <div className="flex gap-2">
                    <input
                      type="time"
                      value={sessForm.startTime}
                      onChange={(e) => setSessForm((f) => ({ ...f, startTime: e.target.value }))}
                      className="flex-1 bg-[#012E2B] border border-[rgba(255,220,115,0.12)] rounded-xl px-3 py-2.5 text-[#F8F8FF] text-sm outline-none"
                    />
                    <input
                      type="time"
                      value={sessForm.endTime}
                      onChange={(e) => setSessForm((f) => ({ ...f, endTime: e.target.value }))}
                      className="flex-1 bg-[#012E2B] border border-[rgba(255,220,115,0.12)] rounded-xl px-3 py-2.5 text-[#F8F8FF] text-sm outline-none"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Location"
                    value={sessForm.location}
                    onChange={(e) => setSessForm((f) => ({ ...f, location: e.target.value }))}
                    className="w-full bg-[#012E2B] border border-[rgba(255,220,115,0.12)] rounded-xl px-3 py-2.5 text-[#F8F8FF] text-sm placeholder-[#8fa8a5] outline-none"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Max attendees"
                      value={sessForm.maxAttendees}
                      onChange={(e) => setSessForm((f) => ({ ...f, maxAttendees: e.target.value }))}
                      className="flex-1 bg-[#012E2B] border border-[rgba(255,220,115,0.12)] rounded-xl px-3 py-2.5 text-[#F8F8FF] text-sm placeholder-[#8fa8a5] outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Notes (optional)"
                      value={sessForm.notes}
                      onChange={(e) => setSessForm((f) => ({ ...f, notes: e.target.value }))}
                      className="flex-1 bg-[#012E2B] border border-[rgba(255,220,115,0.12)] rounded-xl px-3 py-2.5 text-[#F8F8FF] text-sm placeholder-[#8fa8a5] outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => createSessMut.mutate({
                        topic: sessForm.topic,
                        date: sessForm.date,
                        startTime: sessForm.startTime,
                        endTime: sessForm.endTime,
                        location: sessForm.location,
                        maxAttendees: parseInt(sessForm.maxAttendees) || 50,
                        notes: sessForm.notes || undefined,
                      })}
                      disabled={createSessMut.isPending || !sessForm.topic || !sessForm.date}
                      className="flex-1 bg-[#FFDC73] text-[#012E2B] rounded-xl py-2.5 text-sm font-bold disabled:opacity-50"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {createSessMut.isPending ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Create"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSessForm(false)}
                      className="px-4 bg-[#0d4a45] text-[#8fa8a5] rounded-xl text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </Card>
            )}

            {sessLoading ? (
              <div className="flex justify-center py-4"><Loader2 size={24} className="text-[#FFDC73] animate-spin" /></div>
            ) : sessions.length === 0 ? (
              <Card><p className="text-[#8fa8a5] text-sm text-center py-2">No sessions yet.</p></Card>
            ) : (
              <div className="flex flex-col gap-2">
                {sessions.map((sess) => (
                  <Card key={sess.id}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-[#FFDC73] text-xs font-bold uppercase tracking-wide mb-1">{sess.topic}</p>
                        <p className="text-[#F8F8FF] text-sm">{sess.date} · {sess.startTime}–{sess.endTime}</p>
                        <p className="text-[#8fa8a5] text-xs mt-0.5">{sess.location} · {sess.maxAttendees} spots</p>
                        {sess.notes && <p className="text-[#8fa8a5] text-xs mt-1 italic">{sess.notes}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteSessMut.mutate({ id: sess.id })}
                        className="text-[#8fa8a5] p-1 active:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* ─── Gallery ─── */}
        {activeTab === "gallery" && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-[#F8F8FF] text-sm font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Gallery ({allGallery.length})
              </h2>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (allGallery.length > 0) {
                      if (!confirm("This will add 37 SNL photos to the gallery. Continue?")) return;
                    }
                    seedDefaultMut.mutate();
                  }}
                  disabled={seedDefaultMut.isPending}
                  className="flex items-center gap-1 bg-[#0a3d39] border border-[rgba(255,220,115,0.2)] text-[#FFDC73] rounded-xl px-2.5 py-1.5 text-xs font-bold disabled:opacity-50"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  <FlaskConical size={11} />
                  {seedDefaultMut.isPending ? "..." : "SNL Photos"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUrlForm(!showUrlForm)}
                  className="flex items-center gap-1 bg-[#0a3d39] border border-[rgba(255,220,115,0.2)] text-[#FFDC73] rounded-xl px-2.5 py-1.5 text-xs font-bold"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  <Link size={11} /> URL
                </button>
              </div>
            </div>

            {/* URL Add Form */}
            {showUrlForm && (
              <Card>
                <div className="flex flex-col gap-2">
                  <input
                    type="url"
                    placeholder="Image URL (https://...)"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full bg-[#012E2B] border border-[rgba(255,220,115,0.12)] rounded-xl px-3 py-2 text-[#F8F8FF] text-sm placeholder-[#8fa8a5] outline-none focus:border-[#FFDC73]/40"
                  />
                  <input
                    type="text"
                    placeholder="Caption (optional)"
                    value={urlCaption}
                    onChange={(e) => setUrlCaption(e.target.value)}
                    className="w-full bg-[#012E2B] border border-[rgba(255,220,115,0.12)] rounded-xl px-3 py-2 text-[#F8F8FF] text-sm placeholder-[#8fa8a5] outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => addByUrlMut.mutate({ url: urlInput, caption: urlCaption || undefined })}
                      disabled={addByUrlMut.isPending || !urlInput}
                      className="flex-1 bg-[#FFDC73] text-[#012E2B] rounded-xl py-2 text-xs font-bold disabled:opacity-50"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {addByUrlMut.isPending ? "Adding..." : "Add Photo"}
                    </button>
                    <button type="button" onClick={() => setShowUrlForm(false)}
                      className="px-4 bg-[#0d4a45] text-[#8fa8a5] rounded-xl py-2 text-xs">
                      Cancel
                    </button>
                  </div>
                </div>
              </Card>
            )}

            {/* Upload */}
            <Card>
              <input ref={galFileRef} type="file" accept="image/*" onChange={handleGalFileChange} className="hidden" />
              {galPreview ? (
                <div className="flex flex-col gap-2">
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                    <img src={galPreview} alt="preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setGalPreview(null)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Caption (optional)"
                    value={galCaption}
                    onChange={(e) => setGalCaption(e.target.value)}
                    className="w-full bg-[#012E2B] border border-[rgba(255,220,115,0.12)] rounded-xl px-3 py-2 text-[#F8F8FF] text-sm placeholder-[#8fa8a5] outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleGalUpload}
                    disabled={uploadGalMut.isPending}
                    className="w-full bg-[#FFDC73] text-[#012E2B] rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {uploadGalMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <><Upload size={14} /> Upload to Gallery</>}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => galFileRef.current?.click()}
                  className="w-full border-2 border-dashed border-[rgba(255,220,115,0.2)] rounded-xl py-5 flex flex-col items-center gap-2 text-[#8fa8a5] active:border-[#FFDC73]/40"
                >
                  <Camera size={20} />
                  <span className="text-sm">Upload admin photo</span>
                </button>
              )}
            </Card>

            {galLoading ? (
              <div className="flex justify-center py-4"><Loader2 size={24} className="text-[#FFDC73] animate-spin" /></div>
            ) : allGallery.length === 0 ? (
              <Card><p className="text-[#8fa8a5] text-sm text-center py-2">No gallery photos yet.</p></Card>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {allGallery.map((photo) => (
                  <div
                    key={photo.id}
                    className={`bg-[#0a3d39] border rounded-2xl overflow-hidden ${
                      photo.visible ? "border-[rgba(255,220,115,0.12)]" : "border-red-500/20 opacity-60"
                    }`}
                  >
                    <div className="aspect-square overflow-hidden">
                      <img src={photo.src} alt={photo.caption ?? "gallery"} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-2 flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        photo.visible ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                      }`}>
                        {photo.visible ? "Visible" : "Hidden"}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleVisMut.mutate({ id: photo.id, visible: !photo.visible })}
                          className="text-[#8fa8a5] active:text-[#FFDC73]"
                        >
                          {photo.visible ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteGalMut.mutate({ id: photo.id })}
                          className="text-[#8fa8a5] active:text-red-400"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ─── Submissions ─── */}
        {activeTab === "submissions" && (
          <>
            <h2 className="text-[#F8F8FF] text-sm font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              User Submissions
              {pendingPhotos.length > 0 && (
                <span className="ml-2 text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                  {pendingPhotos.length} pending
                </span>
              )}
            </h2>

            {subLoading ? (
              <div className="flex justify-center py-4"><Loader2 size={24} className="text-[#FFDC73] animate-spin" /></div>
            ) : allUserPhotos.filter((p) => p.submitted).length === 0 ? (
              <Card><p className="text-[#8fa8a5] text-sm text-center py-2">No submissions yet.</p></Card>
            ) : (
              <div className="flex flex-col gap-2">
                {allUserPhotos.filter((p) => p.submitted).map((photo) => (
                  <Card key={photo.id}>
                    <div className="flex gap-3">
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                        <img src={photo.src} alt={photo.caption ?? "submission"} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {photo.caption && (
                          <p className="text-[#F8F8FF] text-xs font-semibold truncate mb-1">{photo.caption}</p>
                        )}
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            photo.status === "approved"
                              ? "bg-green-500/20 text-green-400"
                              : photo.status === "rejected"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-[#FFDC73]/10 text-[#FFDC73]"
                          }`}
                        >
                          {photo.status}
                        </span>
                        {photo.status === "pending" && (
                          <div className="flex gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => updateStatusMut.mutate({ id: photo.id, status: "approved" })}
                              disabled={updateStatusMut.isPending}
                              className="flex-1 flex items-center justify-center gap-1 bg-green-500/20 border border-green-500/30 rounded-lg py-1.5 text-green-400 text-xs font-bold disabled:opacity-50"
                            >
                              <Check size={10} /> Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => updateStatusMut.mutate({ id: photo.id, status: "rejected" })}
                              disabled={updateStatusMut.isPending}
                              className="flex-1 flex items-center justify-center gap-1 bg-red-500/20 border border-red-500/30 rounded-lg py-1.5 text-red-400 text-xs font-bold disabled:opacity-50"
                            >
                              <X size={10} /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
