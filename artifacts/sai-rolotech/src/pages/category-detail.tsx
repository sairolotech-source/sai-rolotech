import { getCategoryById } from "@/lib/categories";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useRoute } from "wouter";
import RippleIcon from "@/components/RippleIcon";

interface CategoryDetailProps {
  onNavigate: (path: string) => void;
}

export default function CategoryDetail({ onNavigate }: CategoryDetailProps) {
  const [, params] = useRoute("/category/:id");
  const id = params?.id || "";
  const category = getCategoryById(id);

  if (!category) {
    return (
      <div className="pb-24 px-4 pt-4 text-center">
        <p className="text-muted-foreground">Category not found</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => onNavigate("/explore")}>
          Back to Explore
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4">
      <div className="pt-4 pb-4">
        <button
          onClick={() => onNavigate("/explore")}
          className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 hover:text-foreground transition-colors"
          data-testid="button-back-explore"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Explore
        </button>
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${category.accentBg}`}>
            <category.icon className={`w-5.5 h-5.5 ${category.color}`} />
          </div>
          <div>
            <h1 className="text-lg font-bold" data-testid="text-category-title">{category.name}</h1>
            <p className="text-xs text-muted-foreground">{category.features.length} features available</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {category.features.map((feature, i) => (
          <RippleIcon
            key={feature.path}
            onClick={() => onNavigate(feature.path)}
            className="block"
            data-testid={`card-feature-${feature.label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 300 }}
              whileTap={{ scale: 0.97 }}
            >
              <Card className="p-3.5 cursor-pointer hover-elevate active:scale-[0.98] transition-transform h-full">
                <div className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${feature.color}`}>
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold leading-tight">{feature.label}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </div>
              </Card>
            </motion.div>
          </RippleIcon>
        ))}
      </div>
    </div>
  );
}
