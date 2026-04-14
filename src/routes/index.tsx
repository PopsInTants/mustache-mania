import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UploadDialog } from "@/components/UploadDialog";
import { MustacheGallery } from "@/components/MustacheGallery";
import { Swords } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-dvh bg-background font-mono antialiased selection:bg-hot-pink/30">
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-8 lg:px-12 py-6 bg-background/95 backdrop-blur-md border-b-4 border-vinyl-black">
        <div className="flex items-center gap-3">
          <div className="bg-vinyl-black text-neon-lime px-3 py-1.5 -skew-x-12 shadow-[4px_4px_0px_0px] shadow-vinyl-black">
            <span className="font-display text-lg sm:text-2xl tracking-tighter uppercase flex items-center gap-2">
              <Swords className="size-5 sm:size-6" />
              Upper Lip Combat
            </span>
          </div>
        </div>
        <UploadDialog onUploaded={() => setRefreshKey((k) => k + 1)} />
      </nav>

      {/* Hero */}
      <header className="px-4 sm:px-8 lg:px-12 py-12 sm:py-20">
        <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl uppercase tracking-tighter leading-[0.9] text-vinyl-black max-w-4xl">
          Rate The
          <br />
          <span className="text-hot-pink">Greatest</span>
          <br />
          Mustaches
        </h1>
        <p className="mt-6 text-sm sm:text-base font-bold text-vinyl-black/60 max-w-md uppercase tracking-wider leading-relaxed">
          Upload your lip warrior. Battle for glory. Only the most distinguished
          facial hair survives.
        </p>
      </header>

      {/* Gallery */}
      <main className="px-4 sm:px-8 lg:px-12 pb-20">
        <MustacheGallery refreshKey={refreshKey} />
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-vinyl-black px-4 sm:px-8 lg:px-12 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="font-display text-xl sm:text-2xl uppercase tracking-tighter text-vinyl-black/20">
          Stay Sharp
        </p>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-vinyl-black/30">
          © 2026 Upper Lip Combat — All Follicles Reserved
        </p>
      </footer>
    </div>
  );
}
