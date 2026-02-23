import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: string;
}

export interface Session {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  topic: string;
  maxAttendees: number;
  notes: string;
}

export interface GalleryPhoto {
  id: string;
  src: string;
  caption: string;
  visible: boolean;
  uploadedAt: string;
  source?: "admin" | "user";
}

export interface SubmittedPhoto {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  src: string;
  caption: string;
  uploadedAt: string;
  status: "pending" | "approved" | "rejected";
}

const uid = () => Math.random().toString(36).slice(2, 10);

interface AdminStore {
  announcements: Announcement[];
  sessions: Session[];
  galleryPhotos: GalleryPhoto[];
  userSubmittedPhotos: SubmittedPhoto[];
  addAnnouncement: (a: Omit<Announcement, "id" | "createdAt">) => void;
  updateAnnouncement: (id: string, a: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;
  addSession: (s: Omit<Session, "id">) => void;
  updateSession: (id: string, s: Partial<Session>) => void;
  deleteSession: (id: string) => void;
  addGalleryPhoto: (photo: Omit<GalleryPhoto, "id" | "uploadedAt">) => void;
  deleteGalleryPhoto: (id: string) => void;
  updatePhotoCaption: (id: string, caption: string) => void;
  togglePhotoVisibility: (id: string) => void;
  submitUserPhoto: (photo: Omit<SubmittedPhoto, "id" | "uploadedAt" | "status">) => void;
  reviewUserPhoto: (id: string, action: "approved" | "rejected") => void;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      announcements: [
        {
          id: "ann1",
          title: "Welcome to SNL Study!",
          content: "Every Saturday at oSpace Brunswick. Bring your study materials and meet fellow students!",
          pinned: true,
          createdAt: new Date().toISOString(),
        },
      ],
      sessions: [
        {
          id: "sess1",
          date: new Date().toISOString().split("T")[0],
          startTime: "13:00",
          endTime: "17:00",
          location: "oSpace Brunswick",
          topic: "General Study",
          maxAttendees: 30,
          notes: "Bring your laptop!",
        },
      ],
      galleryPhotos: [],
      userSubmittedPhotos: [],

      addAnnouncement: (a) =>
        set((s) => ({
          announcements: [{ ...a, id: uid(), createdAt: new Date().toISOString() }, ...s.announcements],
        })),

      updateAnnouncement: (id, a) =>
        set((s) => ({ announcements: s.announcements.map((x) => (x.id === id ? { ...x, ...a } : x)) })),

      deleteAnnouncement: (id) =>
        set((s) => ({ announcements: s.announcements.filter((x) => x.id !== id) })),

      addSession: (s) =>
        set((state) => ({ sessions: [...state.sessions, { ...s, id: uid() }] })),

      updateSession: (id, s) =>
        set((state) => ({ sessions: state.sessions.map((x) => (x.id === id ? { ...x, ...s } : x)) })),

      deleteSession: (id) =>
        set((s) => ({ sessions: s.sessions.filter((x) => x.id !== id) })),

      addGalleryPhoto: (photo) =>
        set((s) => ({
          galleryPhotos: [
            ...s.galleryPhotos,
            { ...photo, id: uid(), uploadedAt: new Date().toISOString(), source: photo.source ?? "admin" },
          ],
        })),

      deleteGalleryPhoto: (id) =>
        set((s) => ({ galleryPhotos: s.galleryPhotos.filter((p) => p.id !== id) })),

      updatePhotoCaption: (id, caption) =>
        set((s) => ({ galleryPhotos: s.galleryPhotos.map((p) => (p.id === id ? { ...p, caption } : p)) })),

      togglePhotoVisibility: (id) =>
        set((s) => ({ galleryPhotos: s.galleryPhotos.map((p) => (p.id === id ? { ...p, visible: !p.visible } : p)) })),

      submitUserPhoto: (photo) =>
        set((s) => ({
          userSubmittedPhotos: [
            ...s.userSubmittedPhotos,
            { ...photo, id: uid(), uploadedAt: new Date().toISOString(), status: "pending" },
          ],
        })),

      reviewUserPhoto: (id, action) => {
        const { userSubmittedPhotos, galleryPhotos } = get();
        const photo = userSubmittedPhotos.find((p) => p.id === id);
        if (!photo) return;
        set((s) => ({
          userSubmittedPhotos: s.userSubmittedPhotos.map((p) =>
            p.id === id ? { ...p, status: action } : p
          ),
        }));
        if (action === "approved") {
          set((s) => ({
            galleryPhotos: [
              ...s.galleryPhotos,
              {
                id: uid(),
                src: photo.src,
                caption: photo.caption || `Photo by ${photo.displayName}`,
                visible: true,
                uploadedAt: new Date().toISOString(),
                source: "user",
              },
            ],
          }));
        }
      },
    }),
    { name: "snl-mobile-admin" }
  )
);
