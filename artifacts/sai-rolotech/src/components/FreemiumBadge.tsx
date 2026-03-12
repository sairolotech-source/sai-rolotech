import { Badge } from "@/components/ui/badge";
import { Lock, Crown, Sparkles } from "lucide-react";

interface FreemiumBadgeProps {
  isPaid?: boolean;
  label?: string;
  compact?: boolean;
}

export function FreemiumBadge({ isPaid = true, label, compact = false }: FreemiumBadgeProps) {
  if (!isPaid) {
    return (
      <Badge className="text-[9px] bg-green-100 text-green-700 border-green-200 gap-0.5" data-testid="badge-free">
        <Sparkles className="w-2.5 h-2.5" />
        {compact ? "FREE" : (label || "FREE")}
      </Badge>
    );
  }

  return (
    <Badge className="text-[9px] bg-amber-100 text-amber-700 border-amber-200 gap-0.5" data-testid="badge-paid">
      <Crown className="w-2.5 h-2.5" />
      {compact ? "PRO" : (label || "PRO")}
    </Badge>
  );
}

export function LockedFeatureOverlay({ featureName, children }: { featureName: string; children: React.ReactNode }) {
  return (
    <div className="relative" data-testid={`locked-feature-${featureName}`}>
      <div className="opacity-40 pointer-events-none select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-lg">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Lock className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-semibold text-amber-700">PRO Feature</span>
        </div>
        <p className="text-[10px] text-muted-foreground text-center px-4 mb-2">{featureName}</p>
        <button
          className="text-[10px] px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium hover:opacity-90 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
          }}
          data-testid={`button-upgrade-${featureName}`}
        >
          Upgrade to PRO
        </button>
      </div>
    </div>
  );
}

export function FreemiumLimitsBar({ current, max, label }: { current: number; max: number; label: string }) {
  const percentage = Math.min((current / max) * 100, 100);
  const isAtLimit = current >= max;

  return (
    <div className="p-3 rounded-lg border border-dashed border-amber-300 bg-amber-50/50 dark:bg-amber-950/20" data-testid="freemium-limits">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium">{label}</span>
        <span className={`text-xs font-bold ${isAtLimit ? "text-red-600" : "text-amber-600"}`}>
          {current}/{max}
        </span>
      </div>
      <div className="w-full h-1.5 bg-amber-200/50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isAtLimit ? "bg-red-500" : "bg-amber-500"}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isAtLimit && (
        <p className="text-[10px] text-red-600 mt-1.5 flex items-center gap-1">
          <Lock className="w-3 h-3" />
          Limit reached. Upgrade to PRO for unlimited.
        </p>
      )}
    </div>
  );
}
