import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MustacheCardProps {
  id: string;
  title: string;
  submitter_name: string;
  image_url: string;
  avg_rating: number;
  total_ratings: number;
  rotation?: number;
  onRated: () => void;
}

export function MustacheCard({
  id,
  title,
  submitter_name,
  image_url,
  avg_rating,
  total_ratings,
  rotation = 0,
  onRated,
}: MustacheCardProps) {
  const [hoveredScore, setHoveredScore] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  async function handleRate(score: number) {
    if (submitting || hasVoted) return;
    setSubmitting(true);
    try {
      // Use a simple fingerprint as voter_ip
      const fp =
        navigator.userAgent.slice(0, 50) +
        "_" +
        new Date().toISOString().slice(0, 10);

      const { error } = await supabase.from("ratings").insert({
        mustache_id: id,
        score,
        voter_ip: fp,
      });

      if (error) {
        if (error.code === "23505") {
          setHasVoted(true);
        }
        throw error;
      }

      setHasVoted(true);
      onRated();
    } catch (err) {
      console.error("Rating failed:", err);
    } finally {
      setSubmitting(false);
    }
  }

  const tier =
    avg_rating >= 9
      ? "LEGENDARY"
      : avg_rating >= 7
        ? "VETERAN"
        : avg_rating >= 5
          ? "ROOKIE"
          : total_ratings === 0
            ? "UNRANKED"
            : "WILD CARD";

  const tierColor =
    tier === "LEGENDARY"
      ? "text-hot-pink"
      : tier === "VETERAN"
        ? "text-electric-blue"
        : "text-vinyl-black/60";

  return (
    <div
      className="bg-sticker-white border-3 border-vinyl-black p-4 shadow-[6px_6px_0px_0px] shadow-vinyl-black hover:shadow-[3px_3px_0px_0px] hover:shadow-vinyl-black hover:translate-x-[3px] hover:translate-y-[3px] transition-all group"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div className="bg-vinyl-black/10 mb-4 overflow-hidden aspect-square">
        <img
          src={image_url}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>

      <div className="flex justify-between items-start">
        <div className="min-w-0 flex-1">
          <p className={`text-[10px] font-extrabold tracking-widest ${tierColor}`}>
            {tier}
          </p>
          <h3 className="font-display text-lg leading-tight uppercase truncate text-vinyl-black">
            {title}
          </h3>
          <p className="text-[10px] font-bold text-vinyl-black/50 uppercase tracking-wider">
            By {submitter_name}
          </p>
        </div>
        <div className="bg-vinyl-black text-neon-lime text-xs p-1.5 font-bold tabular-nums shrink-0 ml-2">
          {avg_rating > 0 ? avg_rating.toFixed(1) : "—"}/10
        </div>
      </div>

      {/* Rating row */}
      <div className="mt-4 pt-3 border-t-2 border-dashed border-vinyl-black/20">
        {hasVoted ? (
          <p className="text-xs font-bold text-hot-pink uppercase text-center tracking-widest">
            ⚡ Vote Recorded
          </p>
        ) : (
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-bold uppercase tracking-widest text-vinyl-black/40 mr-1">
              Rate:
            </span>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => (
              <button
                key={score}
                disabled={submitting}
                className={`w-6 h-6 text-[10px] font-extrabold border border-vinyl-black/20 transition-all cursor-pointer ${
                  hoveredScore !== null && score <= hoveredScore
                    ? "bg-neon-lime text-vinyl-black border-vinyl-black"
                    : "bg-transparent text-vinyl-black/50 hover:bg-vinyl-black/5"
                }`}
                onClick={() => handleRate(score)}
                onMouseEnter={() => setHoveredScore(score)}
                onMouseLeave={() => setHoveredScore(null)}
              >
                {score}
              </button>
            ))}
          </div>
        )}
        <div className="text-[9px] font-bold text-vinyl-black/30 mt-2 text-right uppercase">
          {total_ratings} {total_ratings === 1 ? "vote" : "votes"}
        </div>
      </div>
    </div>
  );
}
