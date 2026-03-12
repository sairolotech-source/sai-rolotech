import { useQuery } from "@tanstack/react-query";
import { GlassCard } from "@/components/ui/glass-card";
import { PLATFORM_RATINGS } from "@/lib/platform-ratings-config";
import { Star, ExternalLink } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

interface GoogleRatingResponse {
  rating: number;
  reviewCount: string;
  source: "api" | "fallback";
}

function AnimatedStars({ rating, color }: { rating: number; color: string }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.3;
  const stars = [];

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <Star
          key={i}
          className="w-3.5 h-3.5"
          style={{ color, fill: color }}
        />
      );
    } else if (i === fullStars && hasHalf) {
      stars.push(
        <div key={i} className="relative w-3.5 h-3.5">
          <Star className="absolute w-3.5 h-3.5 text-muted-foreground/30" />
          <div className="absolute overflow-hidden" style={{ width: "50%" }}>
            <Star className="w-3.5 h-3.5" style={{ color, fill: color }} />
          </div>
        </div>
      );
    } else {
      stars.push(
        <Star key={i} className="w-3.5 h-3.5 text-muted-foreground/30" />
      );
    }
  }

  return <div className="flex items-center gap-0.5">{stars}</div>;
}

function PlatformLogo({ platform }: { platform: string }) {
  if (platform === "IndiaMART") {
    return (
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#1A73E8]/10">
        <span className="text-[11px] font-extrabold text-[#1A73E8] leading-none">iM</span>
      </div>
    );
  }
  if (platform === "TradeIndia") {
    return (
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#E65100]/10">
        <span className="text-[11px] font-extrabold text-[#E65100] leading-none">TI</span>
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#4285F4]/10">
      <span className="text-[13px] font-extrabold text-[#4285F4] leading-none">G</span>
    </div>
  );
}

function RatingCard({
  platform,
  rating,
  reviewCount,
  profileUrl,
  color,
  gradientFrom,
  gradientTo,
  index,
}: {
  platform: string;
  rating: number;
  reviewCount: string;
  profileUrl: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 25, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 25, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 200, damping: 25, delay: index * 0.12 }}
      className="min-w-[200px] flex-1"
    >
      <GlassCard className="p-4 relative overflow-hidden group" data-testid={`platform-card-${platform.toLowerCase().replace(/\s+/g, "-")}`}>
        <div
          className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity"
          style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
        />

        <div className="flex items-center gap-3 mb-3">
          <PlatformLogo platform={platform} />
          <div>
            <p className="text-xs font-bold text-foreground">{platform}</p>
            <p className="text-[10px] text-muted-foreground">Verified Profile</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-2xl font-extrabold" style={{ color }}>
            {rating.toFixed(1)}
          </span>
          <AnimatedStars rating={rating} color={color} />
        </div>

        <p className="text-[11px] text-muted-foreground mb-3">{reviewCount}</p>

        <Button
          size="sm"
          variant="outline"
          className="w-full text-[10px] h-7 gap-1.5 backdrop-blur-sm"
          style={{ borderColor: `${color}30`, color }}
          onClick={() => window.open(profileUrl, "_blank", "noopener,noreferrer")}
          data-testid={`button-view-${platform.toLowerCase().replace(/\s+/g, "-")}`}
        >
          View on {platform.split(" ")[0]}
          <ExternalLink className="w-3 h-3" />
        </Button>
      </GlassCard>
    </motion.div>
  );
}

export default function PlatformRatings() {
  const { data: googleData } = useQuery<GoogleRatingResponse>({
    queryKey: ["/api/google-rating"],
    staleTime: 1000 * 60 * 60,
    retry: false,
  });

  const platforms = Object.values(PLATFORM_RATINGS);

  const displayPlatforms = platforms.map((p) => {
    if (p.platform === "Google My Business" && googleData) {
      return {
        ...p,
        rating: googleData.rating,
        reviewCount: googleData.reviewCount,
      };
    }
    return p;
  });

  const sectionRef = useRef<HTMLDivElement>(null);
  const sectionInView = useInView(sectionRef, { once: true, margin: "-50px" });

  return (
    <div className="px-4 mb-6" ref={sectionRef} data-testid="platform-ratings-section">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={sectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="mb-3"
      >
        <h2 className="text-base font-bold text-foreground" data-testid="text-ratings-heading">
          Trusted On Leading Platforms
        </h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Verified ratings from India's top B2B marketplaces
        </p>
      </motion.div>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible">
        {displayPlatforms.map((p, i) => (
          <div key={p.platform} className="snap-start">
            <RatingCard
              platform={p.platform}
              rating={p.rating}
              reviewCount={p.reviewCount}
              profileUrl={p.profileUrl}
              color={p.color}
              gradientFrom={p.gradientFrom}
              gradientTo={p.gradientTo}
              index={i}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
