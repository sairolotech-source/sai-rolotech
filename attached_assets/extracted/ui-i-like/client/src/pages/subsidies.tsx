import { useQuery } from "@tanstack/react-query";
import type { Subsidy } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, FileText, Search, Filter, IndianRupee, CheckCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";

function SubsidyCard({ subsidy }: { subsidy: Subsidy }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="p-4 mb-3" data-testid={`card-subsidy-${subsidy.id}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <Badge variant="secondary" className="mb-2" data-testid={`badge-subsidy-category-${subsidy.id}`}>
            {subsidy.category}
          </Badge>
          <h3 className="font-semibold text-sm leading-tight" data-testid={`text-subsidy-name-${subsidy.id}`}>
            {subsidy.name}
          </h3>
        </div>
        {subsidy.state && (
          <Badge variant="outline" className="shrink-0 text-xs" data-testid={`badge-subsidy-state-${subsidy.id}`}>
            {subsidy.state}
          </Badge>
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-3 leading-relaxed" data-testid={`text-subsidy-desc-${subsidy.id}`}>
        {subsidy.description}
      </p>

      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-md p-3 mb-3">
        <div className="flex items-start gap-2">
          <IndianRupee className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 uppercase tracking-wide mb-1">Subsidy Amount</p>
            <p className="text-sm font-semibold" data-testid={`text-subsidy-amount-${subsidy.id}`}>{subsidy.subsidy}</p>
          </div>
        </div>
      </div>

      <button
        className="text-xs font-medium text-primary mb-3 block"
        onClick={() => setExpanded(!expanded)}
        data-testid={`button-expand-${subsidy.id}`}
      >
        {expanded ? "Show less" : "Show eligibility details"}
      </button>

      {expanded && (
        <div className="bg-muted/50 rounded-md p-3 mb-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Eligibility</p>
          <p className="text-sm leading-relaxed" data-testid={`text-subsidy-eligibility-${subsidy.id}`}>
            {subsidy.eligibility}
          </p>
        </div>
      )}

      {subsidy.applyUrl && (
        <Button size="sm" variant="outline" className="w-full" asChild data-testid={`button-apply-${subsidy.id}`}>
          <a href={subsidy.applyUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            Apply Online
          </a>
        </Button>
      )}
    </Card>
  );
}

export default function Subsidies() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: subsidies, isLoading } = useQuery<Subsidy[]>({
    queryKey: ["/api/subsidies"],
  });

  const categories = useMemo(() => {
    const cats = new Set(subsidies?.map(s => s.category) || []);
    return Array.from(cats);
  }, [subsidies]);

  const filtered = useMemo(() => {
    let items = subsidies || [];
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      );
    }
    if (selectedCategory) {
      items = items.filter(s => s.category === selectedCategory);
    }
    return items;
  }, [subsidies, search, selectedCategory]);

  return (
    <div className="pb-24 px-4">
      <div className="pt-4 pb-3">
        <h1 className="text-xl font-bold mb-1 flex items-center gap-2" data-testid="text-subsidies-title">
          <FileText className="w-5 h-5 text-primary" />
          Government Subsidies
        </h1>
        <p className="text-sm text-muted-foreground">Explore subsidies for manufacturing & MSME sector</p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search subsidies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
          data-testid="input-subsidy-search"
        />
      </div>

      {categories.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          <Button
            size="sm"
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            className="shrink-0"
            data-testid="button-filter-all-subsidies"
          >
            All
          </Button>
          {categories.map(cat => (
            <Button
              key={cat}
              size="sm"
              variant={selectedCategory === cat ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat)}
              className="shrink-0"
              data-testid={`button-filter-${cat}`}
            >
              {cat}
            </Button>
          ))}
        </div>
      )}

      {isLoading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-4 mb-3">
            <Skeleton className="h-5 w-20 mb-2" />
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3" />
          </Card>
        ))
      ) : filtered.length > 0 ? (
        filtered.map(subsidy => <SubsidyCard key={subsidy.id} subsidy={subsidy} />)
      ) : (
        <div className="text-center py-12">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No subsidies found</p>
        </div>
      )}
    </div>
  );
}
