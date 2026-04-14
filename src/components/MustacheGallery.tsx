import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MustacheCard } from "./MustacheCard";

interface MustacheStat {
  id: string;
  title: string;
  submitter_name: string;
  image_url: string;
  avg_rating: number;
  total_ratings: number;
  created_at: string;
}

type SortMode = "recent" | "top" | "most_rated";

export function MustacheGallery({ refreshKey }: { refreshKey: number }) {
  const [mustaches, setMustaches] = useState<MustacheStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortMode>("recent");

  const rotations = [2, -1, 3, -2, 1, -3];

  async function fetchMustaches() {
    setLoading(true);
    const { data, error } = await supabase.from("mustache_stats").select("*");

    if (error) {
      console.error("Fetch error:", error);
      setLoading(false);
      return;
    }

    const items = (data || []).map((d) => ({
      id: d.id!,
      title: d.title!,
      submitter_name: d.submitter_name!,
      image_url: d.image_url!,
      avg_rating: d.avg_rating ?? 0,
      total_ratings: d.total_ratings ?? 0,
      created_at: d.created_at!,
    }));

    // Sort
    if (sort === "top") {
      items.sort((a, b) => b.avg_rating - a.avg_rating);
    } else if (sort === "most_rated") {
      items.sort((a, b) => b.total_ratings - a.total_ratings);
    } else {
      items.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    setMustaches(items);
    setLoading(false);
  }

  useEffect(() => {
    fetchMustaches();
  }, [sort, refreshKey]);

  const sortOptions: { key: SortMode; label: string }[] = [
    { key: "recent", label: "FRESH MEAT" },
    { key: "top", label: "HIGHEST RATED" },
    { key: "most_rated", label: "MOST BATTLES" },
  ];

  return (
    <section>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
        <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-tighter leading-none text-vinyl-black">
          The Grunt Gallery
        </h2>
        <div className="flex gap-2 flex-wrap">
          {sortOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSort(opt.key)}
              className={`px-4 py-2 text-xs font-bold border-2 border-vinyl-black transition-all cursor-pointer ${
                sort === opt.key
                  ? "bg-vinyl-black text-neon-lime"
                  : "bg-transparent text-vinyl-black hover:bg-vinyl-black hover:text-neon-lime"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-sticker-white border-3 border-vinyl-black p-4 shadow-[6px_6px_0px_0px] shadow-vinyl-black animate-pulse"
            >
              <div className="aspect-square bg-vinyl-black/10 mb-4" />
              <div className="h-4 bg-vinyl-black/10 w-3/4 mb-2" />
              <div className="h-3 bg-vinyl-black/10 w-1/2" />
            </div>
          ))}
        </div>
      ) : mustaches.length === 0 ? (
        <div className="text-center py-20 border-4 border-dashed border-vinyl-black/20">
          <p className="font-display text-3xl uppercase text-vinyl-black/30">
            No Warriors Yet
          </p>
          <p className="text-sm font-bold text-vinyl-black/20 mt-2 uppercase tracking-widest">
            Be the first to enter the arena
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {mustaches.map((m, i) => (
            <MustacheCard
              key={m.id}
              {...m}
              rotation={rotations[i % rotations.length]}
              onRated={fetchMustaches}
            />
          ))}
        </div>
      )}
    </section>
  );
}
