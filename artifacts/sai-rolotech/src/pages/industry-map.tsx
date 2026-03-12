import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, MapPin, Factory, Wrench, Users, X, MessageCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CityData {
  name: string;
  state: string;
  x: number;
  y: number;
  machines: number;
  suppliers: number;
  technicians: number;
}

const CITIES: CityData[] = [
  { name: "Delhi NCR", state: "Delhi", x: 248, y: 155, machines: 85, suppliers: 32, technicians: 28 },
  { name: "Ludhiana", state: "Punjab", x: 228, y: 120, machines: 62, suppliers: 18, technicians: 15 },
  { name: "Rajkot", state: "Gujarat", x: 148, y: 285, machines: 48, suppliers: 22, technicians: 12 },
  { name: "Ahmedabad", state: "Gujarat", x: 165, y: 265, machines: 56, suppliers: 28, technicians: 20 },
  { name: "Mumbai", state: "Maharashtra", x: 170, y: 340, machines: 72, suppliers: 35, technicians: 25 },
  { name: "Pune", state: "Maharashtra", x: 185, y: 355, machines: 44, suppliers: 20, technicians: 16 },
  { name: "Chennai", state: "Tamil Nadu", x: 240, y: 450, machines: 38, suppliers: 15, technicians: 14 },
  { name: "Kolkata", state: "West Bengal", x: 355, y: 275, machines: 35, suppliers: 12, technicians: 10 },
  { name: "Jaipur", state: "Rajasthan", x: 210, y: 195, machines: 28, suppliers: 10, technicians: 8 },
  { name: "Indore", state: "Madhya Pradesh", x: 210, y: 290, machines: 22, suppliers: 8, technicians: 7 },
  { name: "Hyderabad", state: "Telangana", x: 235, y: 380, machines: 30, suppliers: 14, technicians: 11 },
  { name: "Coimbatore", state: "Tamil Nadu", x: 220, y: 465, machines: 25, suppliers: 10, technicians: 9 },
];

function IndiaSVGMap({ selectedCity, onSelectCity }: { selectedCity: string | null; onSelectCity: (name: string) => void }) {
  return (
    <div className="relative w-full" style={{ aspectRatio: "460/530" }}>
      <svg viewBox="0 0 460 530" className="w-full h-full">
        <defs>
          <linearGradient id="mapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(0,119,255,0.08)" />
            <stop offset="100%" stopColor="rgba(0,212,255,0.05)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <path
          d="M230,50 L260,55 L290,45 L310,60 L340,55 L360,70 L380,80 L390,100 L395,130 L400,160 L390,190 L385,220 L390,250 L380,270 L370,285 L355,275 L345,290 L340,310 L330,330 L315,350 L300,370 L280,390 L260,410 L245,430 L235,450 L225,465 L215,475 L205,480 L195,475 L190,460 L185,440 L175,420 L165,400 L155,380 L150,360 L145,340 L135,320 L125,300 L120,280 L115,260 L120,240 L125,220 L120,200 L115,180 L120,160 L130,140 L140,120 L150,105 L165,95 L180,85 L195,75 L210,65 L230,50Z"
          fill="url(#mapGrad)"
          stroke="rgba(0,119,255,0.2)"
          strokeWidth="1.5"
          className="dark:opacity-80"
        />

        {CITIES.map((city) => {
          const isSelected = selectedCity === city.name;
          const total = city.machines + city.suppliers + city.technicians;
          const radius = Math.max(6, Math.min(12, total / 12));

          return (
            <g key={city.name} onClick={() => onSelectCity(city.name)} className="cursor-pointer">
              <circle
                cx={city.x}
                cy={city.y}
                r={radius + 6}
                fill="rgba(0,119,255,0.1)"
                className="animate-pulse"
              />
              <circle
                cx={city.x}
                cy={city.y}
                r={radius}
                fill={isSelected ? "#0077FF" : "rgba(0,119,255,0.7)"}
                stroke={isSelected ? "#00D4FF" : "rgba(255,255,255,0.5)"}
                strokeWidth={isSelected ? 2.5 : 1.5}
                filter={isSelected ? "url(#glow)" : undefined}
              />
              <text
                x={city.x}
                y={city.y - radius - 5}
                textAnchor="middle"
                className="fill-current text-foreground"
                fontSize="9"
                fontWeight="600"
              >
                {city.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function IndustryMap() {
  const [, setLocation] = useLocation();
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const selectedData = CITIES.find((c) => c.name === selectedCity);

  const totals = CITIES.reduce(
    (acc, c) => ({
      machines: acc.machines + c.machines,
      suppliers: acc.suppliers + c.suppliers,
      technicians: acc.technicians + c.technicians,
    }),
    { machines: 0, suppliers: 0, technicians: 0 }
  );

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => setLocation("/tools")} className="p-1" data-testid="button-back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-bold text-sm" data-testid="text-industry-map-title">Industry Network</h1>
          <p className="text-[10px] text-muted-foreground">Roll forming industry across India</p>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <Card className="p-2.5 text-center">
            <Factory className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold" data-testid="text-total-machines">{totals.machines}</p>
            <p className="text-[10px] text-muted-foreground">Machines</p>
          </Card>
          <Card className="p-2.5 text-center">
            <Users className="w-4 h-4 text-blue-500 mx-auto mb-1" />
            <p className="text-lg font-bold" data-testid="text-total-suppliers">{totals.suppliers}</p>
            <p className="text-[10px] text-muted-foreground">Suppliers</p>
          </Card>
          <Card className="p-2.5 text-center">
            <Wrench className="w-4 h-4 text-amber-500 mx-auto mb-1" />
            <p className="text-lg font-bold" data-testid="text-total-technicians">{totals.technicians}</p>
            <p className="text-[10px] text-muted-foreground">Technicians</p>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-2">
            <IndiaSVGMap
              selectedCity={selectedCity}
              onSelectCity={(name) => setSelectedCity(selectedCity === name ? null : name)}
            />
          </CardContent>
        </Card>

        <AnimatePresence>
          {selectedData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <Card className="border-primary/30 bg-primary/5" data-testid="card-city-detail">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <div>
                        <h3 className="font-bold text-sm" data-testid="text-city-name">{selectedData.name}</h3>
                        <p className="text-[10px] text-muted-foreground">{selectedData.state}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedCity(null)}
                      className="p-1 hover:bg-accent rounded-full"
                      data-testid="button-close-city"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-background rounded-lg p-2.5 text-center">
                      <Factory className="w-3.5 h-3.5 text-primary mx-auto mb-0.5" />
                      <p className="text-sm font-bold" data-testid="text-city-machines">{selectedData.machines}</p>
                      <p className="text-[9px] text-muted-foreground">Machines</p>
                    </div>
                    <div className="bg-background rounded-lg p-2.5 text-center">
                      <Users className="w-3.5 h-3.5 text-blue-500 mx-auto mb-0.5" />
                      <p className="text-sm font-bold" data-testid="text-city-suppliers">{selectedData.suppliers}</p>
                      <p className="text-[9px] text-muted-foreground">Suppliers</p>
                    </div>
                    <div className="bg-background rounded-lg p-2.5 text-center">
                      <Wrench className="w-3.5 h-3.5 text-amber-500 mx-auto mb-0.5" />
                      <p className="text-sm font-bold" data-testid="text-city-technicians">{selectedData.technicians}</p>
                      <p className="text-[9px] text-muted-foreground">Technicians</p>
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/919090486262?text=${encodeURIComponent(`Hi Sai Rolotech, I'm from ${selectedData.name} and want to connect with the local industry network.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-xs font-semibold text-white transition-all"
                    style={{ background: "linear-gradient(135deg, #0077FF, #00D4FF)" }}
                    data-testid="button-connect"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Connect with {selectedData.name} Network
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1">All Hubs</p>
          {[...CITIES].sort((a, b) => (b.machines + b.suppliers + b.technicians) - (a.machines + a.suppliers + a.technicians)).map((city) => (
            <Card
              key={city.name}
              className={`p-3 cursor-pointer transition-all ${selectedCity === city.name ? "border-primary/30 bg-primary/5" : "hover:bg-accent/30"}`}
              onClick={() => setSelectedCity(selectedCity === city.name ? null : city.name)}
              data-testid={`card-hub-${city.name.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{city.name}</p>
                    <p className="text-[10px] text-muted-foreground">{city.state}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[9px] px-1.5">
                    {city.machines + city.suppliers + city.technicians}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}