import { categories } from "@/lib/categories";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Compass } from "lucide-react";
import { motion } from "framer-motion";
import RippleIcon from "@/components/RippleIcon";

interface ExploreProps {
  onNavigate: (path: string) => void;
}

export default function Explore({ onNavigate }: ExploreProps) {
  return (
    <div className="pb-24 px-4">
      <div className="pt-4 pb-4">
        <h1 className="text-lg font-bold flex items-center gap-2" data-testid="text-explore-title">
          <Compass className="w-5 h-5 text-primary" />
          Explore
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">Browse all features by category</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat, i) => (
          <RippleIcon
            key={cat.id}
            onClick={() => onNavigate(`/category/${cat.id}`)}
            className="block"
            data-testid={`card-category-${cat.id}`}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 300 }}
              whileTap={{ scale: 0.97 }}
            >
              <GlassCard className="p-4 h-full cursor-pointer hover-elevate">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${cat.accentBg}`}>
                  <cat.icon className={`w-5.5 h-5.5 ${cat.color}`} />
                </div>
                <h3 className="text-sm font-semibold mb-1 leading-tight">{cat.name}</h3>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                    {cat.features.length} {cat.features.length === 1 ? "feature" : "features"}
                  </Badge>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              </GlassCard>
            </motion.div>
          </RippleIcon>
        ))}
      </div>
    </div>
  );
}
