import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowLeft, Zap, Gauge, Settings2, ChevronRight,
  MapPin, Calendar, Phone, Filter, Search, X, Factory,
  Layers, Box, Cog, Star, ChevronDown, Grid3X3
} from "lucide-react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";

const CATEGORY_CONFIG: Record<string, { icon: any; gradient: string; desc: string; profiles?: string[] }> = {
  "Rolling Shutter": {
    icon: Layers,
    gradient: "from-indigo-600 to-blue-700",
    desc: "Shutter Patti, Guide Rail machines",
    profiles: ["Round Type", "Ribbed Type", "Perforated", "Flat Type"],
  },
  "False Ceiling": {
    icon: Grid3X3,
    gradient: "from-emerald-600 to-teal-700",
    desc: "POP, Gypsum, T-Grid machines",
    profiles: ["Ceiling Channel", "Perimeter Channel", "Intermediate Channel", "Angle Channel", "Main Channel", "Cross Channel"],
  },
  "Door & Window": {
    icon: Box,
    gradient: "from-amber-600 to-orange-700",
    desc: "Door Frame, Window Section",
  },
  "Roofing & Cladding": {
    icon: Factory,
    gradient: "from-slate-700 to-zinc-800",
    desc: "Trapezoidal, Corrugated Sheet",
  },
  "Structural": {
    icon: Cog,
    gradient: "from-violet-600 to-purple-700",
    desc: "C-Purlin, Z-Purlin machines",
  },
  "Solar & Infrastructure": {
    icon: Zap,
    gradient: "from-sky-600 to-cyan-700",
    desc: "Solar Channel, Guard Rail",
  },
  "Drywall & Partition": {
    icon: Layers,
    gradient: "from-rose-600 to-pink-700",
    desc: "C-Channel, Stud machines",
  },
};

const SUBCATEGORY_INFO: Record<string, { desc: string; machineTypes: string[]; profiles: string[] }> = {
  "Gypsum Channel": {
    desc: "Gypsum false ceiling system ke 4 profiles",
    machineTypes: ["Single Machine", "2-in-1 Machine", "4-in-1 Machine"],
    profiles: ["Ceiling Channel", "Perimeter Channel", "Intermediate Channel", "Angle Channel"],
  },
  "POP Channel": {
    desc: "POP false ceiling system ke profiles",
    machineTypes: ["Single Machine", "2-in-1 Machine", "3-in-1 Machine"],
    profiles: ["Main Channel", "Cross Channel", "Angle Channel"],
  },
  "Multi Profile": {
    desc: "Multiple profiles in one machine",
    machineTypes: ["3-in-1 Machine"],
    profiles: ["Main + Cross + Angle Channel"],
  },
  "Shutter Patti": {
    desc: "Rolling shutter strip forming",
    machineTypes: ["Single Machine"],
    profiles: ["Round Type", "Ribbed Type", "Perforated", "Flat Type"],
  },
};

function ProductDetail({ product, onBack }: { product: Product; onBack: () => void }) {
  const [activeImage, setActiveImage] = useState(0);
  const gallery = product.gallery || [product.image];
  const whatsappUrl = `https://wa.me/919090486262?text=${encodeURIComponent(`Hi, I'm interested in ${product.name}. Please share details and pricing.`)}`;

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-4 py-3 flex items-center gap-3">
        <Button size="icon" variant="ghost" onClick={onBack} data-testid="button-back-catalog">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="font-semibold truncate flex-1" data-testid="text-product-name">{product.name}</h2>
      </div>

      <div className="relative">
        <img
          src={gallery[activeImage]}
          alt={product.name}
          className="w-full aspect-[4/3] object-cover"
          data-testid="img-product-main"
        />
        {gallery.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto">
            {gallery.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${i === activeImage ? "border-primary" : "border-transparent"}`}
                data-testid={`button-gallery-${i}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="secondary" data-testid="badge-category">{product.category}</Badge>
            <Badge variant="outline" data-testid="badge-subcategory">{product.subCategory}</Badge>
            <Badge variant="secondary" data-testid="badge-automation">{product.automation}</Badge>
            <Badge variant="secondary" data-testid="badge-model">{product.model}</Badge>
          </div>
          <h1 className="text-xl font-bold mb-1" data-testid="text-product-title">{product.name}</h1>
          {product.estimatedPrice && (
            <p className="text-lg font-bold text-primary mb-2" data-testid="text-price">
              Starting from ₹{Number(product.estimatedPrice) >= 1
                ? `${product.estimatedPrice} Lakh`
                : `${(Number(product.estimatedPrice) * 100000).toLocaleString()}`
              }
            </p>
          )}
        </div>

        {product.machineType && (
          <div className="bg-accent/50 rounded-lg p-3">
            <p className="text-[10px] text-muted-foreground mb-1">Machine Type</p>
            <p className="text-xs font-bold">{product.machineType}</p>
          </div>
        )}

        {product.profileType && (
          <Card className="p-3">
            <p className="text-[10px] text-muted-foreground mb-1.5">Profile Types</p>
            <div className="flex flex-wrap gap-1.5">
              {product.profileType.split(/[+,\/]/).map((p, i) => (
                <Badge key={i} variant="outline" className="text-[10px]">{p.trim()}</Badge>
              ))}
            </div>
          </Card>
        )}

        <div className="grid grid-cols-2 gap-2">
          {product.gauge && (
            <div className="bg-accent/50 rounded-lg p-2.5">
              <p className="text-[9px] text-muted-foreground">Gauge Range</p>
              <p className="text-xs font-bold">{product.gauge}</p>
            </div>
          )}
          {product.stations && (
            <div className="bg-accent/50 rounded-lg p-2.5">
              <p className="text-[9px] text-muted-foreground">Stations</p>
              <p className="text-xs font-bold">{product.stations}</p>
            </div>
          )}
          {product.speed && (
            <div className="bg-accent/50 rounded-lg p-2.5">
              <p className="text-[9px] text-muted-foreground">Speed</p>
              <p className="text-xs font-bold">{product.speed}</p>
            </div>
          )}
          {product.motor && (
            <div className="bg-accent/50 rounded-lg p-2.5">
              <p className="text-[9px] text-muted-foreground">Motor</p>
              <p className="text-xs font-bold">{product.motor}</p>
            </div>
          )}
          {product.cuttingType && (
            <div className="bg-accent/50 rounded-lg p-2.5">
              <p className="text-[9px] text-muted-foreground">Cutting</p>
              <p className="text-xs font-bold">{product.cuttingType}</p>
            </div>
          )}
          {product.decoilerType && (
            <div className="bg-accent/50 rounded-lg p-2.5">
              <p className="text-[9px] text-muted-foreground">Decoiler</p>
              <p className="text-xs font-bold">{product.decoilerType}</p>
            </div>
          )}
        </div>

        {product.isUsed && (
          <Card className="p-3 border-amber-300/50 bg-amber-50/50 dark:bg-amber-950/20">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-amber-500 text-[10px]">USED</Badge>
              {product.condition && <Badge variant="outline" className="text-[10px]">{product.condition}</Badge>}
            </div>
            {product.yearOfPurchase && (
              <div className="flex items-center gap-1.5 text-xs">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                <span>Year: {product.yearOfPurchase}</span>
              </div>
            )}
            {product.location && (
              <div className="flex items-center gap-1.5 text-xs mt-1">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span>{product.location}</span>
              </div>
            )}
          </Card>
        )}

        <p className="text-sm leading-relaxed text-muted-foreground" data-testid="text-product-desc">
          {product.description}
        </p>

        <div className="flex gap-3 pt-2">
          <Button className="flex-1" asChild data-testid="button-whatsapp-enquiry">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Phone className="w-4 h-4 mr-2" />
              Enquire on WhatsApp
            </a>
          </Button>
          <Button variant="outline" asChild data-testid="button-call">
            <a href="tel:+919090486262">
              <Phone className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
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
  const info = SUBCATEGORY_INFO[subCategory];
  const machineTypes = [...new Set(products.map(p => p.machineType))];
  const automationTypes = [...new Set(products.map(p => p.automation))];
  const models = [...new Set(products.map(p => p.model))];
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="mb-4" data-testid={`section-${subCategory}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-1 mb-2"
      >
        <div>
          <h3 className="text-sm font-bold text-left">{subCategory}</h3>
          {info && <p className="text-[10px] text-muted-foreground text-left">{info.desc}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[9px]">{products.length}</Badge>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? "" : "-rotate-90"}`} />
        </div>
      </button>

      {expanded && (
        <>
          {info && info.profiles.length > 0 && (
            <div className="mb-3 px-1">
              <p className="text-[9px] text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">Profiles</p>
              <div className="flex flex-wrap gap-1.5">
                {info.profiles.map(p => (
                  <Badge key={p} variant="secondary" className="text-[9px] bg-primary/5 border-primary/20 text-primary">
                    {p}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {machineTypes.length > 1 && (
            <div className="mb-3 px-1">
              <p className="text-[9px] text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">Machine Types</p>
              <div className="flex flex-wrap gap-1.5">
                {machineTypes.map(mt => (
                  <Badge key={mt} variant="outline" className="text-[9px]">{mt}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            {products.map(product => (
              <ProductCard key={product.id} product={product} onClick={() => onSelect(product)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  return (
    <Card
      className="cursor-pointer hover-elevate"
      onClick={onClick}
      data-testid={`card-product-${product.id}`}
    >
      <div className="relative m-1.5 rounded-md overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full aspect-[4/3] object-cover"
        />
        {product.isUsed && (
          <Badge className="absolute top-1.5 left-1.5 text-[8px] bg-amber-500">USED</Badge>
        )}
        {product.model && (
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
                : `${(Number(product.estimatedPrice) * 100000).toLocaleString()}`
              }
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

function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 px-4">
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

  const newProducts = useMemo(() =>
    products?.filter(p => !p.isUsed) || [], [products]);

  const usedProducts = useMemo(() =>
    products?.filter(p => p.isUsed) || [], [products]);

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

  if (selectedProduct) {
    return <ProductDetail product={selectedProduct} onBack={() => setSelectedProduct(null)} />;
  }

  const displayCategories = showAllCategories ? categories : categories.slice(0, 6);

  return (
    <div className="pb-24">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold mb-0.5" data-testid="text-catalog-title">Machine Catalog</h1>
        <p className="text-xs text-muted-foreground">Industrial roll forming machines — category wise browse karein</p>
      </div>

      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Machine search karein..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setSelectedCategory(null); }}
            className="pl-10 h-9 text-xs"
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
                <ProductCard key={product.id} product={product} onClick={() => setSelectedProduct(product)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Koi machine nahi mili</p>
            </div>
          )}
        </div>
      ) : !selectedCategory ? (
        <>
          <div className="px-4 mb-4">
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-sm font-bold">Categories</h2>
              <Badge variant="secondary" className="text-[9px]">{categories.length} categories</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {displayCategories.map(([cat, count]) => {
                const config = CATEGORY_CONFIG[cat] || { icon: Settings2, gradient: "from-gray-600 to-gray-700", desc: cat };
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
                <h2 className="text-sm font-bold">Used Machines</h2>
                <Badge className="text-[9px] bg-amber-500">{usedProducts.length} available</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {usedProducts.slice(0, 4).map(product => (
                  <ProductCard key={product.id} product={product} onClick={() => setSelectedProduct(product)} />
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