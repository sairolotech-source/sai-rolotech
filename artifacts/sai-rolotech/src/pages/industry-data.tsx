import { useQuery } from "@tanstack/react-query";
import type { IndustryData, MarketPrice } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus, IndianRupee, MapPin, Play, Clock, BarChart3, Factory, Video } from "lucide-react";
import { motion } from "framer-motion";

function CoilPriceSection() {
  const { data: prices, isLoading } = useQuery<MarketPrice[]>({ queryKey: ["/api/market-prices"] });
  const { data: industryItems } = useQuery<IndustryData[]>({ queryKey: ["/api/industry-data"] });

  const coilPrices = industryItems?.filter(d => d.type === "coil_price") || [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  const gpCoil = prices?.find(p => p.material === "gp_coil");
  const crCoil = prices?.find(p => p.material === "cr_coil");

  return (
    <div className="space-y-3">
      {gpCoil && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-4 bg-gradient-to-br from-amber-500/5 to-orange-500/5 border-amber-500/20">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold">GP Coil</h3>
              <Badge variant="secondary" className="text-[10px]">
                <Clock className="w-3 h-3 mr-1" />
                {gpCoil.date || "Today"}
              </Badge>
            </div>
            <div className="flex items-end gap-2">
              <IndianRupee className="w-4 h-4 text-foreground" />
              <span className="text-3xl font-bold" data-testid="text-gp-price">{Number(gpCoil.price).toFixed(1)}</span>
              <span className="text-sm text-muted-foreground mb-0.5">/kg</span>
              <div className="ml-auto flex items-center gap-1">
                {gpCoil.trend === "up" && <TrendingUp className="w-4 h-4 text-green-500" />}
                {gpCoil.trend === "down" && <TrendingDown className="w-4 h-4 text-red-500" />}
                {gpCoil.trend !== "up" && gpCoil.trend !== "down" && <Minus className="w-4 h-4 text-muted-foreground" />}
                {gpCoil.previousPrice && (
                  <span className={`text-xs font-medium ${gpCoil.trend === "up" ? "text-green-500" : gpCoil.trend === "down" ? "text-red-500" : "text-muted-foreground"}`}>
                    {Number(gpCoil.price) - Number(gpCoil.previousPrice) > 0 ? "+" : ""}{(Number(gpCoil.price) - Number(gpCoil.previousPrice)).toFixed(1)}
                  </span>
                )}
              </div>
            </div>
            {gpCoil.prediction && (
              <p className="text-[10px] text-muted-foreground mt-2">Prediction: {gpCoil.prediction}</p>
            )}
          </Card>
        </motion.div>
      )}

      {crCoil && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-4 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold">CR Coil</h3>
              <Badge variant="secondary" className="text-[10px]">
                <Clock className="w-3 h-3 mr-1" />
                {crCoil.date || "Today"}
              </Badge>
            </div>
            <div className="flex items-end gap-2">
              <IndianRupee className="w-4 h-4 text-foreground" />
              <span className="text-3xl font-bold">{Number(crCoil.price).toFixed(1)}</span>
              <span className="text-sm text-muted-foreground mb-0.5">/kg</span>
            </div>
          </Card>
        </motion.div>
      )}

      {coilPrices.map((item, i) => (
        <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-semibold">{item.title}</h4>
              {item.updatedAt && (
                <span className="text-[10px] text-muted-foreground">
                  Updated: {new Date(item.updatedAt).toLocaleDateString("en-IN")}
                </span>
              )}
            </div>
            {item.value && (
              <p className="text-lg font-bold text-primary">₹{item.value}/kg</p>
            )}
            {item.description && <p className="text-xs text-muted-foreground mt-1">{item.description}</p>}
          </Card>
        </motion.div>
      ))}

      {!gpCoil && !crCoil && coilPrices.length === 0 && (
        <Card className="p-8 text-center">
          <IndianRupee className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No price data available yet</p>
        </Card>
      )}
    </div>
  );
}

function DemandSection() {
  const { data: items, isLoading } = useQuery<IndustryData[]>({ queryKey: ["/api/industry-data"] });
  const demandData = items?.filter(d => d.type === "demand") || [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    );
  }

  if (demandData.length === 0) {
    return (
      <Card className="p-8 text-center">
        <BarChart3 className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No demand data available yet</p>
        <p className="text-xs text-muted-foreground mt-1">City-wise roll forming demand will appear here</p>
      </Card>
    );
  }

  const levels: Record<string, { color: string; label: string }> = {
    high: { color: "text-green-600 bg-green-500/10", label: "HIGH" },
    medium: { color: "text-amber-600 bg-amber-500/10", label: "MEDIUM" },
    low: { color: "text-red-600 bg-red-500/10", label: "LOW" },
  };

  return (
    <div className="space-y-3">
      {demandData.map((item, i) => {
        const level = levels[item.value?.toLowerCase() || "medium"] || levels.medium;
        return (
          <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">{item.city || item.title}</h4>
                    {item.description && <p className="text-[10px] text-muted-foreground">{item.description}</p>}
                  </div>
                </div>
                <Badge className={`text-[10px] ${level.color} border-0`}>{level.label}</Badge>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

function VideoSection() {
  const { data: items, isLoading } = useQuery<IndustryData[]>({ queryKey: ["/api/industry-data"] });
  const videos = items?.filter(d => d.type === "video") || [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Video className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No machine running videos yet</p>
        <p className="text-xs text-muted-foreground mt-1">Videos of machines in action will appear here</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {videos.map((item, i) => (
        <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
          <Card className="overflow-hidden">
            {item.videoUrl && (
              <div className="relative">
                {item.videoUrl.includes("youtube") || item.videoUrl.includes("youtu.be") ? (
                  <iframe
                    src={item.videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
                    className="w-full aspect-video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={item.title}
                  />
                ) : (
                  <a href={item.videoUrl} target="_blank" rel="noopener noreferrer" className="block">
                    <div className="w-full aspect-video bg-muted flex items-center justify-center">
                      <Play className="w-12 h-12 text-primary" />
                    </div>
                  </a>
                )}
              </div>
            )}
            <div className="p-3">
              <h4 className="text-sm font-semibold">{item.title}</h4>
              {item.description && <p className="text-xs text-muted-foreground mt-1">{item.description}</p>}
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

export default function IndustryDataPage() {
  return (
    <div className="pb-24 px-4">
      <div className="pt-4 pb-3">
        <h1 className="text-xl font-bold mb-1 flex items-center gap-2" data-testid="text-industry-title">
          <Factory className="w-5 h-5 text-primary" />
          Industry Data Hub
        </h1>
        <p className="text-sm text-muted-foreground">Daily coil prices, demand indicators & machine videos</p>
      </div>

      <Tabs defaultValue="prices">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="prices" className="flex-1" data-testid="tab-prices">
            <IndianRupee className="w-3.5 h-3.5 mr-1" />
            Prices
          </TabsTrigger>
          <TabsTrigger value="demand" className="flex-1" data-testid="tab-demand">
            <BarChart3 className="w-3.5 h-3.5 mr-1" />
            Demand
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex-1" data-testid="tab-videos">
            <Video className="w-3.5 h-3.5 mr-1" />
            Videos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prices">
          <CoilPriceSection />
        </TabsContent>
        <TabsContent value="demand">
          <DemandSection />
        </TabsContent>
        <TabsContent value="videos">
          <VideoSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
