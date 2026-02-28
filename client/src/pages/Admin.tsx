// Admin page is only available on the Manus version
export default function AdminPage() {
  return (
    <div className="page-container bg-[#012E2B] flex items-center justify-center min-h-screen">
      <div className="text-center px-8">
        <p className="text-[#FFDC73] text-2xl font-bold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Admin Panel</p>
        <p className="text-[#8fa8a5] text-sm">Available on the full version at</p>
        <a href="https://snlmobile-nzkhjpqi.manus.space" className="text-[#FFDC73] text-sm underline mt-1 block">snlmobile-nzkhjpqi.manus.space</a>
      </div>
    </div>
  );
}
