import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Shield, Zap, Settings, AlertTriangle, CheckCircle2,
  ChevronRight, ChevronDown, BookOpen, Wrench, Eye, Timer,
  Factory, Layers, Box, Phone, CircleAlert, Gauge, ThermometerSun,
  Volume2, Droplets, RotateCcw, Power, Lock, HardHat, Lightbulb
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TrainingModule {
  id: string;
  title: string;
  titleHi: string;
  icon: any;
  color: string;
  steps: { title: string; titleHi: string; detail: string; detailHi: string; warning?: string; warningHi?: string }[];
}

interface MachineTraining {
  category: string;
  icon: any;
  gradient: string;
  desc: string;
  descHi: string;
  modules: TrainingModule[];
}

const SAFETY_MODULE: TrainingModule = {
  id: "safety",
  title: "Safety First",
  titleHi: "Pehle Suraksha",
  icon: Shield,
  color: "text-red-600 bg-red-500/10",
  steps: [
    {
      title: "Wear Safety Gear",
      titleHi: "Safety Gear Pehno",
      detail: "Always wear safety glasses, gloves, steel-toe shoes, and ear protection before operating any machine.",
      detailHi: "Machine chalane se pehle safety glasses, gloves, steel-toe shoes aur ear protection zaroor pehno.",
      warning: "Never operate machine without PPE",
      warningHi: "Bina PPE ke machine mat chalao"
    },
    {
      title: "Check Emergency Stop",
      titleHi: "Emergency Stop Check Karo",
      detail: "Before starting, verify the emergency stop button is working. Press and release to confirm.",
      detailHi: "Shuru karne se pehle emergency stop button check karo. Press karke release karo confirm karne ke liye.",
    },
    {
      title: "Clear Work Area",
      titleHi: "Kaam Ka Area Saaf Karo",
      detail: "Remove all tools, scraps, and obstacles from around the machine. Ensure 3 feet clear space on all sides.",
      detailHi: "Machine ke aas paas se saare tools, scraps aur rukaawat hatao. Har taraf 3 feet ka clear space rakhho.",
    },
    {
      title: "Check Electrical Connections",
      titleHi: "Electrical Connection Check Karo",
      detail: "Inspect all wiring, plugs and earthing before powering on. Report any exposed or damaged wires immediately.",
      detailHi: "Power on karne se pehle saari wiring, plug aur earthing check karo. Koi bhi kharab ya exposed wire dikhhe to turant report karo.",
      warning: "Wet hands se electrical parts mat chhuo",
      warningHi: "Geele haathon se electrical parts mat chhuo"
    },
    {
      title: "No Loose Clothing",
      titleHi: "Dheele Kapde Mat Pehno",
      detail: "Tuck in shirts, tie back long hair, remove jewelry. Loose items can get caught in rotating parts.",
      detailHi: "Shirt andar karo, lambe baal baandho, jewellery utaaro. Dheeli cheezein ghoomne wale parts mein phas sakti hain.",
    },
  ],
};

const MAINTENANCE_MODULE: TrainingModule = {
  id: "daily-maintenance",
  title: "Daily Maintenance",
  titleHi: "Rozana Maintenance",
  icon: Wrench,
  color: "text-amber-600 bg-amber-500/10",
  steps: [
    {
      title: "Lubricate Moving Parts",
      titleHi: "Chalne Wale Parts Mein Oil Lagao",
      detail: "Apply grease to bearings, shafts, and gear systems every shift start. Use recommended grade oil only.",
      detailHi: "Har shift shuru hone par bearings, shafts aur gear system mein grease lagao. Sirf recommended grade ka oil use karo.",
    },
    {
      title: "Check Oil Level",
      titleHi: "Oil Level Check Karo",
      detail: "Verify hydraulic oil level in the power pack. Top up if below minimum mark. Use ISO 68 grade hydraulic oil.",
      detailHi: "Power pack mein hydraulic oil level verify karo. Agar minimum mark se neeche hai to top up karo. ISO 68 grade hydraulic oil use karo.",
    },
    {
      title: "Clean Machine Surface",
      titleHi: "Machine Ki Surface Saaf Karo",
      detail: "Remove metal chips, dust, and debris from rollers, guides, and cutting area after each shift.",
      detailHi: "Har shift ke baad rollers, guides aur cutting area se metal chips, dhool aur kachra saaf karo.",
    },
    {
      title: "Check Belt/Chain Tension",
      titleHi: "Belt/Chain Ka Tension Check Karo",
      detail: "Inspect drive belts and chains for proper tension. Loose belts cause speed variation and slipping.",
      detailHi: "Drive belts aur chains ka tension check karo. Dheeli belt se speed variation aur slipping hoti hai.",
    },
    {
      title: "Inspect Cutting Blade",
      titleHi: "Cutting Blade Check Karo",
      detail: "Check blade sharpness and alignment. Dull blades cause burr and uneven cuts. Replace if worn.",
      detailHi: "Blade ki dhaar aur alignment check karo. Bunt blade se burr aur uneven cut aata hai. Ghis gayi ho to badalho.",
    },
  ],
};

const MACHINE_TRAININGS: MachineTraining[] = [
  {
    category: "Rolling Shutter Machine",
    icon: Layers,
    gradient: "from-indigo-600 to-blue-700",
    desc: "Shutter Patti Roll Forming",
    descHi: "Shutter Patti banane ki machine",
    modules: [
      SAFETY_MODULE,
      {
        id: "startup",
        title: "Machine Start-Up",
        titleHi: "Machine Chalana Shuru Karo",
        icon: Power,
        color: "text-green-600 bg-green-500/10",
        steps: [
          {
            title: "Power On Main Switch",
            titleHi: "Main Switch ON Karo",
            detail: "Turn on the main electrical panel switch. Wait 5 seconds for PLC to initialize. Check indicator lights.",
            detailHi: "Main electrical panel ka switch on karo. PLC initialize hone ke liye 5 second ruko. Indicator lights check karo.",
          },
          {
            title: "Load Coil on Decoiler",
            titleHi: "Decoiler Par Coil Load Karo",
            detail: "Place coil on decoiler mandrel. Secure with cone/clamp. Feed strip through entry guide. Ensure strip is straight.",
            detailHi: "Coil ko decoiler mandrel par rakho. Cone/clamp se secure karo. Strip ko entry guide se daalo. Strip seedhi honi chahiye.",
            warning: "Coil loading time crane ka use karo, haath se mat uthao",
            warningHi: "Coil load karte samay crane ka use karo, haath se mat uthao"
          },
          {
            title: "Set Strip Width & Gauge",
            titleHi: "Strip Width & Gauge Set Karo",
            detail: "Adjust side guides for correct strip width (standard: 305mm for 5\" patti). Verify strip thickness matches machine setting.",
            detailHi: "Sahi strip width ke liye side guides adjust karo (standard: 305mm for 5\" patti). Strip thickness machine setting se match honi chahiye.",
          },
          {
            title: "Jog Test Run",
            titleHi: "Jog Test Chalao",
            detail: "Run machine in jog mode for first 2 meters. Check strip path through all stations. Verify no jamming or misalignment.",
            detailHi: "Pehle 2 meter machine jog mode mein chalao. Saare stations se strip ka raasta check karo. Koi jamming ya misalignment na ho.",
          },
          {
            title: "Check Profile Shape",
            titleHi: "Profile Shape Check Karo",
            detail: "Inspect first output piece — check curves, dimensions, and slant with gauge. Compare with sample piece.",
            detailHi: "Pehle output piece ko check karo — curves, dimensions aur slant gauge se napo. Sample piece se compare karo.",
          },
        ],
      },
      {
        id: "operation",
        title: "During Operation",
        titleHi: "Chalate Samay Dhyan Rakho",
        icon: Eye,
        color: "text-blue-600 bg-blue-500/10",
        steps: [
          {
            title: "Monitor Strip Feed",
            titleHi: "Strip Feed Par Nazar Rakho",
            detail: "Watch for strip edge alignment. If strip drifts left/right, stop and re-align at entry guide.",
            detailHi: "Strip edge alignment par nazar rakho. Agar strip left/right idhar udhar ho to roko aur entry guide par dobara set karo.",
          },
          {
            title: "Listen for Abnormal Sound",
            titleHi: "Ajeeb Awaaz Suno",
            detail: "Normal machine sound is steady hum. Grinding, clicking, or knocking sounds indicate problems. Stop immediately.",
            detailHi: "Normal machine ki awaaz ek steady hum hoti hai. Grinding, clicking ya knocking ki awaaz problem ki nishani hai. Turant roko.",
            warning: "Abnormal sound pe machine turant band karo",
            warningHi: "Ajeeb awaaz aaye to machine turant band karo"
          },
          {
            title: "Check Output Length",
            titleHi: "Output Length Check Karo",
            detail: "Every 10th piece, measure length with tape. Should be within ±2mm of set length. Adjust counter if drifting.",
            detailHi: "Har 10th piece ki tape se length napo. Set length se ±2mm ke andar honi chahiye. Drift ho to counter adjust karo.",
          },
          {
            title: "Stack Output Properly",
            titleHi: "Output Sahi Se Stack Karo",
            detail: "Stack finished patti in bundles of 20-25. Use wooden spacers between layers. Don't let pieces fall on ground.",
            detailHi: "Bani hui patti ko 20-25 ke bundle mein stack karo. Layers ke beech wooden spacers rakho. Pieces ko zameen par mat girne do.",
          },
        ],
      },
      {
        id: "shutdown",
        title: "Shutdown Procedure",
        titleHi: "Machine Band Karna",
        icon: Lock,
        color: "text-slate-600 bg-slate-500/10",
        steps: [
          {
            title: "Run Out Remaining Strip",
            titleHi: "Bachi Hui Strip Nikalo",
            detail: "Let the remaining strip pass through completely. Don't stop with strip loaded in rollers.",
            detailHi: "Bachi hui strip ko poori tarah se nikal jaane do. Rollers mein strip loaded rakhke mat roko.",
          },
          {
            title: "Switch Off Motor",
            titleHi: "Motor Band Karo",
            detail: "Press stop button. Wait for all rollers to stop completely. Then turn off main switch.",
            detailHi: "Stop button dabao. Saare rollers ke poori tarah rukne ka intezaar karo. Phir main switch band karo.",
          },
          {
            title: "Clean & Cover Machine",
            titleHi: "Machine Saaf Karke Cover Lagao",
            detail: "Clean all metal chips from machine surface. Apply light oil on roller surfaces to prevent rust. Cover machine.",
            detailHi: "Machine ki surface se saare metal chips saaf karo. Rust se bachane ke liye roller surfaces par halka oil lagao. Machine cover karo.",
          },
        ],
      },
      MAINTENANCE_MODULE,
      {
        id: "troubleshoot",
        title: "Troubleshooting",
        titleHi: "Problem Solve Karna",
        icon: AlertTriangle,
        color: "text-orange-600 bg-orange-500/10",
        steps: [
          {
            title: "Strip Jamming in Rollers",
            titleHi: "Strip Rollers Mein Phas Gayi",
            detail: "STOP machine. Reverse slowly to free strip. Check for bent edges or oversized width. Re-align entry guide.",
            detailHi: "Machine BAND karo. Dheere se reverse karke strip nikalo. Mude hue edges ya zyada width check karo. Entry guide dobara align karo.",
          },
          {
            title: "Uneven Profile / Twist",
            titleHi: "Profile Tedi / Uneven Aa Rahi Hai",
            detail: "Check roller alignment and gap settings. Verify strip is feeding straight. May need roller re-setting by technician.",
            detailHi: "Roller alignment aur gap settings check karo. Strip seedhi feed ho rahi hai ya nahi verify karo. Technician se roller re-setting karwani pad sakti hai.",
          },
          {
            title: "Cutting Not Clean",
            titleHi: "Cutting Saaf Nahi Aa Rahi",
            detail: "Check blade sharpness. Inspect hydraulic pressure (should be 80-100 bar). Check die alignment. Replace blade if worn.",
            detailHi: "Blade ki dhaar check karo. Hydraulic pressure check karo (80-100 bar hona chahiye). Die alignment check karo. Ghisi hui blade badalho.",
          },
          {
            title: "Excessive Vibration",
            titleHi: "Zyada Vibration Aa Rahi Hai",
            detail: "Check foundation bolts tightness. Inspect bearing condition. Verify gearbox oil level. May indicate worn bearing.",
            detailHi: "Foundation bolts ka tightness check karo. Bearing condition inspect karo. Gearbox oil level verify karo. Ghisi hui bearing ka sign ho sakta hai.",
          },
          {
            title: "Motor Overheating",
            titleHi: "Motor Zyada Garam Ho Raha Hai",
            detail: "Check for overload (too thick material). Verify ventilation fan is working. Check electrical connections. Reduce speed if needed.",
            detailHi: "Overload check karo (zyada mota material). Ventilation fan kaam kar raha hai verify karo. Electrical connections check karo. Zarurat ho to speed kam karo.",
          },
        ],
      },
    ],
  },
  {
    category: "False Ceiling Machine",
    icon: Factory,
    gradient: "from-emerald-600 to-teal-700",
    desc: "POP & Gypsum Channel Forming",
    descHi: "POP aur Gypsum Channel banane ki machine",
    modules: [
      SAFETY_MODULE,
      {
        id: "startup-ceiling",
        title: "Machine Start-Up",
        titleHi: "Machine Chalana Shuru Karo",
        icon: Power,
        color: "text-green-600 bg-green-500/10",
        steps: [
          {
            title: "Select Profile on PLC",
            titleHi: "PLC Par Profile Select Karo",
            detail: "For 2-in-1 or 4-in-1 machines, select the required profile (Ceiling/Perimeter/Intermediate/Angle) on PLC panel.",
            detailHi: "2-in-1 ya 4-in-1 machine ke liye, PLC panel par required profile (Ceiling/Perimeter/Intermediate/Angle) select karo.",
          },
          {
            title: "Load Coil (Thin Gauge)",
            titleHi: "Coil Load Karo (Patla Gauge)",
            detail: "Ceiling channel uses 0.35-0.55mm strip. Handle thin strip carefully — it bends easily. Feed slowly through entry.",
            detailHi: "Ceiling channel mein 0.35-0.55mm strip use hoti hai. Patli strip dheere se handle karo — jaldi mud jaati hai. Entry mein dheere se daalo.",
          },
          {
            title: "Verify Profile Dimensions",
            titleHi: "Profile Dimensions Verify Karo",
            detail: "Run first piece and measure — Ceiling: 22x45mm, Perimeter: 28x30mm. Match to IS standard specifications.",
            detailHi: "Pehla piece chalao aur napo — Ceiling: 22x45mm, Perimeter: 28x30mm. IS standard specifications se match karo.",
          },
          {
            title: "Set Cut Length",
            titleHi: "Cut Length Set Karo",
            detail: "Standard lengths: 8ft, 10ft, 12ft. Enter on PLC or counter. Verify first 3 cuts are accurate.",
            detailHi: "Standard lengths: 8ft, 10ft, 12ft. PLC ya counter par enter karo. Pehle 3 cuts accurate hain verify karo.",
          },
        ],
      },
      {
        id: "profiles",
        title: "Profile Guide",
        titleHi: "Profile Jaankari",
        icon: Lightbulb,
        color: "text-purple-600 bg-purple-500/10",
        steps: [
          {
            title: "Ceiling Channel",
            titleHi: "Ceiling Channel",
            detail: "Main frame channel fixed to ceiling. Carries the full load of ceiling system. Must be straight and strong. Standard section: 22x45mm.",
            detailHi: "Ceiling par fix hone wala main frame channel. Poori ceiling system ka weight uthata hai. Seedha aur mazboot hona chahiye. Standard section: 22x45mm.",
          },
          {
            title: "Perimeter Channel",
            titleHi: "Perimeter Channel",
            detail: "Wall-mounted edge channel — forms the border of ceiling. L-shaped profile. Standard section: 28x30mm.",
            detailHi: "Wall par lagta hai — ceiling ki border banata hai. L-shape profile hota hai. Standard section: 28x30mm.",
          },
          {
            title: "Intermediate Channel",
            titleHi: "Intermediate Channel",
            detail: "Connects between ceiling channels for extra support. Used in large span ceilings. Standard section: 16x50mm.",
            detailHi: "Ceiling channels ke beech extra support ke liye lagta hai. Bade area ki ceilings mein use hota hai. Standard section: 16x50mm.",
          },
          {
            title: "Angle Channel",
            titleHi: "Angle Channel",
            detail: "L-shaped corner profile for edge finishing. Provides clean border where ceiling meets wall. Standard: 25x25mm.",
            detailHi: "Corner finishing ke liye L-shape profile. Jahan ceiling aur wall milti hai wahan clean border deta hai. Standard: 25x25mm.",
          },
        ],
      },
      MAINTENANCE_MODULE,
      {
        id: "troubleshoot-ceiling",
        title: "Troubleshooting",
        titleHi: "Problem Solve Karna",
        icon: AlertTriangle,
        color: "text-orange-600 bg-orange-500/10",
        steps: [
          {
            title: "Profile Twisting",
            titleHi: "Profile Tedi Aa Rahi Hai",
            detail: "Common in thin gauge. Check roller gap — too tight causes twist. Verify strip is centered. Reduce speed.",
            detailHi: "Patli gauge mein common hai. Roller gap check karo — zyada tight hone se twist aata hai. Strip centered hai verify karo. Speed kam karo.",
          },
          {
            title: "Punch Holes Misaligned",
            titleHi: "Punch Holes Galat Jagah Aa Rahe Hain",
            detail: "Check punch die alignment. Verify encoder/sensor position. Recalibrate distance between punches.",
            detailHi: "Punch die alignment check karo. Encoder/sensor ki position verify karo. Punches ke beech ki distance recalibrate karo.",
          },
          {
            title: "Strip Breaking During Forming",
            titleHi: "Forming Ke Dauran Strip Toot Rahi Hai",
            detail: "Material may be too hard/brittle. Check material grade. Reduce forming speed. Verify roller gaps aren't too tight.",
            detailHi: "Material zyada sakht ya brittle ho sakta hai. Material grade check karo. Forming speed kam karo. Roller gaps zyada tight nahi hain verify karo.",
          },
        ],
      },
    ],
  },
  {
    category: "Roofing Sheet Machine",
    icon: Box,
    gradient: "from-slate-700 to-zinc-800",
    desc: "Trapezoidal & Corrugated Sheet",
    descHi: "Trapezoidal aur Corrugated Sheet ki machine",
    modules: [
      SAFETY_MODULE,
      {
        id: "startup-roof",
        title: "Machine Start-Up",
        titleHi: "Machine Chalana Shuru Karo",
        icon: Power,
        color: "text-green-600 bg-green-500/10",
        steps: [
          {
            title: "Check Decoiler Capacity",
            titleHi: "Decoiler Capacity Check Karo",
            detail: "Roofing machines use heavy coils (3-5 Ton). Ensure decoiler is rated for the coil weight. Use crane for loading.",
            detailHi: "Roofing machines mein bhari coils (3-5 Ton) use hoti hain. Decoiler ki coil weight ke liye rating check karo. Loading ke liye crane use karo.",
            warning: "Heavy coil loading mein hamesha crane use karo",
            warningHi: "Bhari coil loading mein hamesha crane use karo"
          },
          {
            title: "Set Sheet Length on Counter",
            titleHi: "Counter Par Sheet Length Set Karo",
            detail: "Enter required sheet length (standard 8ft-20ft). Set sheet quantity. Counter will auto-cut at set length.",
            detailHi: "Required sheet length enter karo (standard 8ft-20ft). Sheet quantity set karo. Counter set length par auto-cut karega.",
          },
          {
            title: "Verify Sheet Profile",
            titleHi: "Sheet Profile Verify Karo",
            detail: "First sheet — check rib height, pitch distance, and overall width. Must match buyer specification.",
            detailHi: "Pehli sheet — rib height, pitch distance aur overall width check karo. Buyer specification se match honi chahiye.",
          },
        ],
      },
      MAINTENANCE_MODULE,
    ],
  },
  {
    category: "Door Frame Machine",
    icon: Box,
    gradient: "from-amber-600 to-orange-700",
    desc: "Steel Door Chaukhat Forming",
    descHi: "Steel Door Chaukhat banane ki machine",
    modules: [
      SAFETY_MODULE,
      {
        id: "startup-door",
        title: "Machine Start-Up",
        titleHi: "Machine Chalana Shuru Karo",
        icon: Power,
        color: "text-green-600 bg-green-500/10",
        steps: [
          {
            title: "Select Chaukhat Size",
            titleHi: "Chaukhat Size Select Karo",
            detail: "Standard sizes: 2.5\"x1.5\", 3\"x1.5\", 4\"x2\". Set guide adjusters for selected size before loading strip.",
            detailHi: "Standard sizes: 2.5\"x1.5\", 3\"x1.5\", 4\"x2\". Strip load karne se pehle selected size ke liye guide adjusters set karo.",
          },
          {
            title: "Use Correct Gauge Strip",
            titleHi: "Sahi Gauge Ki Strip Use Karo",
            detail: "Door frames need 0.60-1.20mm material. Thicker = stronger frame. Don't use thin ceiling strip in door frame machine.",
            detailHi: "Door frames mein 0.60-1.20mm material chahiye. Mota = mazboot frame. Door frame machine mein patli ceiling strip mat use karo.",
            warning: "Galat gauge se machine aur product dono kharab honge",
            warningHi: "Galat gauge se machine aur product dono kharab honge"
          },
          {
            title: "Check Notching/Punching",
            titleHi: "Notching/Punching Check Karo",
            detail: "Verify hinge cutout and lock hole positions. These must match standard door hardware mounting points.",
            detailHi: "Hinge cutout aur lock hole ki positions verify karo. Ye standard door hardware mounting points se match hone chahiye.",
          },
        ],
      },
      MAINTENANCE_MODULE,
    ],
  },
];

function ModuleCard({ module, isExpanded, onToggle }: {
  module: TrainingModule; isExpanded: boolean; onToggle: () => void;
}) {
  const Icon = module.icon;
  return (
    <Card className="mb-2" data-testid={`module-${module.id}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 text-left"
        data-testid={`button-toggle-${module.id}`}
      >
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${module.color}`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-bold">{module.title}</h3>
          <p className="text-[10px] text-muted-foreground">{module.titleHi}</p>
        </div>
        <Badge variant="secondary" className="text-[8px] shrink-0">{module.steps.length} steps</Badge>
        <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2.5">
              {module.steps.map((step, i) => (
                <div key={i} className="flex gap-2.5" data-testid={`step-${module.id}-${i}`}>
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                      {i + 1}
                    </div>
                    {i < module.steps.length - 1 && (
                      <div className="w-px flex-1 bg-border mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-3">
                    <p className="text-[11px] font-semibold mb-0.5">{step.title}</p>
                    <p className="text-[10px] text-primary/80 font-medium mb-1">{step.titleHi}</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed mb-1">{step.detail}</p>
                    <p className="text-[10px] text-muted-foreground/70 leading-relaxed italic">{step.detailHi}</p>
                    {step.warning && (
                      <div className="mt-1.5 flex items-start gap-1.5 bg-red-500/5 border border-red-500/20 rounded-md p-2">
                        <AlertTriangle className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[9px] font-bold text-red-600">{step.warning}</p>
                          <p className="text-[9px] text-red-500/80">{step.warningHi}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function MachineTrainingDetail({ training, onBack }: { training: MachineTraining; onBack: () => void }) {
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const Icon = training.icon;

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-4 py-3 flex items-center gap-3">
        <Button size="icon" variant="ghost" onClick={onBack} data-testid="button-back-training">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold truncate">{training.category}</h2>
          <p className="text-[10px] text-muted-foreground">{training.descHi}</p>
        </div>
      </div>

      <div className={`mx-4 mt-4 mb-4 rounded-xl bg-gradient-to-br ${training.gradient} p-4`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">{training.category}</h2>
            <p className="text-[10px] text-white/70">{training.desc}</p>
            <p className="text-[10px] text-white/60">{training.descHi}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Badge className="bg-white/20 text-white border-none text-[9px]">
            {training.modules.length} Modules
          </Badge>
          <Badge className="bg-white/20 text-white border-none text-[9px]">
            {training.modules.reduce((sum, m) => sum + m.steps.length, 0)} Steps
          </Badge>
        </div>
      </div>

      <div className="px-4 mb-3">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-start gap-2">
          <HardHat className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-bold text-amber-700">Safety Pehle!</p>
            <p className="text-[9px] text-amber-600/80">Har module se pehle Safety module zaroor padho. Bina PPE ke machine mat chalao.</p>
          </div>
        </div>
      </div>

      <div className="px-4">
        {training.modules.map(module => (
          <ModuleCard
            key={module.id}
            module={module}
            isExpanded={expandedModule === module.id}
            onToggle={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
          />
        ))}
      </div>

      <div className="px-4 mt-4">
        <Card className="p-3 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="w-4 h-4 text-primary" />
            <p className="text-xs font-bold">Help Chahiye?</p>
          </div>
          <p className="text-[10px] text-muted-foreground mb-2">
            Koi bhi problem ya sawal ho to Sai Rolotech ke technical team se baat karo.
          </p>
          <div className="flex gap-2">
            <Button size="sm" className="text-[10px] h-7 flex-1" asChild data-testid="button-call-support">
              <a href="tel:+919090486262">
                <Phone className="w-3 h-3 mr-1" />
                Call: 9090-486-262
              </a>
            </Button>
            <Button size="sm" variant="outline" className="text-[10px] h-7" asChild data-testid="button-whatsapp-support">
              <a href="https://wa.me/919090486262?text=Machine%20training%20help%20chahiye" target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function OperatorTraining() {
  const [selectedTraining, setSelectedTraining] = useState<MachineTraining | null>(null);

  if (selectedTraining) {
    return <MachineTrainingDetail training={selectedTraining} onBack={() => setSelectedTraining(null)} />;
  }

  return (
    <div className="pb-24">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold mb-0.5" data-testid="text-training-title">Operator Training Guide</h1>
        <p className="text-xs text-muted-foreground">Machine chalana seekho — step by step Hindi + English mein</p>
      </div>

      <div className="px-4 mb-4">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Training Modules</h2>
              <p className="text-[10px] text-white/70">Har machine ke liye complete guide</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-white">{MACHINE_TRAININGS.length}</p>
              <p className="text-[8px] text-white/60">Machines</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-white">{MACHINE_TRAININGS.reduce((s, t) => s + t.modules.length, 0)}</p>
              <p className="text-[8px] text-white/60">Modules</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-white">{MACHINE_TRAININGS.reduce((s, t) => s + t.modules.reduce((ss, m) => ss + m.steps.length, 0), 0)}</p>
              <p className="text-[8px] text-white/60">Steps</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 mb-3">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-start gap-2">
          <CircleAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-bold text-amber-700">Important / Zaroori</p>
            <p className="text-[9px] text-amber-600/80">Ye training guide sirf basic training ke liye hai. Pehli baar machine chalane se pehle factory training zaroor lo.</p>
          </div>
        </div>
      </div>

      <div className="px-4 mb-3">
        <h2 className="text-sm font-bold mb-2">Machine Select Karo</h2>
      </div>

      <div className="px-4 space-y-2.5">
        {MACHINE_TRAININGS.map(training => {
          const Icon = training.icon;
          const totalSteps = training.modules.reduce((s, m) => s + m.steps.length, 0);
          return (
            <Card
              key={training.category}
              className="cursor-pointer hover-elevate"
              onClick={() => setSelectedTraining(training)}
              data-testid={`card-training-${training.category.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className="flex items-center gap-3 p-3">
                <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${training.gradient} flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold mb-0.5">{training.category}</h3>
                  <p className="text-[10px] text-muted-foreground">{training.descHi}</p>
                  <div className="flex gap-1.5 mt-1">
                    <Badge variant="secondary" className="text-[8px]">{training.modules.length} modules</Badge>
                    <Badge variant="outline" className="text-[8px]">{totalSteps} steps</Badge>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
            </Card>
          );
        })}
      </div>

      <div className="px-4 mt-6">
        <h2 className="text-sm font-bold mb-2">Quick Safety Tips</h2>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: HardHat, label: "PPE Pehno", labelHi: "Helmet, Gloves, Shoes", color: "text-red-600 bg-red-500/10" },
            { icon: Volume2, label: "Awaaz Suno", labelHi: "Abnormal sound = Stop", color: "text-amber-600 bg-amber-500/10" },
            { icon: Droplets, label: "Oil Check", labelHi: "Rozana oil level dekho", color: "text-blue-600 bg-blue-500/10" },
            { icon: ThermometerSun, label: "Temperature", labelHi: "Motor garam = Rest do", color: "text-orange-600 bg-orange-500/10" },
            { icon: Gauge, label: "Pressure", labelHi: "Hydraulic 80-100 bar", color: "text-green-600 bg-green-500/10" },
            { icon: RotateCcw, label: "Vibration", labelHi: "Zyada vibration = Check", color: "text-purple-600 bg-purple-500/10" },
          ].map(tip => (
            <div key={tip.label} className="flex items-center gap-2 p-2.5 rounded-lg bg-card border">
              <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${tip.color}`}>
                <tip.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold">{tip.label}</p>
                <p className="text-[8px] text-muted-foreground">{tip.labelHi}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}