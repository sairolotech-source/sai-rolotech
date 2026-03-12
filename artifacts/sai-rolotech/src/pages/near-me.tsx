import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Manufacturer } from "@shared/schema";
import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  Search, MapPin, Phone, Mail, Factory, ChevronLeft, Filter, X,
  Navigation, Loader2, Building2, ChevronRight, Star, Zap
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type ManufacturerWithDistance = Manufacturer & { distance: number | null };

const POPULAR_SEARCHES = [
  "Shutter Patti Manufacturer Near Me",
  "False Ceiling Channel Manufacturer",
  "Roofing Sheet Machine Near Me",
  "GP Coil Supplier Near Me",
  "POP Channel Machine Manufacturer",
  "Door Frame Machine Near Me",
  "Gypsum Channel Manufacturer",
];

const PRODUCT_FILTERS = [
  "Shutter Patti", "False Ceiling Channel", "POP Channel",
  "Gypsum Channel", "Roofing Sheet", "Door Frame", "GP Coil",
];

const MATERIAL_FILTERS = ["GI", "GP", "CR"];

const DISTANCE_FILTERS = [
  { label: "10 km", value: 10 },
  { label: "50 km", value: 50 },
  { label: "100 km", value: 100 },
  { label: "500 km", value: 500 },
  { label: "Any", value: 99999 },
];

const MACHINE_TYPE_FILTERS = [
  "Roll Forming Machine", "Shutter Patti Machine",
  "False Ceiling Machine", "Roofing Sheet Machine", "Door Frame Machine",
];

function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function ContactModal({
  manufacturer,
  onClose,
}: {
  manufacturer: Manufacturer;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLoc] = useState("");
  const { toast } = useToast();

  const leadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/manufacturer-leads", {
        name,
        phone,
        location: location || null,
        manufacturerId: manufacturer.id,
        manufacturerName: manufacturer.name,
      });
    },
    onSuccess: () => {
      toast({ title: "Request Sent!", description: `${manufacturer.name} will contact you soon.` });
      onClose();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send request. Try calling directly.", variant: "destructive" });
    },
  });

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md mx-auto glass-card rounded-t-3xl sm:rounded-3xl p-6 max-h-[85vh] overflow-y-auto"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        onClick={(e) => e.stopPropagation()}
        data-testid="contact-modal"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Contact {manufacturer.name}</h3>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded-full" data-testid="button-close-contact">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Your Name *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              data-testid="input-contact-name"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone Number *</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              type="tel"
              data-testid="input-contact-phone"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Your Location</label>
            <Input
              value={location}
              onChange={(e) => setLoc(e.target.value)}
              placeholder="City / Area"
              data-testid="input-contact-location"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            className="flex-1"
            disabled={!name.trim() || !phone.trim() || phone.length < 10 || leadMutation.isPending}
            onClick={() => leadMutation.mutate()}
            data-testid="button-submit-contact"
          >
            {leadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Phone className="w-4 h-4 mr-2" />}
            Send Enquiry
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open(`tel:${manufacturer.contactPhone}`)}
            data-testid="button-call-direct"
          >
            <Phone className="w-4 h-4" />
          </Button>
        </div>

        {manufacturer.contactWhatsapp && (
          <Button
            variant="outline"
            className="w-full mt-2 text-green-600 border-green-200 hover:bg-green-50"
            onClick={() =>
              window.open(
                `https://wa.me/${manufacturer.contactWhatsapp}?text=Hi, I found your factory on Sai Rolotech Near Me Finder. I'm interested in your products.`
              )
            }
            data-testid="button-whatsapp-manufacturer"
          >
            WhatsApp
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
}

function ManufacturerCard({
  manufacturer,
  distance,
  onContact,
  onViewProfile,
}: {
  manufacturer: Manufacturer;
  distance: number | null;
  onContact: () => void;
  onViewProfile: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <GlassCard className="p-4 mb-3" data-testid={`card-manufacturer-${manufacturer.id}`}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-bold truncate">{manufacturer.name}</h3>
              {manufacturer.name === "Sai Rolotech" && (
                <Badge className="text-[8px] bg-primary/10 text-primary border-primary/20 px-1.5 py-0 shrink-0">
                  <Star className="w-2 h-2 mr-0.5 fill-current" />
                  VERIFIED
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground mb-1">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="text-xs truncate">{manufacturer.city}, {manufacturer.state}</span>
            </div>
            {distance !== null && (
              <Badge variant="secondary" className="text-[10px] gap-1">
                <Navigation className="w-2.5 h-2.5" />
                {distance < 1 ? "< 1 km" : `${Math.round(distance)} km`}
              </Badge>
            )}
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Factory className="w-6 h-6 text-primary" />
          </div>
        </div>

        {manufacturer.products && manufacturer.products.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {manufacturer.products.slice(0, 4).map((p: string) => (
              <Badge key={p} variant="outline" className="text-[9px] px-1.5 py-0">
                {p}
              </Badge>
            ))}
            {manufacturer.products.length > 4 && (
              <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                +{manufacturer.products.length - 4}
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 text-xs"
            onClick={onContact}
            data-testid={`button-contact-${manufacturer.id}`}
          >
            <Phone className="w-3 h-3 mr-1" />
            Contact
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={onViewProfile}
            data-testid={`button-profile-${manufacturer.id}`}
          >
            View Details
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </GlassCard>
    </motion.div>
  );
}

export default function NearMePage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedDistance, setSelectedDistance] = useState(99999);
  const [selectedMachineTypes, setSelectedMachineTypes] = useState<string[]>([]);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "granted" | "denied">("idle");
  const [contactManufacturer, setContactManufacturer] = useState<Manufacturer | null>(null);

  const { data: manufacturers, isLoading } = useQuery<Manufacturer[]>({
    queryKey: ["/api/manufacturers"],
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        setLocationStatus("granted");
      },
      () => {
        setLocationStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const filteredManufacturers: ManufacturerWithDistance[] = useMemo(() => {
    if (!manufacturers) return [];

    let results = [...manufacturers];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.city.toLowerCase().includes(q) ||
          m.state.toLowerCase().includes(q) ||
          (m.products || []).some((p: string) => p.toLowerCase().includes(q)) ||
          (m.machineTypes || []).some((mt: string) => mt.toLowerCase().includes(q))
      );
    }

    if (selectedProducts.length > 0) {
      results = results.filter((m) =>
        selectedProducts.some((sp) =>
          (m.products || []).some((p: string) => p.toLowerCase().includes(sp.toLowerCase()))
        )
      );
    }

    if (selectedMaterials.length > 0) {
      results = results.filter((m) =>
        selectedMaterials.some((sm) =>
          (m.materials || []).some((mat: string) => mat.toLowerCase().includes(sm.toLowerCase()))
        )
      );
    }

    if (selectedMachineTypes.length > 0) {
      results = results.filter((m) =>
        selectedMachineTypes.some((smt) =>
          (m.machineTypes || []).some((mt: string) => mt.toLowerCase().includes(smt.toLowerCase()))
        )
      );
    }

    const withDistance = results.map((m) => {
      let dist: number | null = null;
      if (userLat !== null && userLng !== null && m.latitude && m.longitude) {
        dist = haversineDistance(userLat, userLng, Number(m.latitude), Number(m.longitude));
      }
      return { ...m, distance: dist };
    });

    const filtered = withDistance.filter((m) => {
      if (selectedDistance < 99999 && m.distance !== null) {
        return m.distance <= selectedDistance;
      }
      return true;
    });

    filtered.sort((a, b) => {
      if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
      if (a.distance !== null) return -1;
      if (b.distance !== null) return 1;
      return 0;
    });

    return filtered;
  }, [manufacturers, searchQuery, selectedProducts, selectedMaterials, selectedDistance, selectedMachineTypes, userLat, userLng]);

  const activeFilterCount =
    selectedProducts.length + selectedMaterials.length + selectedMachineTypes.length + (selectedDistance < 99999 ? 1 : 0);

  const toggleFilter = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter((a) => a !== val) : [...arr, val]);
  };

  const clearFilters = () => {
    setSelectedProducts([]);
    setSelectedMaterials([]);
    setSelectedDistance(99999);
    setSelectedMachineTypes([]);
  };

  return (
    <div className="min-h-screen pb-24" data-testid="page-near-me">
      <div
        className="sticky top-0 z-30 px-4 py-3 glass-header border-b border-white/10"
        style={{ background: "linear-gradient(-45deg, #0055CC, #0077FF, #00D4FF)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setLocation("/")}
            className="p-1.5 rounded-xl bg-white/20 text-white"
            data-testid="button-back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-white">Find Manufacturer Near Me</h1>
            <p className="text-[10px] text-white/70">Discover roll forming manufacturers nearby</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(e.target.value.length === 0);
            }}
            onFocus={() => setShowSuggestions(searchQuery.length === 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Search by product, city, machine..."
            className="pl-9 pr-10 h-10 rounded-xl bg-white/90 text-foreground border-0 shadow-lg"
            data-testid="input-search"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute left-4 right-4 top-full mt-1 z-40 glass-card rounded-xl shadow-xl overflow-hidden"
            >
              <div className="p-2">
                <p className="text-[10px] text-muted-foreground font-medium px-2 mb-1">Popular Searches</p>
                {POPULAR_SEARCHES.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSearchQuery(s.replace(" Near Me", "").replace(" Manufacturer", ""));
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-2 py-1.5 text-xs rounded-lg hover:bg-accent/50 flex items-center gap-2"
                    data-testid={`suggestion-${s.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Search className="w-3 h-3 text-muted-foreground shrink-0" />
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-4 mt-3">
        {locationStatus === "idle" || locationStatus === "loading" ? (
          <Card className="p-3 mb-3 flex items-center gap-3">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">Detecting your location...</span>
          </Card>
        ) : locationStatus === "denied" ? (
          <Card className="p-3 mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Location access denied</span>
            </div>
            <Button size="sm" variant="outline" className="text-xs h-7" onClick={requestLocation}>
              <Navigation className="w-3 h-3 mr-1" />
              Retry
            </Button>
          </Card>
        ) : (
          <Card className="p-3 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-muted-foreground">Location enabled — showing nearby results</span>
          </Card>
        )}

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              className="text-xs h-8"
              onClick={() => setShowFilters(!showFilters)}
              data-testid="button-toggle-filters"
            >
              <Filter className="w-3 h-3 mr-1" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-1 text-[9px] h-4 w-4 p-0 flex items-center justify-center rounded-full">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-[10px] text-primary underline"
                data-testid="button-clear-filters"
              >
                Clear All
              </button>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {filteredManufacturers.length} result{filteredManufacturers.length !== 1 ? "s" : ""}
          </span>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-3"
            >
              <GlassCard className="p-4 space-y-4" data-testid="filter-panel">
                <div>
                  <p className="text-xs font-semibold mb-2">Product Type</p>
                  <div className="flex flex-wrap gap-1.5">
                    {PRODUCT_FILTERS.map((p) => (
                      <button
                        key={p}
                        onClick={() => toggleFilter(selectedProducts, p, setSelectedProducts)}
                        className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                          selectedProducts.includes(p)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border hover:bg-accent/50"
                        }`}
                        data-testid={`filter-product-${p.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold mb-2">Material</p>
                  <div className="flex flex-wrap gap-1.5">
                    {MATERIAL_FILTERS.map((m) => (
                      <button
                        key={m}
                        onClick={() => toggleFilter(selectedMaterials, m, setSelectedMaterials)}
                        className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                          selectedMaterials.includes(m)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border hover:bg-accent/50"
                        }`}
                        data-testid={`filter-material-${m.toLowerCase()}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold mb-2">Distance</p>
                  <div className="flex flex-wrap gap-1.5">
                    {DISTANCE_FILTERS.map((d) => (
                      <button
                        key={d.value}
                        onClick={() => setSelectedDistance(d.value)}
                        className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                          selectedDistance === d.value
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border hover:bg-accent/50"
                        }`}
                        data-testid={`filter-distance-${d.value}`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold mb-2">Machine Type</p>
                  <div className="flex flex-wrap gap-1.5">
                    {MACHINE_TYPE_FILTERS.map((mt) => (
                      <button
                        key={mt}
                        onClick={() => toggleFilter(selectedMachineTypes, mt, setSelectedMachineTypes)}
                        className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                          selectedMachineTypes.includes(mt)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border hover:bg-accent/50"
                        }`}
                        data-testid={`filter-machine-${mt.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        {mt}
                      </button>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Loading manufacturers...</p>
          </div>
        ) : filteredManufacturers.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-3 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground/30" />
            <div>
              <p className="text-sm font-medium mb-1">No manufacturers found</p>
              <p className="text-xs text-muted-foreground">Try adjusting your search or filters</p>
            </div>
            {activeFilterCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div>
            {filteredManufacturers.map((m) => (
              <ManufacturerCard
                key={m.id}
                manufacturer={m}
                distance={m.distance}
                onContact={() => setContactManufacturer(m)}
                onViewProfile={() => setLocation(`/manufacturer/${m.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {contactManufacturer && (
          <ContactModal
            manufacturer={contactManufacturer}
            onClose={() => setContactManufacturer(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
