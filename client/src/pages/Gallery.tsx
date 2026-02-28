// Design: Dark Brutalism + Neon Accent — Gallery
// Brand: #012E2B bg, #FFDC73 accent
import { useState, useRef } from "react";
import { Camera, Upload, Globe, CheckCircle2, X, Trash2, Loader2, Image } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import { useAdminStore } from "../stores/adminStore";
import { useUserStore } from "../stores/userStore";

export default function GalleryPage() {
  const { galleryPhotos } = useAdminStore();
  const { userPhotos, currentUserId, addUserPhoto, removeUserPhoto, markPhotoSubmitted } = useUserStore();
  const myPhotos = userPhotos.filter((p) => p.userId === currentUserId);
  const galleryLoading = false;
  const myPhotosLoading = false;

  // Gallery photos (approved, visible)
  // My uploaded photos




  const [activeTab, setActiveTab] = useState<"gallery" | "my">("gallery");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoCaption, setPhotoCaption] = useState("");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max file size is 5MB");
      return;
    }
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

  return (
    <div className="page-container bg-[#012E2B]">
      <PageHeader
        title="Gallery"
        subtitle="SNL Study Moments"
        accent
      />

      <div className="px-4 pt-2 pb-4 flex flex-col gap-4">
        {/* Tabs */}
        <div className="flex gap-2 bg-[#0a3d39] rounded-2xl p-1">
          <button
            type="button"
            onClick={() => setActiveTab("gallery")}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${
              activeTab === "gallery"
                ? "bg-[#FFDC73] text-[#012E2B]"
                : "text-[#8fa8a5]"
            }`}
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Gallery
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("my")}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${
              activeTab === "my"
                ? "bg-[#FFDC73] text-[#012E2B]"
                : "text-[#8fa8a5]"
            }`}
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            My Photos
          </button>
        </div>

        {/* Gallery Tab */}
        {activeTab === "gallery" && (
          <>
            {galleryLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 size={32} className="text-[#FFDC73] animate-spin" />
              </div>
            ) : galleryPhotos.length === 0 ? (
              <Card>
                <div className="flex flex-col items-center gap-3 py-6">
                  <Image size={32} className="text-[#8fa8a5]" />
                  <p className="text-[#8fa8a5] text-sm text-center">
                    No photos yet.<br />Be the first to share a study moment!
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {galleryPhotos.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => setLightbox(photo.src)}
                    className="bg-[#0a3d39] border border-[rgba(255,220,115,0.12)] rounded-2xl overflow-hidden aspect-square"
                  >
                    <img
                      src={photo.src}
                      alt={photo.caption ?? "gallery photo"}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* My Photos Tab */}
        {activeTab === "my" && (
          <>
            {/* Upload Section */}
            <Card>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {photoPreview ? (
                <div className="flex flex-col gap-2">
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                    <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotoPreview(null)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Add a caption..."
                    value={photoCaption}
                    onChange={(e) => setPhotoCaption(e.target.value)}
                    className="w-full bg-[#012E2B] border border-[rgba(255,220,115,0.12)] rounded-xl px-3 py-2 text-[#F8F8FF] text-sm placeholder-[#8fa8a5] outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={false}
                    className="w-full bg-[#FFDC73] text-[#012E2B] rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {false ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <><Upload size={14} /> Upload Photo</>
                    )}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-[rgba(255,220,115,0.2)] rounded-xl py-6 flex flex-col items-center gap-2 text-[#8fa8a5] active:border-[#FFDC73]/40"
                >
                  <Camera size={24} />
                  <span className="text-sm">Tap to upload a photo</span>
                  <span className="text-xs text-[#8fa8a5]/60">Max 5MB</span>
                </button>
              )}
            </Card>

            {/* My Photos Grid */}
            {myPhotosLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 size={24} className="text-[#FFDC73] animate-spin" />
              </div>
            ) : myPhotos.length === 0 ? (
              <Card>
                <p className="text-[#8fa8a5] text-sm text-center py-2">
                  No photos uploaded yet.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {myPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="bg-[#0a3d39] border border-[rgba(255,220,115,0.12)] rounded-2xl overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setLightbox(photo.src)}
                      className="block w-full aspect-square overflow-hidden"
                    >
                      <img
                        src={photo.src}
                        alt={photo.caption ?? "photo"}
                        className="w-full h-full object-cover"
                      />
                    </button>
                    <div className="p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            photo.status === "approved"
                              ? "bg-green-500/20 text-green-400"
                              : photo.status === "rejected"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-[#FFDC73]/10 text-[#FFDC73]"
                          }`}
                        >
                          {photo.status === "approved"
                            ? "Approved"
                            : photo.status === "rejected"
                            ? "Rejected"
                            : "Pending"}
                        </span>
                        <button
                          type="button"
                          onClick={() => { removeUserPhoto(photo.id); toast.success("Photo deleted"); }}
                          className="text-[#8fa8a5] active:text-red-400"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      {photo.caption && (
                        <p className="text-[#8fa8a5] text-[10px] truncate">{photo.caption}</p>
                      )}
                      {!photo.submitted ? (
                        <button
                          type="button"
          onClick={() => { markPhotoSubmitted(photo.id); toast.success("Submitted to gallery!"); }}
          disabled={false}
                          className="mt-1.5 w-full flex items-center justify-center gap-1 bg-[#012E2B] border border-[rgba(255,220,115,0.2)] rounded-lg py-1.5 text-[#FFDC73] text-[10px] font-bold disabled:opacity-50"
                        >
                          <Globe size={10} /> Submit to Gallery
                        </button>
                      ) : (
                        <div className="mt-1.5 w-full flex items-center justify-center gap-1 bg-green-500/20 border border-green-500/30 rounded-lg py-1.5 text-green-400 text-[10px] font-bold">
                          <CheckCircle2 size={10} /> Submitted!
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
          >
            <X size={20} />
          </button>
          <img
            src={lightbox}
            alt="photo"
            className="max-w-[90vw] max-h-[85vh] rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
