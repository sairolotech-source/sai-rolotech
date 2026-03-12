import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Factory, ChevronRight, AlertTriangle, CheckCircle2, Search } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { troubleshootingData, type MachineCategory } from "@/data/troubleshooting-data";

function MachineCategoryCard({
  category,
  index,
  onSelect,
}: {
  category: MachineCategory;
  index: number;
  onSelect: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 300, damping: 25 }}
    >
      <GlassCard
        className="p-4 cursor-pointer hover-elevate active:scale-[0.98] transition-transform"
        onClick={onSelect}
        data-testid={`card-machine-${category.id}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Factory className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold truncate">{category.nameEn}</h3>
            <p className="text-[11px] text-muted-foreground">{category.nameHi}</p>
            <Badge variant="secondary" className="text-[9px] mt-1 gap-1">
              <AlertTriangle className="w-2.5 h-2.5" />
              {category.problems.length} Common Problems
            </Badge>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
        </div>
      </GlassCard>
    </motion.div>
  );
}

function ProblemDetail({ category }: { category: MachineCategory }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProblems = category.problems.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.titleEn.toLowerCase().includes(q) ||
      p.titleHi.toLowerCase().includes(q) ||
      p.causeEn.toLowerCase().includes(q) ||
      p.solutionEn.toLowerCase().includes(q)
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="space-y-4"
    >
      <GlassCard className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Factory className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold">{category.nameEn}</h2>
            <p className="text-[11px] text-muted-foreground">{category.nameHi}</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search problems... / समस्या खोजें..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-white/10 bg-accent/30 outline-none focus:ring-1 focus:ring-primary backdrop-blur-sm"
            data-testid="input-search-problems"
          />
        </div>
      </GlassCard>

      {filteredProblems.length === 0 ? (
        <GlassCard className="p-6 text-center">
          <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">No problems found / कोई समस्या नहीं मिली</p>
        </GlassCard>
      ) : (
        <Accordion type="single" collapsible className="space-y-2">
          {filteredProblems.map((problem, i) => (
            <motion.div
              key={problem.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard className="overflow-hidden">
                <AccordionItem value={problem.id} className="border-0">
                  <AccordionTrigger
                    className="px-4 py-3 text-xs font-semibold hover:no-underline gap-2"
                    data-testid={`trigger-problem-${problem.id}`}
                  >
                    <div className="flex items-center gap-2.5 text-left">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold leading-tight">{problem.titleEn}</p>
                        <p className="text-[10px] text-muted-foreground font-normal mt-0.5">{problem.titleHi}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-0">
                    <div className="space-y-3">
                      <div className="rounded-lg bg-red-500/5 border border-red-500/10 p-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                          <span className="text-[11px] font-bold text-red-600 dark:text-red-400">
                            Karan / Cause
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground whitespace-pre-line leading-relaxed mb-2">
                          {problem.causeEn}
                        </p>
                        <p className="text-[11px] text-muted-foreground whitespace-pre-line leading-relaxed opacity-80">
                          {problem.causeHi}
                        </p>
                      </div>

                      <div className="rounded-lg bg-green-500/5 border border-green-500/10 p-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                          <span className="text-[11px] font-bold text-green-600 dark:text-green-400">
                            Samadhan / Solution
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground whitespace-pre-line leading-relaxed mb-2">
                          {problem.solutionEn}
                        </p>
                        <p className="text-[11px] text-muted-foreground whitespace-pre-line leading-relaxed opacity-80">
                          {problem.solutionHi}
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </GlassCard>
            </motion.div>
          ))}
        </Accordion>
      )}
    </motion.div>
  );
}

export default function MachineTroubleshootingPage() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<MachineCategory | null>(null);

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => {
            if (selectedCategory) {
              setSelectedCategory(null);
            } else {
              setLocation("/");
            }
          }}
          data-testid="button-back-troubleshooting"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-sm font-bold" data-testid="text-page-title">
            {selectedCategory ? selectedCategory.nameEn : "Machine Troubleshooting"}
          </h1>
          <p className="text-[10px] text-muted-foreground">
            {selectedCategory ? "समस्या और समाधान / Problems & Solutions" : "मशीन समस्या निवारण / Select Machine"}
          </p>
        </div>
        <AlertTriangle className="w-5 h-5 text-amber-500 ml-auto" />
      </div>

      <div className="p-4">
        <AnimatePresence mode="wait">
          {selectedCategory ? (
            <ProblemDetail key="detail" category={selectedCategory} />
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              <GlassCard className="p-3 mb-4 bg-primary/5 border-primary/10">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">Troubleshooting Guide</span> — Machine mein koi problem aa rahi hai? Neeche apni machine select karein aur common problems ke causes aur solutions dekhein.
                </p>
              </GlassCard>

              {troubleshootingData.map((category, i) => (
                <MachineCategoryCard
                  key={category.id}
                  category={category}
                  index={i}
                  onSelect={() => setSelectedCategory(category)}
                />
              ))}

              {troubleshootingData.length === 1 && (
                <GlassCard className="p-4 border-dashed border-2 border-muted/30 text-center">
                  <p className="text-[11px] text-muted-foreground">
                    Aur machines jald aa rahe hain — Rolling Shutter, Roofing Sheet, Door Frame & more
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1 opacity-70">
                    More machines coming soon
                  </p>
                </GlassCard>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
