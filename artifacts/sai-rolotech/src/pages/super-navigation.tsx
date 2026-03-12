import { useState } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, MapPin, Navigation, ExternalLink, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FACTORY_COORDS = "28.6814,77.0266";

const GOOGLE_MAPS_NAV_URL = `https://www.google.com/maps/dir/?api=1&origin=Mundka+Metro+Station,+Delhi&destination=${FACTORY_COORDS}&travelmode=driving`;

interface Waypoint {
  step: number;
  lat: number;
  lng: number;
  heading: number;
  instructionHi: string;
  instructionEn: string;
}

const WAYPOINTS: Waypoint[] = [
  {
    step: 1,
    lat: 28.6832,
    lng: 77.0312,
    heading: 220,
    instructionHi: "मुंडका मेट्रो स्टेशन से बाहर निकलें (गेट नंबर 1)। मुख्य सड़क की तरफ चलें।",
    instructionEn: "Exit Mundka Metro Station (Gate 1). Walk towards the main road (Rohtak Road / NH-10).",
  },
  {
    step: 2,
    lat: 28.6828,
    lng: 77.0305,
    heading: 200,
    instructionHi: "रोहतक रोड (NH-10) पर आएं। बाईं तरफ मुड़ें और उद्योग नगर की तरफ चलें।",
    instructionEn: "Reach Rohtak Road (NH-10). Turn left and walk towards Udyog Nagar industrial area.",
  },
  {
    step: 3,
    lat: 28.6825,
    lng: 77.0295,
    heading: 250,
    instructionHi: "उद्योग नगर इंडस्ट्रियल एरिया के गेट तक पहुंचें। अंदर जाएं।",
    instructionEn: "Reach the Udyog Nagar Industrial Area gate. Enter the industrial complex.",
  },
  {
    step: 4,
    lat: 28.6822,
    lng: 77.0283,
    heading: 230,
    instructionHi: "इंडस्ट्रियल एरिया के अंदर सीधे चलते रहें। साउथ साइड इंडस्ट्रियल एरिया की तरफ जाएं।",
    instructionEn: "Continue straight inside the industrial area. Head towards South Side Industrial Area.",
  },
  {
    step: 5,
    lat: 28.6818,
    lng: 77.0275,
    heading: 210,
    instructionHi: "साउथ साइड इंडस्ट्रियल एरिया में दाईं तरफ मुड़ें।",
    instructionEn: "Turn right into South Side Industrial Area.",
  },
  {
    step: 6,
    lat: 28.6816,
    lng: 77.0270,
    heading: 190,
    instructionHi: "सीधे चलें। Mdk052 ब्लॉक की तरफ जाएं। साइन बोर्ड देखें।",
    instructionEn: "Walk straight. Head towards Mdk052 block. Look for signboards.",
  },
  {
    step: 7,
    lat: 28.6814,
    lng: 77.0266,
    heading: 180,
    instructionHi: "🎉 आप पहुंच गए! साई रोलोटेक फैक्ट्री — ग्राउंड फ्लोर, Mdk052, खसरा नंबर 575/1, उद्योग नगर, मुंडका।",
    instructionEn: "🎉 You have arrived! Sai Rolotech Factory — Ground Floor, Mdk052, Kh.no.575/1, Udyog Nagar, Mundka.",
  },
];

function StreetViewEmbed({ lat, lng, heading }: { lat: number; lng: number; heading: number }) {
  const mapSrc = `https://maps.google.com/maps?q=${lat},${lng}&z=18&output=embed`;

  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden bg-muted relative">
      <iframe
        src={mapSrc}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Map view at ${lat}, ${lng}`}
      />
    </div>
  );
}

function RouteOverviewMap() {
  const mapSrc = `https://maps.google.com/maps?saddr=Mundka+Metro+Station,+Delhi&daddr=28.6814,77.0266&output=embed`;

  return (
    <div className="w-full aspect-[16/10] rounded-xl overflow-hidden bg-muted">
      <iframe
        src={mapSrc}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Route from Mundka Metro to Sai Rolotech Factory"
      />
    </div>
  );
}

export default function SuperNavigation() {
  const [currentStep, setCurrentStep] = useState(0);
  const waypoint = WAYPOINTS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === WAYPOINTS.length - 1;

  return (
    <div className="pb-24 px-4">
      <div className="pt-4 pb-3">
        <Link href="/contact" className="inline-flex items-center gap-1 text-sm text-primary mb-3" data-testid="link-back-contact">
          <ChevronLeft className="w-4 h-4" />
          Back to Contact
        </Link>
        <h1 className="text-xl font-bold mb-1 flex items-center gap-2" data-testid="text-navigation-title">
          <Navigation className="w-5 h-5 text-primary" />
          Super Navigation
        </h1>
        <p className="text-sm text-muted-foreground">
          Mundka Metro Station → Sai Rolotech Factory
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          मुंडका मेट्रो स्टेशन → साई रोलोटेक फैक्ट्री
        </p>
      </div>

      <Card className="p-3 mb-4" data-testid="card-route-overview">
        <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          Route Overview / रूट ओवरव्यू
        </h2>
        <RouteOverviewMap />
      </Card>

      <a
        href={GOOGLE_MAPS_NAV_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block mb-4"
        data-testid="link-open-google-maps"
      >
        <Button className="w-full gap-2" size="lg">
          <ExternalLink className="w-4 h-4" />
          Open in Google Maps / गूगल मैप में खोलें
        </Button>
      </a>

      <Card className="p-4 mb-4" data-testid="card-step-navigation">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground">
            Step {waypoint.step} of {WAYPOINTS.length}
          </span>
          <div className="flex gap-1">
            {WAYPOINTS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentStep
                    ? "bg-primary w-4"
                    : i < currentStep
                      ? "bg-primary/40"
                      : "bg-muted-foreground/20"
                }`}
                data-testid={`dot-step-${i}`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <StreetViewEmbed
              lat={waypoint.lat}
              lng={waypoint.lng}
              heading={waypoint.heading}
            />

            <div className="mt-3 space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {waypoint.step}
                </div>
                <div>
                  <p className="text-sm font-medium leading-snug" data-testid={`text-instruction-en-${currentStep}`}>
                    {waypoint.instructionEn}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 leading-snug" data-testid={`text-instruction-hi-${currentStep}`}>
                    {waypoint.instructionHi}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-4 gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentStep((s) => s - 1)}
            disabled={isFirst}
            className="gap-1"
            data-testid="button-prev-step"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>
          <Button
            size="sm"
            onClick={() => setCurrentStep((s) => s + 1)}
            disabled={isLast}
            className="gap-1"
            data-testid="button-next-step"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {isLast && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4 text-center border-primary/30 bg-primary/5" data-testid="card-arrival">
            <p className="text-lg font-bold mb-1">🎉 Welcome!</p>
            <p className="text-sm text-muted-foreground mb-1">
              Sai Rolotech Factory
            </p>
            <p className="text-xs text-muted-foreground">
              Ground Floor Mdk052, Kh.no.575/1, Udyog Nagar, South Side Industrial Area, Mundka, New Delhi - 110041
            </p>
            <a href="tel:+919090486262" className="inline-block mt-3">
              <Button variant="outline" size="sm" className="gap-1" data-testid="button-call-arrival">
                📞 Call: +91 9090-486-262
              </Button>
            </a>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
