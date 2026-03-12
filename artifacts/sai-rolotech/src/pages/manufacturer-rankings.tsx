import { useQuery } from "@tanstack/react-query";
import type { Manufacturer } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, MapPin, Medal, Share2, Crown, Award, Building2, Star } from "lucide-react";
import { motion } from "framer-motion";

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="w-5 h-5 text-amber-500" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-700" />;
  return <Award className="w-4 h-4 text-muted-foreground" />;
}

function getRankBg(rank: number) {
  if (rank === 1) return "bg-gradient-to-br from-amber-500/15 to-yellow-500/10 border-amber-500/30";
  if (rank === 2) return "bg-gradient-to-br from-gray-400/10 to-slate-400/5 border-gray-400/30";
  if (rank === 3) return "bg-gradient-to-br from-amber-700/10 to-orange-700/5 border-amber-700/30";
  return "";
}

function getRankLabel(rank: number) {
  if (rank === 1) return "GOLD";
  if (rank === 2) return "SILVER";
  if (rank === 3) return "BRONZE";
  return `#${rank}`;
}

function getRankColor(rank: number) {
  if (rank === 1) return "bg-amber-500 text-white";
  if (rank === 2) return "bg-gray-400 text-white";
  if (rank === 3) return "bg-amber-700 text-white";
  return "bg-muted text-muted-foreground";
}

function ManufacturerCard({ manufacturer, index }: { manufacturer: Manufacturer; index: number }) {
  const shareRank = () => {
    const text = `🏆 ${manufacturer.companyName} is ranked #${manufacturer.rank} among Top Roll Forming Manufacturers!\n📍 ${manufacturer.city}${manufacturer.state ? `, ${manufacturer.state}` : ""}\n\nCheck out the full rankings on Sai Rolotech Industrial App!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className={`p-4 mb-3 ${getRankBg(manufacturer.rank)}`} data-testid={`card-manufacturer-${manufacturer.id}`}>
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${manufacturer.rank <= 3 ? "bg-white/80 dark:bg-black/30 shadow-sm" : "bg-muted"}`}>
              {getRankIcon(manufacturer.rank)}
            </div>
            <Badge className={`text-[9px] px-1.5 py-0 border-0 ${getRankColor(manufacturer.rank)}`}>
              {getRankLabel(manufacturer.rank)}
            </Badge>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold truncate" data-testid={`text-mfg-name-${manufacturer.id}`}>
              {manufacturer.companyName}
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
              <p className="text-xs text-muted-foreground truncate">
                {manufacturer.city}{manufacturer.state ? `, ${manufacturer.state}` : ""}
              </p>
            </div>
          </div>

          <Button size="sm" variant="outline" className="shrink-0 text-xs" onClick={shareRank} data-testid={`button-share-rank-${manufacturer.id}`}>
            <Share2 className="w-3.5 h-3.5 mr-1" />
            Share
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

function TopThreePodium({ manufacturers }: { manufacturers: Manufacturer[] }) {
  const top3 = manufacturers.slice(0, 3);
  if (top3.length < 1) return null;

  const order = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
  const heights = top3.length >= 3 ? ["h-20", "h-28", "h-16"] : top3.length === 2 ? ["h-20", "h-28"] : ["h-28"];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <Card className="p-5 bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-900 text-white border-0">
        <div className="text-center mb-4">
          <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-1" />
          <h2 className="text-sm font-bold" data-testid="text-top-title">Top Roll Forming Manufacturers</h2>
        </div>

        <div className="flex items-end justify-center gap-3">
          {order.map((mfg, i) => {
            const heightClass = heights[i];
            return (
              <motion.div
                key={mfg.id}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="flex flex-col items-center"
              >
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center mb-2">
                  {getRankIcon(mfg.rank)}
                </div>
                <p className="text-[10px] font-bold text-center truncate max-w-[80px] mb-1">{mfg.companyName}</p>
                <p className="text-[9px] text-zinc-400 truncate max-w-[80px] mb-2">{mfg.city}</p>
                <div className={`w-16 ${heightClass} rounded-t-lg flex items-end justify-center pb-2 ${
                  mfg.rank === 1 ? "bg-gradient-to-t from-amber-600/60 to-amber-400/40" :
                  mfg.rank === 2 ? "bg-gradient-to-t from-gray-500/50 to-gray-400/30" :
                  "bg-gradient-to-t from-amber-800/50 to-amber-700/30"
                }`}>
                  <span className="text-xs font-bold">#{mfg.rank}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}

export default function ManufacturerRankings() {
  const { data: manufacturers, isLoading } = useQuery<Manufacturer[]>({
    queryKey: ["/api/manufacturers"],
  });

  const active = manufacturers?.filter(m => m.isActive !== false) || [];

  return (
    <div className="pb-24 px-4">
      <div className="pt-4 pb-3">
        <h1 className="text-xl font-bold mb-1 flex items-center gap-2" data-testid="text-ranking-title">
          <Trophy className="w-5 h-5 text-amber-500" />
          Top Manufacturers
        </h1>
        <p className="text-sm text-muted-foreground">Leading roll forming companies ranked by industry standing</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : active.length > 0 ? (
        <>
          <TopThreePodium manufacturers={active} />

          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Full Rankings
            </h2>
            <Badge variant="secondary" className="text-[10px]">
              {active.length} companies
            </Badge>
          </div>

          {active.map((mfg, i) => (
            <ManufacturerCard key={mfg.id} manufacturer={mfg} index={i} />
          ))}
        </>
      ) : (
        <Card className="p-8 text-center">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No manufacturers ranked yet</p>
          <p className="text-xs text-muted-foreground mt-1">Register your company to appear in rankings</p>
        </Card>
      )}

      <Card className="p-4 mt-4 bg-primary/5 border-primary/10">
        <div className="flex items-start gap-3">
          <Star className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold mb-1">Want your company listed?</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Register on the app and contact admin to get your roll forming company ranked. Share your ranking badge to gain industry recognition!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
