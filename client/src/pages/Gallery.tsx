// Design: Dark Brutalism + Neon Accent — Gallery page
// Brand: #012E2B bg, #FFDC73 accent, masonry-style grid
import { useState, useMemo } from "react";
import { X, ChevronLeft, ChevronRight, Images } from "lucide-react";
import { useAdminStore } from "../stores/adminStore";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";

// Static gallery photos (37 base photos using Unsplash)
const STATIC_PHOTOS = [
  { id: "s1", src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400", caption: "Study session vibes" },
  { id: "s2", src: "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=400", caption: "Deep focus" },
  { id: "s3", src: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400", caption: "Notes & books" },
  { id: "s4", src: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400", caption: "Library time" },
  { id: "s5", src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400", caption: "Morning study" },
  { id: "s6", src: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400", caption: "Coffee & code" },
  { id: "s7", src: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400", caption: "Stack of books" },
  { id: "s8", src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400", caption: "Group study" },
  { id: "s9", src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400", caption: "Lecture notes" },
  { id: "s10", src: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400", caption: "Team work" },
  { id: "s11", src: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400", caption: "Laptop study" },
  { id: "s12", src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", caption: "Focus mode" },
  { id: "s13", src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400", caption: "Collaboration" },
  { id: "s14", src: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400", caption: "Reading corner" },
  { id: "s15", src: "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=400", caption: "Writing session" },
  { id: "s16", src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400", caption: "Campus life" },
  { id: "s17", src: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400", caption: "Classroom" },
  { id: "s18", src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400", caption: "Whiteboard" },
  { id: "s19", src: "https://images.unsplash.com/photo-1491975474562-1f4e30bc9468?w=400", caption: "Study break" },
  { id: "s20", src: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400", caption: "University" },
  { id: "s21", src: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=400", caption: "Focused" },
  { id: "s22", src: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400", caption: "Studying hard" },
  { id: "s23", src: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400", caption: "Book collection" },
  { id: "s24", src: "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400", caption: "Desk setup" },
  { id: "s25", src: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400", caption: "Night study" },
  { id: "s26", src: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400", caption: "Together" },
  { id: "s27", src: "https://images.unsplash.com/photo-1459499362902-55a20553e082?w=400", caption: "Quiet corner" },
  { id: "s28", src: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400", caption: "Planning" },
  { id: "s29", src: "https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=400", caption: "Inspiration" },
  { id: "s30", src: "https://images.unsplash.com/photo-1453733190371-0a9bedd82893?w=400", caption: "Cozy study" },
  { id: "s31", src: "https://images.unsplash.com/photo-1510531704581-5b2870972060?w=400", caption: "Afternoon light" },
  { id: "s32", src: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400", caption: "Reading" },
  { id: "s33", src: "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=400", caption: "Headphones on" },
  { id: "s34", src: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400", caption: "Pen & paper" },
  { id: "s35", src: "https://images.unsplash.com/photo-1520333789090-1afc82db536a?w=400", caption: "Bright ideas" },
  { id: "s36", src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400", caption: "Group session" },
  { id: "s37", src: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400", caption: "Library" },
];

interface GalleryItem {
  id: string;
  src: string;
  caption: string;
}

export default function GalleryPage() {
  const { galleryPhotos } = useAdminStore();
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const allPhotos: GalleryItem[] = useMemo(() => {
    const adminPhotos = galleryPhotos
      .filter((p) => p.visible)
      .map((p) => ({ id: p.id, src: p.src, caption: p.caption }));
    return [...STATIC_PHOTOS, ...adminPhotos];
  }, [galleryPhotos]);

  const openLightbox = (idx: number) => setLightboxIdx(idx);
  const closeLightbox = () => setLightboxIdx(null);
  const prevPhoto = () => setLightboxIdx((i) => (i !== null ? (i - 1 + allPhotos.length) % allPhotos.length : null));
  const nextPhoto = () => setLightboxIdx((i) => (i !== null ? (i + 1) % allPhotos.length : null));

  const currentPhoto = lightboxIdx !== null ? allPhotos[lightboxIdx] : null;

  return (
    <div className="page-container bg-[#012E2B]">
      <PageHeader
        title="Our Gallery"
        subtitle={`${allPhotos.length} photos captured`}
        accent
      />

      <div className="px-4 pt-2 pb-4">
        {/* Stats */}
        <div className="flex gap-3 mb-4">
          <Card className="flex-1 text-center py-3">
            <p className="text-[#FFDC73] text-2xl font-black mono">{allPhotos.length}</p>
            <p className="text-[#8fa8a5] text-xs">Photos</p>
          </Card>
          <Card className="flex-1 text-center py-3">
            <p className="text-[#FFDC73] text-2xl font-black mono">{galleryPhotos.filter((p) => p.visible).length}</p>
            <p className="text-[#8fa8a5] text-xs">Member shots</p>
          </Card>
        </div>

        {/* Photo Grid */}
        <div className="columns-2 gap-2 space-y-2">
          {allPhotos.map((photo, idx) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => openLightbox(idx)}
              className="block w-full break-inside-avoid rounded-xl overflow-hidden border border-[rgba(255,220,115,0.08)] active:scale-[0.98] transition-transform duration-100"
            >
              <img
                src={photo.src}
                alt={photo.caption}
                className="w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>

        {allPhotos.length === 0 && (
          <Card>
            <div className="flex flex-col items-center gap-3 py-8">
              <Images size={36} className="text-[#8fa8a5]" />
              <p className="text-[#8fa8a5] text-sm text-center">No photos yet.</p>
            </div>
          </Card>
        )}
      </div>

      {/* Lightbox */}
      {currentPhoto && lightboxIdx !== null && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-12 pb-4">
            <p className="text-[#8fa8a5] text-sm mono">{lightboxIdx + 1} / {allPhotos.length}</p>
            <button type="button" onClick={closeLightbox} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white">
              <X size={18} />
            </button>
          </div>

          {/* Image */}
          <div className="flex-1 flex items-center justify-center px-4 relative">
            <button
              type="button"
              onClick={prevPhoto}
              className="absolute left-2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white z-10"
            >
              <ChevronLeft size={20} />
            </button>
            <img
              src={currentPhoto.src}
              alt={currentPhoto.caption}
              className="max-w-full max-h-[70vh] rounded-2xl object-contain"
            />
            <button
              type="button"
              onClick={nextPhoto}
              className="absolute right-2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white z-10"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Caption */}
          {currentPhoto.caption && (
            <div className="px-6 py-4 pb-8">
              <p className="text-[#F8F8FF] text-sm text-center">{currentPhoto.caption}</p>
            </div>
          )}

          {/* Thumbnail strip */}
          <div className="flex gap-1.5 overflow-x-auto px-4 pb-6 scrollbar-hide">
            {allPhotos.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setLightboxIdx(i)}
                className={`shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                  i === lightboxIdx ? "border-[#FFDC73]" : "border-transparent opacity-50"
                }`}
              >
                <img src={p.src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
