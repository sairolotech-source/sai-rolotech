import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, Zap, Gauge, Settings2, ChevronRight, ChevronLeft,
  MapPin, Calendar, Phone, Search, X, Factory,
  Layers, Box, Cog, Star, ChevronDown, Grid3X3,
  Play, Volume2, VolumeX, MessageSquare, Share2,
  Weight, Ruler, BoltIcon, CircleDot, Shield, Crown,
  ArrowRight, Eye, Heart, ExternalLink
} from "lucide-react";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import BusinessDiscussion from "@/components/BusinessDiscussion";
import { FreemiumBadge } from "@/components/FreemiumBadge";

const CATEGORY_CONFIG: Record<string, { icon: any; gradient: string; desc: string; heroColor: string }> = {
  "Rolling Shutter": {
    icon: Layers,
    gradient: "from-blue-600 to-cyan-700",
    desc: "Shutter Patti, Guide Rail machines",
    heroColor: "from-blue-900/90 to-cyan-900/80",
  },
  "False Ceiling": {
    icon: Grid3X3,
    gradient: "from-emerald-600 to-teal-700",
    desc: "POP, Gypsum, T-Grid machines",
    heroColor: "from-emerald-900/90 to-teal-900/80",
  },
  "Door & Window": {
    icon: Box,
    gradient: "from-amber-600 to-orange-700",
    desc: "Door Frame, Window Section",
    heroColor: "from-amber-900/90 to-orange-900/80",
  },
  "Roofing & Cladding": {
    icon: Factory,
    gradient: "from-slate-700 to-zinc-800",
    desc: "Trapezoidal, Corrugated Sheet",
    heroColor: "from-slate-900/90 to-zinc-900/80",
  },
  "Structural": {
    icon: Cog,
    gradient: "from-purple-600 to-blue-700",
    desc: "C-Purlin, Z-Purlin machines",
    heroColor: "from-purple-900/90 to-blue-900/80",
  },
  "Solar & Infrastructure": {
    icon: Zap,
    gradient: "from-sky-600 to-cyan-700",
    desc: "Solar Channel, Guard Rail",
    heroColor: "from-sky-900/90 to-cyan-900/80",
  },
  "Drywall & Partition": {
    icon: Layers,
    gradient: "from-rose-600 to-pink-700",
    desc: "C-Channel, Stud machines",
    heroColor: "from-rose-900/90 to-pink-900/80",
  },
};

function ImageCarousel({ images, productName }: { images: string[]; productName: string }) {
  const [current, setCurrent] = useState(0);
  const touchStart = useRef(0);
  const touchEnd = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStart.current - touchEnd.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && current < images.length - 1) setCurrent(current + 1);
      if (diff < 0 && current > 0) setCurrent(current - 1);
    }
  };

  if (images.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-xl" data-testid="image-carousel">
      <div
        className="relative aspect-[4/3]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={images[current]}
            alt={`${productName} - ${current + 1}`}
            className="w-full h-full object-cover"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>

        {images.length > 1 && (
          <>
            {current > 0 && (
              <button
                onClick={() => setCurrent(current - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center"
                data-testid="button-carousel-prev"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {current < images.length - 1 && (
              <button
                onClick={() => setCurrent(current + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center"
                data-testid="button-carousel-next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </>
        )}

        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
          {current + 1}/{images.length}
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex gap-1.5 p-2 overflow-x-auto scrollbar-hide">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                i === current ? "border-primary ring-1 ring-primary/30" : "border-transparent opacity-60"
              }`}
              data-testid={`button-thumb-${i}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {images.length > 1 && (
        <div className="flex justify-center gap-1 pb-2">
          {images.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all ${
                i === current ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function VideoPlayer({ url, title }: { url: string; title: string }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})/);
    return match ? match[1] : null;
  };

  const ytId = getYouTubeId(url);

  if (ytId) {
    return (
      <div className="relative rounded-xl overflow-hidden" data-testid="video-player">
        {!isPlaying ? (
          <div className="relative">
            <img
              src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
              alt={title}
              className="w-full aspect-video object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <button
                onClick={() => setIsPlaying(true)}
                className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                data-testid="button-play-video"
              >
                <Play className="w-7 h-7 text-red-600 ml-1" />
              </button>
            </div>
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-white text-xs font-medium drop-shadow-lg line-clamp-1">{title}</p>
            </div>
          </div>
        ) : (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
            className="w-full aspect-video"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title={title}
          />
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden" data-testid="video-player">
      <video
        src={url}
        controls
        playsInline
        preload="metadata"
        className="w-full aspect-video object-cover"
      >
        <source src={url} />
      </video>
    </div>
  );
}

function SpecsTable({ product }: { product: Product }) {
  const specs = [
    { icon: Gauge, label: "Gauge Range", value: product.gauge },
    { icon: CircleDot, label: "Stations / Rolls", value: product.stations },
    { icon: Zap, label: "Speed", value: product.speed },
    { icon: BoltIcon, label: "Motor", value: product.motor },
    { icon: Settings2, label: "Cutting Type", value: product.cuttingType },
    { icon: Layers, label: "Decoiler", value: product.decoilerType },
    { icon: Ruler, label: "Machine Type", value: product.machineType },
    { icon: Shield, label: "Automation", value: product.automation },
    { icon: Settings2, label: "Model", value: product.model },
  ].filter(s => s.value);

  if (specs.length === 0) return null;

  return (
    <div data-testid="specs-table">
      <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
        <Settings2 className="w-4 h-4 text-primary" />
        Machine Specifications
      </h3>
      <div className="rounded-xl border overflow-hidden">
        {specs.map((spec, i) => (
          <div
            key={spec.label}
            className={`flex items-center gap-3 px-4 py-3 ${
              i % 2 === 0 ? "bg-accent/30" : "bg-background"
            } ${i < specs.length - 1 ? "border-b" : ""}`}
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <spec.icon className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{spec.label}</p>
              <p className="text-sm font-semibold">{spec.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FloatingCTA({ product }: { product: Product }) {
  const whatsappUrl = `https://wa.me/919090486262?text=${encodeURIComponent(
    `Hi, I'm interested in ${product.name}. Please share details and pricing.`
  )}`;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-20 left-3 right-3 z-40"
      data-testid="floating-cta"
    >
      <div className="max-w-lg mx-auto">
        <div className="rounded-2xl p-3 shadow-xl border border-white/10"
          style={{
            background: "linear-gradient(135deg, rgba(0,119,255,0.95), rgba(0,212,255,0.95))",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              {product.estimatedPrice && (
                <p className="text-white/80 text-[10px]">Starting from</p>
              )}
              <p className="text-white font-bold text-lg">
                {product.estimatedPrice
                  ? `₹${Number(product.estimatedPrice) >= 1
                    ? `${product.estimatedPrice} Lakh`
                    : `${(Number(product.estimatedPrice) * 100000).toLocaleString()}`}`
                  : "Get Quote"}
              </p>
            </div>
            <Button
              className="bg-white text-primary hover:bg-white/90 font-bold shadow-lg px-5"
              asChild
              data-testid="button-enquire-cta"
            >
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Phone className="w-4 h-4 mr-1.5" />
                Enquire Now
              </a>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProductDetail({ product, onBack, allProducts }: { product: Product; onBack: () => void; allProducts: Product[] }) {
  const gallery = product.gallery || [product.image];
  const whatsappUrl = `https://wa.me/919090486262?text=${encodeURIComponent(`Hi, I'm interested in ${product.name}. Please share details and pricing.`)}`;

  const relatedMachines = useMemo(() =>
    allProducts
      .filter(p => p.id !== product.id && (p.category === product.category || p.subCategory === product.subCategory))
      .slice(0, 6),
    [allProducts, product]
  );

  return (
    <div className="pb-32">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b px-4 py-3 flex items-center gap-3">
        <Button size="icon" variant="ghost" onClick={onBack} data-testid="button-back-catalog">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="font-semibold truncate flex-1 text-sm" data-testid="text-product-name">{product.name}</h2>
        <Button size="icon" variant="ghost" onClick={() => {
          if (navigator.share) {
            navigator.share({ title: product.name, text: product.description, url: window.location.href });
          }
        }} data-testid="button-share">
          <Share2 className="w-4 h-4" />
        </Button>
      </div>

      {product.videoUrl && (
        <div className="relative">
          <VideoPlayer url={product.videoUrl} title={`${product.name} - Machine Demo`} />
          <div className="absolute top-3 left-3">
            <Badge className="bg-red-600 text-white text-[10px] gap-1">
              <Play className="w-2.5 h-2.5" /> Video Demo
            </Badge>
          </div>
        </div>
      )}

      <div className="px-4 pt-4">
        <ImageCarousel images={gallery} productName={product.name} />
      </div>

      <div className="p-4 space-y-5">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <Badge className={`text-[10px] bg-gradient-to-r ${CATEGORY_CONFIG[product.category]?.gradient || "from-gray-600 to-gray-700"} text-white border-0`}>
              {product.category}
            </Badge>
            <Badge variant="outline" className="text-[10px]">{product.subCategory}</Badge>
            <Badge variant="secondary" className="text-[10px]">{product.automation}</Badge>
            <Badge variant="secondary" className="text-[10px]">{product.model}</Badge>
            <FreemiumBadge isPaid={false} />
          </div>

          <h1 className="text-xl font-bold mb-2 leading-tight" data-testid="text-product-title">{product.name}</h1>

          {product.estimatedPrice && (
            <div className="flex items-center gap-3 mb-3">
              <p className="text-2xl font-bold text-primary" data-testid="text-price">
                ₹{Number(product.estimatedPrice) >= 1
                  ? `${product.estimatedPrice} Lakh`
                  : `${(Number(product.estimatedPrice) * 100000).toLocaleString()}`}
              </p>
              <Badge variant="outline" className="text-[10px] text-green-600 border-green-200">
                EMI Available
              </Badge>
            </div>
          )}
        </div>

        {product.profileType && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-4 pb-4">
              <p className="text-[10px] text-primary font-semibold uppercase tracking-wider mb-2">Profile Types Available</p>
              <div className="flex flex-wrap gap-1.5">
                {product.profileType.split(/[+,\/]/).map((p: string, i: number) => (
                  <Badge key={i} className="text-[10px] bg-primary/10 text-primary border-primary/20">
                    {p.trim()}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <SpecsTable product={product} />

        {product.isUsed && (
          <Card className="border-amber-300/50 bg-gradient-to-br from-amber-50/80 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/20">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-amber-500 text-white text-[10px]">PRE-OWNED</Badge>
                {product.condition && <Badge variant="outline" className="text-[10px]">{product.condition}</Badge>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {product.yearOfPurchase && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <div>
                      <p className="text-[9px] text-muted-foreground">Year</p>
                      <p className="text-xs font-semibold">{product.yearOfPurchase}</p>
                    </div>
                  </div>
                )}
                {product.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    <div>
                      <p className="text-[9px] text-muted-foreground">Location</p>
                      <p className="text-xs font-semibold">{product.location}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div>
          <h3 className="text-sm font-bold mb-2">Description</h3>
          <p className="text-sm leading-relaxed text-muted-foreground" data-testid="text-product-desc">
            {product.description}
          </p>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1 h-12 text-sm font-bold" asChild data-testid="button-whatsapp-enquiry">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Enquire on WhatsApp
            </a>
          </Button>
          <Button variant="outline" className="h-12" asChild data-testid="button-call">
            <a href="tel:+919090486262">
              <Phone className="w-5 h-5" />
            </a>
          </Button>
        </div>

        <BusinessDiscussion
          entityType="product"
          entityId={product.id}
          title="Machine Discussion"
        />

        {relatedMachines.length > 0 && (
          <div>
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-primary" />
              Related Machines
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {relatedMachines.map(rm => (
                <Card
                  key={rm.id}
                  className="shrink-0 w-[180px] cursor-pointer hover-elevate"
                  onClick={() => {
                    window.scrollTo(0, 0);
                    onBack();
                    setTimeout(() => {
                      const event = new CustomEvent("selectProduct", { detail: rm });
                      window.dispatchEvent(event);
                    }, 100);
                  }}
                  data-testid={`card-related-${rm.id}`}
                >
                  <div className="relative m-1.5 rounded-md overflow-hidden">
                    <img src={rm.image} alt={rm.name} className="w-full aspect-[4/3] object-cover" />
                    {rm.videoUrl && (
                      <div className="absolute top-1 right-1">
                        <Badge className="bg-red-600/80 text-white text-[8px] px-1 py-0">
                          <Play className="w-2 h-2 mr-0.5" />Video
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="px-2 pb-2">
                    <h4 className="text-[10px] font-bold line-clamp-2 leading-tight mb-1">{rm.name}</h4>
                    {rm.estimatedPrice && (
                      <p className="text-xs font-bold text-primary">
                        ₹{Number(rm.estimatedPrice) >= 1 ? `${rm.estimatedPrice}L` : `${(Number(rm.estimatedPrice) * 100000).toLocaleString()}`}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <FloatingCTA product={product} />
    </div>
  );
}

function HeroSection({ featuredProduct, onSelect }: { featuredProduct: Product | null; onSelect: (p: Product) => void }) {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!featuredProduct) return null;

  const hasVideo = !!featuredProduct.videoUrl;
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})/);
    return match ? match[1] : null;
  };
  const ytId = hasVideo ? getYouTubeId(featuredProduct.videoUrl!) : null;

  return (
    <div className="relative mb-6" data-testid="hero-section">
      <div className="relative h-[280px] overflow-hidden rounded-b-3xl">
        {ytId ? (
          <div className="relative w-full h-full">
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
              className="w-full h-full"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              allow="autoplay; encrypted-media"
              allowFullScreen
              title={featuredProduct.name}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
            <div className="absolute top-4 right-4 z-10">
              <Badge className="bg-black/40 backdrop-blur-sm text-white border-0 text-[10px] gap-1">
                <VolumeX className="w-3 h-3" /> Muted
              </Badge>
            </div>
          </div>
        ) : hasVideo ? (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              src={featuredProduct.videoUrl}
              autoPlay
              muted={isMuted}
              loop
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
            <button
              onClick={() => {
                setIsMuted(!isMuted);
                if (videoRef.current) videoRef.current.muted = !isMuted;
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center z-10"
              data-testid="button-hero-mute"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        ) : (
          <>
            <img
              src={featuredProduct.image}
              alt={featuredProduct.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          </>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
          <Badge className="bg-white/20 backdrop-blur-sm text-white border-0 text-[10px] mb-2">
            {hasVideo ? "Featured Machine — Video Demo" : "Featured Machine"}
          </Badge>
          <h2 className="text-white text-lg font-bold leading-tight mb-1 drop-shadow-lg line-clamp-2">
            {featuredProduct.name}
          </h2>
          <div className="flex items-center gap-3 mb-3">
            {featuredProduct.estimatedPrice && (
              <p className="text-white text-xl font-bold">
                ₹{Number(featuredProduct.estimatedPrice) >= 1
                  ? `${featuredProduct.estimatedPrice} Lakh`
                  : `${(Number(featuredProduct.estimatedPrice) * 100000).toLocaleString()}`}
              </p>
            )}
            <Badge className="bg-green-500/80 text-white border-0 text-[10px]">
              {featuredProduct.automation}
            </Badge>
          </div>
          <Button
            size="sm"
            className="bg-white text-black hover:bg-white/90 font-semibold"
            onClick={() => onSelect(featuredProduct)}
            data-testid="button-hero-view"
          >
            <Eye className="w-3.5 h-3.5 mr-1.5" />
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
}

function CardGallery({ images, productName }: { images: string[]; productName: string }) {
  const [idx, setIdx] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const onTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    touchStartX.current = e.targetTouches[0].clientX;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0 && idx < images.length - 1) setIdx(idx + 1);
      if (diff < 0 && idx > 0) setIdx(idx - 1);
    }
  };

  if (images.length <= 1) {
    return (
      <img src={images[0]} alt={productName} className="w-full aspect-[4/3] object-cover transition-transform duration-300 group-hover:scale-105" />
    );
  }

  return (
    <div
      className="relative aspect-[4/3] overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <img
        src={images[idx]}
        alt={`${productName} ${idx + 1}`}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-0.5">
        {images.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all ${
              i === idx ? "w-3 bg-white" : "w-1 bg-white/50"
            }`}
          />
        ))}
      </div>
      {idx > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); setIdx(idx - 1); }}
          className="absolute left-0.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-black/30 text-white flex items-center justify-center"
        >
          <ChevronLeft className="w-3 h-3" />
        </button>
      )}
      {idx < images.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setIdx(idx + 1); }}
          className="absolute right-0.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-black/30 text-white flex items-center justify-center"
        >
          <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

function MachineCard({ product, onClick }: { product: Product; onClick: () => void }) {
  const cardImages = product.gallery && product.gallery.length > 0
    ? product.gallery.slice(0, 4)
    : [product.image];

  return (
    <Card
      className="cursor-pointer hover-elevate overflow-hidden group"
      onClick={onClick}
      data-testid={`card-product-${product.id}`}
    >
      <div className="relative m-1.5 rounded-lg overflow-hidden">
        <CardGallery images={cardImages} productName={product.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {product.isUsed && (
          <Badge className="absolute top-1.5 left-1.5 text-[8px] bg-amber-500 text-white border-0">PRE-OWNED</Badge>
        )}
        {product.videoUrl && (
          <div className="absolute top-1.5 right-1.5">
            <Badge className="bg-red-600/80 text-white text-[8px] px-1.5 py-0 border-0">
              <Play className="w-2 h-2 mr-0.5" />Video
            </Badge>
          </div>
        )}
        {product.model && !product.videoUrl && (
          <Badge variant="secondary" className="absolute top-1.5 right-1.5 text-[8px] bg-background/80 backdrop-blur-sm">
            {product.model}
          </Badge>
        )}
      </div>
      <div className="px-2.5 pb-2.5">
        <h3 className="text-[11px] font-bold leading-tight mb-1 line-clamp-2">{product.name}</h3>

        <div className="flex flex-wrap items-center gap-1 mb-1.5">
          <Badge variant="outline" className="text-[8px] px-1.5 py-0">{product.machineType}</Badge>
          <Badge variant="secondary" className="text-[8px] px-1.5 py-0">{product.automation}</Badge>
        </div>

        {product.profileType && (
          <p className="text-[9px] text-muted-foreground truncate mb-1.5">{product.profileType}</p>
        )}

        <div className="flex items-center justify-between">
          {product.estimatedPrice && (
            <p className="text-sm font-bold text-primary">
              ₹{Number(product.estimatedPrice) >= 1
                ? `${product.estimatedPrice}L`
                : `${(Number(product.estimatedPrice) * 100000).toLocaleString()}`}
            </p>
          )}
          {product.isUsed && product.location && (
            <p className="text-[9px] text-muted-foreground flex items-center gap-0.5">
              <MapPin className="w-2.5 h-2.5" />{product.location.split(",")[0]}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

function CategoryCard({ name, config, count, isSelected, onClick }: {
  name: string; config: typeof CATEGORY_CONFIG[string]; count: number; isSelected: boolean; onClick: () => void;
}) {
  const Icon = config.icon;
  return (
    <button
      onClick={onClick}
      className={`text-left rounded-xl p-3 transition-all border-2 ${
        isSelected
          ? "border-primary bg-primary/5 shadow-md"
          : "border-transparent bg-card hover:border-muted-foreground/20"
      }`}
      data-testid={`card-category-${name}`}
    >
      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center mb-2`}>
        <Icon className="w-4.5 h-4.5 text-white" />
      </div>
      <h3 className="text-xs font-bold mb-0.5 leading-tight">{name}</h3>
      <p className="text-[9px] text-muted-foreground leading-snug">{config.desc}</p>
      <Badge variant="secondary" className="text-[8px] mt-1.5">{count} machines</Badge>
    </button>
  );
}

function SubCategorySection({ subCategory, products, onSelect }: {
  subCategory: string; products: Product[]; onSelect: (p: Product) => void;
}) {
  const machineTypes = [...new Set(products.map(p => p.machineType))];
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="mb-4" data-testid={`section-${subCategory}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-1 mb-2"
      >
        <div>
          <h3 className="text-sm font-bold text-left">{subCategory}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[9px]">{products.length}</Badge>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? "" : "-rotate-90"}`} />
        </div>
      </button>

      {expanded && (
        <>
          {machineTypes.length > 1 && (
            <div className="mb-3 px-1">
              <div className="flex flex-wrap gap-1.5">
                {machineTypes.map(mt => (
                  <Badge key={mt} variant="outline" className="text-[9px]">{mt}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            {products.map(product => (
              <MachineCard key={product.id} product={product} onClick={() => onSelect(product)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CatalogSkeleton() {
  return (
    <div className="space-y-4 px-4">
      <Skeleton className="h-[280px] w-full rounded-b-3xl" />
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <Skeleton className="w-full aspect-[4/3] m-1.5 rounded-md" />
            <div className="p-2.5">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function Catalog() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  useEffect(() => {
    const handler = (e: Event) => {
      const product = (e as CustomEvent).detail;
      if (product) setSelectedProduct(product);
    };
    window.addEventListener("selectProduct", handler);
    return () => window.removeEventListener("selectProduct", handler);
  }, []);

  const newProducts = useMemo(() =>
    products?.filter(p => !p.isUsed) || [], [products]);

  const usedProducts = useMemo(() =>
    products?.filter(p => p.isUsed) || [], [products]);

  const featuredProduct = useMemo(() => {
    const withVideo = newProducts.filter(p => p.videoUrl);
    if (withVideo.length > 0) return withVideo[0];
    return newProducts[0] || null;
  }, [newProducts]);

  const categories = useMemo(() => {
    const catCounts: Record<string, number> = {};
    newProducts.forEach(p => {
      catCounts[p.category] = (catCounts[p.category] || 0) + 1;
    });
    return Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
  }, [newProducts]);

  const subCategoryGroups = useMemo(() => {
    if (!selectedCategory) return {};
    const groups: Record<string, Product[]> = {};
    newProducts
      .filter(p => p.category === selectedCategory)
      .forEach(p => {
        if (!groups[p.subCategory]) groups[p.subCategory] = [];
        groups[p.subCategory].push(p);
      });
    return groups;
  }, [newProducts, selectedCategory]);

  const filterProducts = (items: Product[]) => {
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.subCategory.toLowerCase().includes(q) ||
      (p.profileType || "").toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  };

  if (isLoading) {
    return <CatalogSkeleton />;
  }

  if (selectedProduct) {
    return <ProductDetail product={selectedProduct} onBack={() => setSelectedProduct(null)} allProducts={products || []} />;
  }

  const displayCategories = showAllCategories ? categories : categories.slice(0, 6);

  return (
    <div className="pb-24">
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold mb-0.5" data-testid="text-catalog-title">Machine Catalog</h1>
            <p className="text-xs text-muted-foreground">Premium Roll Forming Machines — Browse by Category</p>
          </div>
          <Badge variant="secondary" className="text-[10px]">
            {products?.length || 0} machines
          </Badge>
        </div>
      </div>

      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search machines, profiles, categories..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setSelectedCategory(null); }}
            className="pl-10 h-10 text-xs rounded-xl"
            data-testid="input-search"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2" data-testid="button-clear-search">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {searchQuery ? (
        <div className="px-4">
          <p className="text-xs text-muted-foreground mb-3">
            {filterProducts(newProducts).length} results for "{searchQuery}"
          </p>
          {filterProducts(newProducts).length > 0 ? (
            <div className="grid grid-cols-2 gap-2.5">
              {filterProducts(newProducts).map(product => (
                <MachineCard key={product.id} product={product} onClick={() => setSelectedProduct(product)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No machines found</p>
            </div>
          )}
        </div>
      ) : !selectedCategory ? (
        <>
          <HeroSection
            featuredProduct={featuredProduct}
            onSelect={setSelectedProduct}
          />

          <div className="px-4 mb-4">
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-sm font-bold">Categories</h2>
              <Badge variant="secondary" className="text-[9px]">{categories.length} categories</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {displayCategories.map(([cat, count]) => {
                const config = CATEGORY_CONFIG[cat] || { icon: Settings2, gradient: "from-gray-600 to-gray-700", desc: cat, heroColor: "from-gray-900/90 to-gray-900/80" };
                return (
                  <CategoryCard
                    key={cat}
                    name={cat}
                    config={config}
                    count={count}
                    isSelected={false}
                    onClick={() => setSelectedCategory(cat)}
                  />
                );
              })}
            </div>
            {categories.length > 6 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 text-xs"
                onClick={() => setShowAllCategories(!showAllCategories)}
                data-testid="button-show-more-categories"
              >
                {showAllCategories ? "Show Less" : `Show All (${categories.length})`}
                <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${showAllCategories ? "rotate-180" : ""}`} />
              </Button>
            )}
          </div>

          {usedProducts.length > 0 && (
            <div className="px-4">
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="text-sm font-bold flex items-center gap-2">
                  Used Machines
                  <Badge className="text-[9px] bg-amber-500 text-white border-0">{usedProducts.length} available</Badge>
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {usedProducts.slice(0, 4).map(product => (
                  <MachineCard key={product.id} product={product} onClick={() => setSelectedProduct(product)} />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="px-4">
          <div className="flex items-center gap-2 mb-4">
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setSelectedCategory(null)} data-testid="button-back-categories">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <h2 className="text-sm font-bold">{selectedCategory}</h2>
              <p className="text-[10px] text-muted-foreground">
                {CATEGORY_CONFIG[selectedCategory]?.desc || ""}
              </p>
            </div>
            <Badge variant="secondary" className="text-[9px]">
              {newProducts.filter(p => p.category === selectedCategory).length} machines
            </Badge>
          </div>

          {Object.entries(subCategoryGroups).map(([subCat, prods]) => (
            <SubCategorySection
              key={subCat}
              subCategory={subCat}
              products={prods}
              onSelect={setSelectedProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
}
