import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Manufacturer } from "@shared/schema";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useRoute } from "wouter";
import {
  ChevronLeft, MapPin, Phone, Mail, Factory, Star, Navigation,
  Loader2, Building2, Package, Wrench, Zap, X, Globe
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

function ContactSection({ manufacturer }: { manufacturer: Manufacturer }) {
  const [showForm, setShowForm] = useState(false);
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
      toast({ title: "Enquiry Sent!", description: `${manufacturer.name} will contact you soon.` });
      setShowForm(false);
      setName("");
      setPhone("");
      setLoc("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send enquiry.", variant: "destructive" });
    },
  });

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          className="flex-1"
          onClick={() => setShowForm(true)}
          data-testid="button-contact-manufacturer"
        >
          <Phone className="w-4 h-4 mr-2" />
          Contact Factory
        </Button>
        <Button
          variant="outline"
          onClick={() => window.open(`tel:${manufacturer.contactPhone}`)}
          data-testid="button-call-manufacturer"
        >
          <Phone className="w-4 h-4" />
        </Button>
      </div>

      {manufacturer.contactWhatsapp && (
        <Button
          variant="outline"
          className="w-full text-green-600 border-green-200 hover:bg-green-50"
          onClick={() =>
            window.open(
              `https://wa.me/${manufacturer.contactWhatsapp}?text=Hi, I found your factory on Sai Rolotech. I'm interested in your products.`
            )
          }
          data-testid="button-whatsapp"
        >
          WhatsApp
        </Button>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <GlassCard className="p-4 space-y-3" data-testid="contact-form">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Send Enquiry</h4>
                <button onClick={() => setShowForm(false)} className="p-1 hover:bg-accent rounded-full">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name *"
                data-testid="input-profile-name"
              />
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone Number *"
                type="tel"
                data-testid="input-profile-phone"
              />
              <Input
                value={location}
                onChange={(e) => setLoc(e.target.value)}
                placeholder="Your Location"
                data-testid="input-profile-location"
              />
              <Button
                className="w-full"
                disabled={!name.trim() || !phone.trim() || phone.length < 10 || leadMutation.isPending}
                onClick={() => leadMutation.mutate()}
                data-testid="button-submit-enquiry"
              >
                {leadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Send Enquiry
              </Button>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ManufacturerProfilePage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/manufacturer/:id");
  const id = params?.id;

  const { data: manufacturer, isLoading } = useQuery<Manufacturer>({
    queryKey: ["/api/manufacturers", id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!manufacturer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Building2 className="w-12 h-12 text-muted-foreground/30" />
        <p className="text-sm">Manufacturer not found</p>
        <Button variant="outline" size="sm" onClick={() => setLocation("/near-me")}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Search
        </Button>
      </div>
    );
  }

  const mapUrl = manufacturer.latitude && manufacturer.longitude
    ? `https://www.google.com/maps?q=${manufacturer.latitude},${manufacturer.longitude}`
    : null;

  return (
    <div className="min-h-screen pb-24" data-testid="page-manufacturer-profile">
      <div
        className="relative py-8 px-4"
        style={{
          background: "linear-gradient(-45deg, #0055CC, #0077FF, #00D4FF, #7B2FFF)",
          backgroundSize: "300% 300%",
          animation: "mesh-shift 12s ease infinite",
        }}
      >
        <button
          onClick={() => setLocation("/near-me")}
          className="absolute top-4 left-4 p-1.5 rounded-xl bg-white/20 text-white z-10"
          data-testid="button-back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center pt-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
            <Factory className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white mb-1">{manufacturer.name}</h1>
          <div className="flex items-center justify-center gap-1 text-white/80">
            <MapPin className="w-3 h-3" />
            <span className="text-xs">{manufacturer.city}, {manufacturer.state}</span>
          </div>
          {manufacturer.name === "Sai Rolotech" && (
            <Badge className="mt-2 bg-white/20 text-white border-white/30 text-[10px]">
              <Star className="w-2.5 h-2.5 mr-1 fill-current" />
              VERIFIED MANUFACTURER
            </Badge>
          )}
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        <ContactSection manufacturer={manufacturer} />

        {manufacturer.address && (
          <GlassCard className="p-4">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Location
            </h3>
            <p className="text-xs text-muted-foreground mb-3">{manufacturer.address}</p>
            {mapUrl && (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => window.open(mapUrl, "_blank")}
                data-testid="button-open-map"
              >
                <Globe className="w-3 h-3 mr-1" />
                Open in Google Maps
              </Button>
            )}
          </GlassCard>
        )}

        {manufacturer.products && manufacturer.products.length > 0 && (
          <GlassCard className="p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              Products
            </h3>
            <div className="flex flex-wrap gap-2">
              {manufacturer.products.map((p: string) => (
                <Badge key={p} variant="secondary" className="text-xs px-3 py-1">
                  {p}
                </Badge>
              ))}
            </div>
          </GlassCard>
        )}

        {manufacturer.machineTypes && manufacturer.machineTypes.length > 0 && (
          <GlassCard className="p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-primary" />
              Machine Types
            </h3>
            <div className="flex flex-wrap gap-2">
              {manufacturer.machineTypes.map((mt: string) => (
                <Badge key={mt} variant="outline" className="text-xs px-3 py-1">
                  {mt}
                </Badge>
              ))}
            </div>
          </GlassCard>
        )}

        {manufacturer.materials && manufacturer.materials.length > 0 && (
          <GlassCard className="p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Materials
            </h3>
            <div className="flex flex-wrap gap-2">
              {manufacturer.materials.map((m: string) => (
                <Badge key={m} variant="secondary" className="text-xs px-3 py-1">
                  {m}
                </Badge>
              ))}
            </div>
          </GlassCard>
        )}

        {manufacturer.productionCapacity && (
          <GlassCard className="p-4">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Factory className="w-4 h-4 text-primary" />
              Production Capacity
            </h3>
            <p className="text-sm font-medium">{manufacturer.productionCapacity}</p>
          </GlassCard>
        )}

        {manufacturer.description && (
          <GlassCard className="p-4">
            <h3 className="text-sm font-semibold mb-2">About</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{manufacturer.description}</p>
          </GlassCard>
        )}

        <GlassCard className="p-4">
          <h3 className="text-sm font-semibold mb-3">Contact Information</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-muted-foreground" />
              <a href={`tel:${manufacturer.contactPhone}`} className="text-xs text-primary">
                {manufacturer.contactPhone}
              </a>
            </div>
            {manufacturer.contactEmail && (
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                <a href={`mailto:${manufacturer.contactEmail}`} className="text-xs text-primary">
                  {manufacturer.contactEmail}
                </a>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
