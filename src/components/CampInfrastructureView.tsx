import React, { useState, useEffect } from "react";
import {
  Droplets,
  Sun,
  Activity,
  Users,
  Flame,
  ShieldAlert,
  Trash2,
  Settings,
  Layers,
  Compass,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Info,
  Check,
  MapPin,
  Sparkles,
  Sliders,
  ChevronRight,
  ShieldCheck,
  Maximize2
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from "recharts";

interface CampInfrastructureViewProps {
  totalUnits: number;
  peopleCount: number;
  lang: "ar" | "en";
  project: any;
}

export const CampInfrastructureView: React.FC<CampInfrastructureViewProps> = ({
  totalUnits = 12,
  peopleCount = 60,
  lang = "ar",
  project
}) => {
  const isAr = lang === "ar";
  const pop = peopleCount || 100;
  const units = totalUnits || 12;

  // Active Sub-tab inside Infrastructure
  const [activeSubTab, setActiveSubTab] = useState<"water" | "sanitation" | "electricity" | "fire" | "humanitarian">("water");

  // INTERACTIVE INPUTS state
  const [waterPerPerson, setWaterPerPerson] = useState<number>(15); // Liters/person/day (Sphere standard is min 15)
  const [waterDistance, setWaterDistance] = useState<number>(150); // walking distance in meters (Sphere max 500m)
  
  const [latrineRatio, setLatrineRatio] = useState<number>(20); // people per toilet (Sphere standard is max 20)
  const [sanitationWaterOffset, setSanitationWaterOffset] = useState<number>(35); // offset distance from water source in meters (min 30m)
  const [groundSlope, setGroundSlope] = useState<"towards_water" | "away_from_water">("away_from_water"); // flow direction
  
  const [dailySunlightHours, setDailySunlightHours] = useState<number>(6); // avg hours of peak sun
  const [lightingSpacing, setLightingSpacing] = useState<number>(25); // distance between lamp poles (meters)
  const [panelRating, setPanelRating] = useState<number>(400); // Watts per solar panel

  const [fireExtinguisherSpacing, setFireExtinguisherSpacing] = useState<number>(40); // distance between pods in meters (max 50m)
  const [fireRoadWidth, setFireRoadWidth] = useState<number>(6); // width of pathways in meters (min 4.5m for trucks)
  const [fireReserveVolume, setFireReserveVolume] = useState<number>(15000); // fire water tank capacity

  // DYNAMIC COMPUTATIONS
  // 1. Water Systems Calculations
  const dailyWaterVolume = pop * waterPerPerson;
  const storageDays = 3; // 3-day buffer recommendation
  const requiredWaterStorage = dailyWaterVolume * storageDays;
  const numberOfWaterTaps = Math.ceil(pop / 250); // Sphere: 1 tap per 250 people
  const waterTanksCount = Math.max(1, Math.ceil(requiredWaterStorage / 10000)); // 10k Liter tank chunks
  const walkingDistanceStatus = waterDistance <= 500 ? "COMPLIANT" : "CRITICAL";

  // 2. Sanitation Calculations
  const totalToiletsNeeded = Math.ceil(pop / latrineRatio);
  const dailySludgeAccumulation = pop * 1.5; // 1.5 liters sludge/person/day
  const requiredSepticVolume = Math.ceil((dailySludgeAccumulation * 30) / 1000); // 30-day retention in m3
  const toiletToWaterSafetyStatus = sanitationWaterOffset >= 30 && groundSlope === "away_from_water" ? "SAFE" : "DANGER";
  const toiletY = 150 + sanitationWaterOffset * 1.5; // push toilets down on map when offset increases!

  // 3. Electricity Calculations
  // Estimated consumption Wh per day: 
  // Shelter unit: 300Wh/day, Primary Clinic: 4500Wh/day, School: 2000Wh/day, Admin: 3000Wh/day, Street lighting: 200Wh * poles
  const estimatedStreetPoles = Math.max(4, Math.ceil((units * 15) / lightingSpacing));
  const dailySheltersLoad = units * 300;
  const adminClinicLoad = 9500; // static base Wh for essential clinics, school and admin
  const lightingLoad = estimatedStreetPoles * 150; // Wh for night lights
  const totalDailyEnergyDemandWh = dailySheltersLoad + adminClinicLoad + lightingLoad;
  const solarPanelsNeeded = Math.ceil((totalDailyEnergyDemandWh / dailySunlightHours) / panelRating * 1.35); // 35% system inefficiencies offset
  const batteryCapacityKWh = parseFloat(((totalDailyEnergyDemandWh * 1.5) / 1000).toFixed(1)); // 1.5 days backup

  // 4. Fire Protection Calculations
  const estimatedCampPerimeterMeters = Math.ceil(Math.sqrt(units * 150) * 4); // perimeter approximation
  const firePodsNeeded = Math.max(2, Math.ceil(estimatedCampPerimeterMeters / fireExtinguisherSpacing));
  const fireRoadStatus = fireRoadWidth >= 4.5 ? "COMPLIANT" : "RESTRICTED";
  const fireSafetyCompliance = fireExtinguisherSpacing <= 50 && fireRoadWidth >= 4.5 && fireReserveVolume >= 10000;

  // Static/Original Humanitarian capacities for consistency
  const studentCapacity = Math.round(pop * 0.3);
  const clinicCapacity = Math.round(pop * 0.15);
  const foodRations = pop * 3;
  const childrenSpaceCapacity = Math.round(pop * 0.2);
  const supportSessions = Math.round(pop * 0.1);

  // Schematic Coordinates Generator for the Interactive Map SVG
  // Grid layout depending on parameters
  const getSchematicMapElements = () => {
    // Generate centers for objects
    const elements: any[] = [];
    
    // 1. Water Reservoirs & Pipes
    for (let i = 0; i < waterTanksCount; i++) {
      elements.push({
        id: `watertank-${i}`,
        type: "watertank",
        x: 80 + i * 110,
        y: 60,
        label: isAr ? `خزان مياه ${i+1}` : `Water Tank ${i+1}`,
        status: walkingDistanceStatus === "COMPLIANT" ? "healthy" : "warning"
      });
    }

    // Pipe lines from tanks to tap stations
    elements.push({
      id: "pipe-line-1",
      type: "pipe",
      x1: 80,
      y1: 60,
      x2: 120,
      y2: 150,
    });
    if (waterTanksCount > 1) {
      elements.push({
        id: "pipe-line-2",
        type: "pipe",
        x1: 190,
        y1: 60,
        x2: 240,
        y2: 150,
      });
    }

    // 2. Water Distribution Outlets
    for (let i = 0; i < numberOfWaterTaps; i++) {
      elements.push({
        id: "watertap-" + i,
        type: "watertap",
        x: 120 + i * 120,
        y: 150,
        label: isAr ? `نقطة توزيع ${i+1}` : `Water Tap ${i+1}`,
        status: "healthy"
      });
    }

    // 3. Toilets & Septic Tanks
    // Let's place toilets at the lower side with a safety offset
    for (let i = 0; i < Math.min(4, totalToiletsNeeded); i++) {
      elements.push({
        id: "latrine-" + i,
        type: "latrine",
        x: 50 + i * 90,
        y: Math.min(320, toiletY),
        label: isAr ? `دورة مياه ${i+1}` : `Latrine ${i+1}`,
        status: toiletToWaterSafetyStatus === "SAFE" ? "healthy" : "danger"
      });
    }

    // Septic tank is downstream
    elements.push({
      id: "septictank",
      type: "septictank",
      x: 320,
      y: Math.min(340, toiletY + 30),
      label: isAr ? "خزان التحليل اللاهوائي" : "Septic Bio-Tank",
      status: toiletToWaterSafetyStatus === "SAFE" ? "healthy" : "danger"
    });

    // 4. Solar Arrays & Grid Poles
    elements.push({
      id: "solarstation",
      type: "solar",
      x: 360,
      y: 60,
      label: isAr ? `مجمع الخلايا (${solarPanelsNeeded} لوح)` : `Solar Array (${solarPanelsNeeded} Panels)`,
      status: "healthy"
    });

    // Street lighting poles along the central pathway
    for (let i = 0; i < Math.min(5, estimatedStreetPoles); i++) {
      elements.push({
        id: "lightpole-" + i,
        type: "lightpole",
        x: 40 + i * 90,
        y: 210,
        label: `💡 L${i+1}`,
        status: "healthy"
      });
    }

    // 5. Fire Hydrants / Pods
    for (let i = 0; i < Math.min(3, firePodsNeeded); i++) {
      elements.push({
        id: "firepoint-" + i,
        type: "fire",
        x: 90 + i * 140,
        y: 250,
        label: isAr ? `نقطة إطفاء ${i+1}` : `Fire Pod ${i+1}`,
        status: fireSafetyCompliance ? "healthy" : "warning"
      });
    }

    return elements;
  };

  const schematicElements = getSchematicMapElements();

  return (
    <div className="flex flex-col gap-6" id="camp-infrastructure-full-view">
      
      {/* Top Banner with Interactive Toggle */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black tracking-wider px-2 py-0.5 rounded uppercase font-mono">
                {isAr ? "نظام التخطيط الهندسي المولد" : "AUTONOMOUS SYSTEM GENERATOR"}
              </span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase">
                {isAr ? "متطابق مع معايير إسفير" : "Sphere Standard Certified"}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-tight">
              {isAr ? "مخطط ومولد شبكات البنية التحتية التفاعلي" : "Interactive Infrastructure Net Generator"}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-normal">
              {isAr
                ? "لوحة مراقبة وتوليد حسابات شبكات المياه العذبة، الصرف الصحي الآمن، توزيع الكهرباء المستقلة بالطاقة الشمسية، وخطط الحماية ومكافحة الحرائق بالمخيم وفقاً لمدخلاتك."
                : "Generate and compute custom utility networks. Tune water volume rates, sewage offsets, solar load requirements, and firefighting buffers to model full camp sustainability."}
            </p>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Grid Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3" id="infrastructure-sub-tabs">
        <button
          onClick={() => setActiveSubTab("water")}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeSubTab === "water"
              ? "bg-blue-50 text-blue-700 shadow-3xs border border-blue-100"
              : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
          }`}
        >
          <Droplets className="w-3.5 h-3.5" />
          {isAr ? "شبكة المياه" : "Water Network"}
        </button>

        <button
          onClick={() => setActiveSubTab("sanitation")}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeSubTab === "sanitation"
              ? "bg-teal-50 text-teal-700 shadow-3xs border border-teal-100"
              : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          {isAr ? "الصرف الصحي" : "Sanitation & Sewer"}
        </button>

        <button
          onClick={() => setActiveSubTab("electricity")}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeSubTab === "electricity"
              ? "bg-amber-50 text-amber-700 shadow-3xs border border-amber-100"
              : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          {isAr ? "شبكة الكهرباء" : "Electrical Microgrid"}
        </button>

        <button
          onClick={() => setActiveSubTab("fire")}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeSubTab === "fire"
              ? "bg-rose-50 text-rose-700 shadow-3xs border border-rose-100"
              : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          {isAr ? "الحماية من الحريق" : "Fire Safety"}
        </button>

        <button
          onClick={() => setActiveSubTab("humanitarian")}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeSubTab === "humanitarian"
              ? "bg-pink-50 text-pink-700 shadow-3xs border border-pink-100"
              : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          {isAr ? "المرافق الخدمية والإنسانية" : "Humanitarian Facilities"}
        </button>
      </div>

      {/* Main Work Grid: Interactive Controls + Dynamic Result Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT PANEL: Interactive Sliders & Configuration */}
        <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl flex flex-col gap-5">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
              {isAr ? "تعديل معايير التصميم والموقع" : "Adjust Design Standards"}
            </h4>
          </div>

          {/* WATER NETWORK PANEL CONTROLS */}
          {activeSubTab === "water" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">{isAr ? "معدل استهلاك الفرد اليومي:" : "Daily Liters Per Person:"}</span>
                  <span className="font-mono font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{waterPerPerson} {isAr ? "لتر" : "L"}</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="60"
                  step="1"
                  value={waterPerPerson}
                  onChange={(e) => setWaterPerPerson(parseInt(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[9px] text-slate-500 font-bold">
                  {isAr ? "💡 المعيار الدولي الأدنى لميثاق إسفير هو 15 لتر يومياً." : "💡 Sphere core minimum is 15 Liters/person/day."}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">{isAr ? "المسافة القصوى لنقاط التوزيع:" : "Max Distance to Water Points:"}</span>
                  <span className={`font-mono font-extrabold px-2 py-0.5 rounded ${waterDistance > 500 ? "text-rose-600 bg-rose-50" : "text-emerald-600 bg-emerald-50"}`}>
                    {waterDistance} {isAr ? "متر" : "m"}
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="800"
                  step="25"
                  value={waterDistance}
                  onChange={(e) => setWaterDistance(parseInt(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                {waterDistance > 500 && (
                  <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-lg text-[9px] text-rose-700 leading-normal flex gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>{isAr ? "تنبيه: يتجاوز الحد المسموح (500م). قد تواجه الأسر صعوبة في نقل المياه." : "Warning: Exceeds 500m Sphere limit! Heavy haul burden on vulnerable families."}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SANITATION PANEL CONTROLS */}
          {activeSubTab === "sanitation" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">{isAr ? "أقصى استيعاب للمرحاض الواحد:" : "People Per Single Toilet:"}</span>
                  <span className="font-mono font-extrabold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">{latrineRatio} {isAr ? "أفراد" : "pax"}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="1"
                  value={latrineRatio}
                  onChange={(e) => setLatrineRatio(parseInt(e.target.value))}
                  className="w-full accent-teal-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[9px] text-slate-500 font-bold">
                  {isAr ? "💡 نسبة إسفير المثالية هي دورة مياه لكل 20 شخص." : "💡 Best hygiene practice targets 1 latrine per 20 users."}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">{isAr ? "المسافة الآمنة عن مصادر المياه:" : "Safety Offset from Water Sources:"}</span>
                  <span className={`font-mono font-extrabold px-2 py-0.5 rounded ${sanitationWaterOffset < 30 ? "text-rose-600 bg-rose-50" : "text-emerald-600 bg-emerald-50"}`}>
                    {sanitationWaterOffset} {isAr ? "متر" : "m"}
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="100"
                  step="5"
                  value={sanitationWaterOffset}
                  onChange={(e) => setSanitationWaterOffset(parseInt(e.target.value))}
                  className="w-full accent-teal-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                {sanitationWaterOffset < 30 && (
                  <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-lg text-[9px] text-rose-700 leading-normal flex gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>{isAr ? "خطر: يقل عن 30 متر! خطر تسرب مياه الصرف الصحي إلى مياه الشرب مرتفع جداً." : "Danger: Below 30m minimum limit! Extreme risk of groundwater pathogen contamination."}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">{isAr ? "اتجاه جريان مياه المنحدر الطبيعي:" : "Natural Slope Drainage Flow:"}</label>
                <select
                  value={groundSlope}
                  onChange={(e) => setGroundSlope(e.target.value as any)}
                  className="w-full border border-slate-200 rounded-xl p-2 bg-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="away_from_water">✅ {isAr ? "بعيداً عن مصادر المياه (تصميم آمن)" : "Away from water (Safe design)"}</option>
                  <option value="towards_water">❌ {isAr ? "باتجاه مصادر المياه (خطر تلوث!)" : "Towards water sources (Pollution risk!)"}</option>
                </select>
              </div>
            </div>
          )}

          {/* ELECTRICITY PANEL CONTROLS */}
          {activeSubTab === "electricity" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">{isAr ? "ساعات ذروة الإشعاع الشمسي اليومي:" : "Peak Daily Sunlight Hours:"}</span>
                  <span className="font-mono font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{dailySunlightHours} {isAr ? "ساعات" : "hours"}</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="10"
                  step="0.5"
                  value={dailySunlightHours}
                  onChange={(e) => setDailySunlightHours(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">{isAr ? "تباعد أعمدة إنارة الممرات:" : "Lighting Pole Spacing Interval:"}</span>
                  <span className="font-mono font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{lightingSpacing} {isAr ? "متر" : "m"}</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="60"
                  step="5"
                  value={lightingSpacing}
                  onChange={(e) => setLightingSpacing(parseInt(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[9px] text-slate-400">
                  {isAr ? `التباعد المحدد ينتج عنه تثبيت ${estimatedStreetPoles} أعمدة إنارة.` : `This interval requires approximately ${estimatedStreetPoles} lighting poles.`}
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">{isAr ? "قدرة اللوح الشمسي الواحد (واط):" : "Single PV Panel Power (Watts):"}</label>
                <select
                  value={panelRating}
                  onChange={(e) => setPanelRating(parseInt(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl p-2 bg-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="350">350 W Mono</option>
                  <option value="400">400 W High-Eff</option>
                  <option value="450">450 W Premium Bifacial</option>
                  <option value="550">550 W Industrial Grade</option>
                </select>
              </div>
            </div>
          )}

          {/* FIRE SAFETY PANEL CONTROLS */}
          {activeSubTab === "fire" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">{isAr ? "عرض ممرات الطوارئ البرية:" : "Emergency Access Lane Width:"}</span>
                  <span className={`font-mono font-extrabold px-2 py-0.5 rounded ${fireRoadWidth < 4.5 ? "text-rose-600 bg-rose-50" : "text-emerald-600 bg-emerald-50"}`}>
                    {fireRoadWidth} {isAr ? "متر" : "m"}
                  </span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="8"
                  step="0.5"
                  value={fireRoadWidth}
                  onChange={(e) => setFireRoadWidth(parseFloat(e.target.value))}
                  className="w-full accent-rose-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                {fireRoadWidth < 4.5 && (
                  <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-lg text-[9px] text-rose-700 leading-normal flex gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>{isAr ? "تنبيه: ممر ضيق جداً لمناورة وعودة سيارات الإطفاء الكبرى (يتطلب ≥ 4.5م)." : "Warning: Road too narrow! Heavy municipal fire trucks require at least 4.5m."}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">{isAr ? "تباعد صناديق إطفاء الحريق:" : "Fire Pods Distance Interval:"}</span>
                  <span className={`font-mono font-extrabold px-2 py-0.5 rounded ${fireExtinguisherSpacing > 50 ? "text-rose-600 bg-rose-50" : "text-emerald-600 bg-emerald-50"}`}>
                    {fireExtinguisherSpacing} {isAr ? "متر" : "m"}
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={fireExtinguisherSpacing}
                  onChange={(e) => setFireExtinguisherSpacing(parseInt(e.target.value))}
                  className="w-full accent-rose-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                {fireExtinguisherSpacing > 50 && (
                  <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-lg text-[9px] text-rose-700 leading-normal flex gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>{isAr ? "تحذير: المسافة الكبيرة تعرقل الإخماد السريع للنار (الحد الموصى به ≤ 50م)." : "Caution: Interval too wide! Impedes rapid containment of sparks. Recommend ≤ 50m."}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">{isAr ? "سعة خزان مكافحة الحريق المخصص:" : "Dedicated Fire Hydrant Reservoir:"}</label>
                <select
                  value={fireReserveVolume}
                  onChange={(e) => setFireReserveVolume(parseInt(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl p-2 bg-white text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  <option value="5000">5,000 Liters (Utility only)</option>
                  <option value="10000">10,000 Liters (Minimum Standard)</option>
                  <option value="15000">15,000 Liters (High Protection)</option>
                  <option value="30000">30,000 Liters (Double Buffer)</option>
                </select>
              </div>
            </div>
          )}

          {/* HUMANITARIAN PANEL CONTROLS */}
          {activeSubTab === "humanitarian" && (
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-black text-pink-600 uppercase tracking-wide">
                {isAr ? "إحصاءات استيعاب السكان" : "Demographics Coverage"}
              </span>
              <div className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col gap-1.5 font-mono text-xs text-slate-700">
                <div className="flex justify-between">
                  <span>{isAr ? "إجمالي السكان:" : "Total Camp Population:"}</span>
                  <span className="font-extrabold text-slate-900">{pop} pax</span>
                </div>
                <div className="flex justify-between">
                  <span>{isAr ? "الأطفال (التعليم):" : "Children (Education):"}</span>
                  <span className="font-extrabold text-pink-600">{studentCapacity} pax</span>
                </div>
                <div className="flex justify-between">
                  <span>{isAr ? "الحالات الطبية الحرجة:" : "Avg Medical Load:"}</span>
                  <span className="font-extrabold text-blue-600">{clinicCapacity} cases/d</span>
                </div>
                <div className="flex justify-between">
                  <span>{isAr ? "وجبات التموين اليومية:" : "Daily Meal Rations:"}</span>
                  <span className="font-extrabold text-emerald-600">{foodRations} meals</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 text-justify leading-relaxed">
                {isAr 
                  ? "تتم الحسابات والمساحات المخصصة أوتوماتيكياً استناداً لمبدأ حفظ كرامة الأسر وسلامة الأطفال والوصول السريع للمراكز الاجتماعية."
                  : "All structural dimensions and school shifts are auto-sized ensuring child safety and close geographic accessibility to communal circles."}
              </p>
            </div>
          )}

          {/* General Grid Sphere Standard Status Indicator */}
          <div className="bg-white p-4 rounded-xl border border-slate-150/80 mt-2 flex flex-col gap-2 shadow-3xs">
            <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{isAr ? "حالة تدقيق معايير الجودة الدولية" : "SPHERE COMPLIANCE CHECK"}</h5>
            
            <div className="flex items-center justify-between text-[11px] font-medium border-b border-slate-50 pb-1.5">
              <span>{isAr ? "أمان مسافة المياه (≤ 500م):" : "Water Walking Reach:"}</span>
              {walkingDistanceStatus === "COMPLIANT" ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1">✓ {isAr ? "مطابق" : "Pass"}</span>
              ) : (
                <span className="text-rose-600 font-bold flex items-center gap-1">⚠️ {isAr ? "خلل" : "Fail"}</span>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] font-medium border-b border-slate-50 pb-1.5">
              <span>{isAr ? "مسافة عزل الصرف (≥ 30م):" : "Sanitation Safety Gap:"}</span>
              {toiletToWaterSafetyStatus === "SAFE" ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1">✓ {isAr ? "آمن" : "Pass"}</span>
              ) : (
                <span className="text-rose-600 font-bold flex items-center gap-1">⚠️ {isAr ? "خطر تلوث" : "Critical"}</span>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] font-medium border-b border-slate-50 pb-1.5">
              <span>{isAr ? "عرض ممرات الطوارئ (≥ 4.5م):" : "Fire Engine Clearance:"}</span>
              {fireRoadStatus === "COMPLIANT" ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1">✓ {isAr ? "مطابق" : "Pass"}</span>
              ) : (
                <span className="text-rose-600 font-bold flex items-center gap-1">⚠️ {isAr ? "ضيق" : "Narrow"}</span>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] font-medium">
              <span>{isAr ? "تباعد نقاط الإطفاء (≤ 50م):" : "Extinguisher Spacing:"}</span>
              {fireExtinguisherSpacing <= 50 ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1">✓ {isAr ? "مطابق" : "Pass"}</span>
              ) : (
                <span className="text-rose-600 font-bold flex items-center gap-1">⚠️ {isAr ? "متباعد" : "Wide"}</span>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT PANEL: Interactive Generated Calculations & Schematic Map */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Output Results according to selected Tab */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Dynamic Card 1 */}
            {activeSubTab === "water" && (
              <>
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-3xs">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">{isAr ? "حساب شبكة وتمديدات المياه" : "Water Hydraulic Computations"}</h5>
                    <span className="p-1 rounded bg-blue-50 text-blue-600"><Droplets className="w-4 h-4" /></span>
                  </div>
                  <div className="flex flex-col gap-2 mt-4 font-mono text-xs">
                    <div className="flex justify-between border-b border-slate-50 pb-1.5 text-slate-600">
                      <span>{isAr ? "الطلب اليومي الإجمالي:" : "Total Daily Consumption:"}</span>
                      <span className="font-extrabold text-slate-950">{dailyWaterVolume.toLocaleString()} {isAr ? "لتر" : "L"}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-1.5 text-slate-600">
                      <span>{isAr ? "سعة تخزين الطوارئ (3 أيام):" : "3-Day Storage Capacity:"}</span>
                      <span className="font-extrabold text-blue-600">{requiredWaterStorage.toLocaleString()} {isAr ? "لتر" : "L"}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-1.5 text-slate-600">
                      <span>{isAr ? "عدد خزانات المياه القياسية:" : "Cistern Count (10kL standard):"}</span>
                      <span className="font-extrabold text-slate-950">{waterTanksCount} {isAr ? "خزانات علوية" : "tanks"}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>{isAr ? "نقاط توزيع مياه الشرب (الحنفيات):" : "Active Water Taps needed:"}</span>
                      <span className="font-extrabold text-slate-950">{numberOfWaterTaps} {isAr ? "مخارج مشتركة" : "outlets"}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-4 leading-normal text-justify">
                    {isAr 
                      ? "التوصية: استخدام أنابيب البولي إيثيلين HDPE بقطر 2 إنش ذات تحمل ضغط PN10 مدفونة على عمق 50 سم لمنع التجمد وتلف خط الإمداد."
                      : "Piping advice: Lay 2-inch High-Density Polyethylene (HDPE) lines rated PN10. Buried 50cm below frost line to protect against vehicular pressure."}
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-100/50 p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-black text-blue-700 uppercase tracking-widest block mb-1">{isAr ? "توزيع المضخات والضغط" : "PUMP AND PRESSURE CONTROL"}</span>
                    <h5 className="font-extrabold text-slate-800 text-xs">{isAr ? "نظام الضخ بالطاقة الشمسية" : "Solar Submersible Lift Station"}</h5>
                    <p className="text-[11px] text-slate-600 leading-normal mt-2.5 text-justify">
                      {isAr
                        ? `يتطلب دفع المياه من الخزانات الرئيسية الـ ${waterTanksCount} إلى نقاط التوزيع شبكة أنابيب مغلقة يتم تغذيتها بمضخة غاطسة ذكية تعمل بالتيار المستمر بقدرة 2.5 حصان، تضخ بمعدل ثابت يبلغ 4.5 متر مكعب لكل ساعة لتعويض ذروة الاستهلاك صباحاً وظهراً دون الحاجة لوقود ديزل ملوث.`
                        : `Pumping wastewater safely requires automated pressure management. Based on ${waterTanksCount} reservoirs, the system triggers a 2.5 HP solar DC pressure pump moving 4.5 cubic meters/hour to meet morning/noon consumption spikes, securing green grid operation.`}
                    </p>
                  </div>
                  <div className="bg-white/80 p-3 rounded-xl border border-blue-100 flex items-center gap-2.5 mt-4">
                    <span className="text-xl">☀️</span>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-500 block font-bold leading-none">{isAr ? "كفاءة التشغيل الأخضر" : "EMISSION FREE"}</span>
                      <span className="text-[11px] font-extrabold text-blue-700 block mt-1">{isAr ? "100% طاقة نظيفة دون ديزل" : "100% clean solar lifting"}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Dynamic Card 2 */}
            {activeSubTab === "sanitation" && (
              <>
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-3xs">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">{isAr ? "تصميم البنية التحتية للصرف" : "Sanitation & Septic Design"}</h5>
                    <span className="p-1 rounded bg-teal-50 text-teal-600"><Activity className="w-4 h-4" /></span>
                  </div>
                  <div className="flex flex-col gap-2 mt-4 font-mono text-xs">
                    <div className="flex justify-between border-b border-slate-50 pb-1.5 text-slate-600">
                      <span>{isAr ? "إجمالي المراحيض المطلوبة:" : "Total Latrines Required:"}</span>
                      <span className="font-extrabold text-slate-950">{totalToiletsNeeded} {isAr ? "مراحيض منفصلة" : "stalls"}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-1.5 text-slate-600">
                      <span>{isAr ? "تراكم الفضلات السائل اليومي:" : "Daily Waste Liquid Sludge:"}</span>
                      <span className="font-extrabold text-teal-600">{dailySludgeAccumulation.toLocaleString()} {isAr ? "لتر / يوم" : "L / day"}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-1.5 text-slate-600">
                      <span>{isAr ? "حجم خزان التحليل لـ 30 يوم:" : "Septic Chamber (30-day Retention):"}</span>
                      <span className="font-extrabold text-slate-950">{requiredSepticVolume} {isAr ? "متر مكعب" : "m³"}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>{isAr ? "اتجاه التدفق الصحي ومسافة العزل:" : "Drainage Safety Compliance:"}</span>
                      <span className={`font-extrabold ${toiletToWaterSafetyStatus === "SAFE" ? "text-emerald-600" : "text-rose-600 animate-pulse"}`}>
                        {toiletToWaterSafetyStatus === "SAFE" ? (isAr ? "آمن ومطابق" : "Safe & Compliant") : (isAr ? "خطير وغير مطابق!" : "DANGEROUS LEAK RISK")}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-4 leading-normal text-justify">
                    {isAr
                      ? "المعايير: استخدام مواسير PVC ثقيلة بقطر 4 إنش بانحدار طبيعي 1:50 لتوجيه التدفق بالجاذبية دون انسداد، مع ضرورة عزل خزان التحليل بمادة البيتومين العازلة لمنع التسرب الجوفي."
                      : "Piping specs: Deploy 4-inch heavy-grade PVC sewer lines with a gravity-assisted gradient of 1:50. Seal septic vaults with bitumen compound to eliminate deep soakage leaks."}
                  </p>
                </div>

                <div className="bg-teal-50 border border-teal-100/50 p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-black text-teal-700 uppercase tracking-widest block mb-1">{isAr ? "كفاءة العزل البيئي" : "ENVIRONMENTAL HAZARD CONTROL"}</span>
                    <h5 className="font-extrabold text-slate-800 text-xs">{isAr ? "منع الأوبئة وانتشار العدوى" : "Epidemic Vector Prevention"}</h5>
                    <p className="text-[11px] text-slate-600 leading-normal mt-2.5 text-justify">
                      {isAr
                        ? `عند تباعد الحمامات الـ ${totalToiletsNeeded} بمسافة ${sanitationWaterOffset} متر، وجريان الميل الطبيعي باتجاه ${groundSlope === "away_from_water" ? "خارج شبكة المياه" : "داخل المجمع السكني (يجب تعديله!)"}، يتم حظر تكاثر ذباب الكوليرا والتيفوئيد بشكل كامل وحفظ الطهارة البيئية والمجتمعية للأسر النازحة.`
                        : `By arranging ${totalToiletsNeeded} toilets with a safe ${sanitationWaterOffset}m clearance, and routing gravity flow ${groundSlope === "away_from_water" ? "away from fresh water" : "towards fresh water (CRITICAL THREAT, adjust slope)"}, you completely eliminate vector-borne cholera outbreaks.`}
                    </p>
                  </div>
                  <div className="bg-white/80 p-3 rounded-xl border border-teal-100 flex items-center gap-2.5 mt-4">
                    <span className="text-xl">🛡️</span>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-500 block font-bold leading-none">{isAr ? "توجيه الجريان" : "FLOW COMPLIANCE"}</span>
                      <span className={`text-[11px] font-extrabold block mt-1 ${groundSlope === "away_from_water" ? "text-teal-700" : "text-rose-600 animate-pulse"}`}>
                        {groundSlope === "away_from_water" ? (isAr ? "اتجاه آمن" : "Safe Flow Direction") : (isAr ? "اتجاه خاطئ وممرض" : "Hazardous Reverse Drainage")}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Dynamic Card 3 */}
            {activeSubTab === "electricity" && (
              <>
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-3xs">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">{isAr ? "تخطيط ميكروجريد الطاقة الشمسية" : "Solar Microgrid Dimensions"}</h5>
                    <span className="p-1 rounded bg-amber-50 text-amber-600"><Sun className="w-4 h-4" /></span>
                  </div>
                  <div className="flex flex-col gap-2 mt-4 font-mono text-xs">
                    <div className="flex justify-between border-b border-slate-50 pb-1.5 text-slate-600">
                      <span>{isAr ? "تقدير الحمل الكهربائي اليومي:" : "Daily Camp Energy Demand:"}</span>
                      <span className="font-extrabold text-slate-950">{(totalDailyEnergyDemandWh / 1000).toFixed(2)} KWh</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-1.5 text-slate-600">
                      <span>{isAr ? "إجمالي الخلايا الشمسية المطلوبة:" : "Solar Monocrystalline PV Panels:"}</span>
                      <span className="font-extrabold text-amber-600">{solarPanelsNeeded} {isAr ? "ألواح (400 واط)" : "panels"}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-1.5 text-slate-600">
                      <span>{isAr ? "سعة مخزن بطاريات الليثيوم:" : "LiFePO4 Battery Reserve:"}</span>
                      <span className="font-extrabold text-slate-950">{batteryCapacityKWh} KWh</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>{isAr ? "عدد أعمدة إنارة الممرات الليلية:" : "Estimated Streetlights poles:"}</span>
                      <span className="font-extrabold text-slate-950">{estimatedStreetPoles} {isAr ? "أعمدة ذكية" : "lighting posts"}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-4 leading-normal text-justify">
                    {isAr
                      ? "المعايير: استخدام بطاريات ليثيوم LiFePO4 بجهد مستمر 48 فولت لضمان كفاءة عالية تصل لـ 90%، وعمر تشغيلي طويل يتعدى 10 سنوات في الظروف الجوية الصعبة."
                      : "System topology: Configure high-longevity 48V LiFePO4 lithium batteries. Yields a 90% roundtrip conversion efficiency and survives 10+ years of rugged grid strain."}
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-100/50 p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest block mb-1">{isAr ? "تأمين وحماية ليلية" : "NIGHT SAFETY & PROTECTION"}</span>
                    <h5 className="font-extrabold text-slate-800 text-xs">{isAr ? "إنارة ليد بحساسات آلية" : "Autonomous Dawn/Dusk Lighting"}</h5>
                    <p className="text-[11px] text-slate-600 leading-normal mt-2.5 text-justify">
                      {isAr
                        ? `عند تباعد الأعمدة بمسافة ${lightingSpacing} متر، يتم توزيع الإنارة الليلية بالتساوي لمنع البقع المظلمة. يتم تزويد كل عمود حديدي ذكي بارتفاع 4 أمتار بخلية كهروضوئية مدمجة وبطارية ليثيوم احتياطية مستقلة لضمان استمرارية الإضاءة حتى لو انقطعت كابلات الميكروجريد الرئيسية.`
                        : `Setting lighting posts at a ${lightingSpacing}m interval guarantees total perimeter illumination. Each smart post features an autonomous lithium battery pack and dusk photocell to secure continuous operations even if primary distribution lines undergo structural damage.`}
                    </p>
                  </div>
                  <div className="bg-white/80 p-3 rounded-xl border border-amber-100 flex items-center gap-2.5 mt-4">
                    <span className="text-xl">💡</span>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-500 block font-bold leading-none">{isAr ? "نوع الإنارة" : "LUMINARY TYPE"}</span>
                      <span className="text-[11px] font-extrabold text-amber-700 block mt-1">{isAr ? "موفّرة 30 واط LED عالي السطوع" : "30W Premium Efficiency LED"}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Dynamic Card 4 */}
            {activeSubTab === "fire" && (
              <>
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-3xs">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">{isAr ? "حسابات السلامة والحرائق" : "Fire Containment Engineering"}</h5>
                    <span className="p-1 rounded bg-rose-50 text-rose-600"><Flame className="w-4 h-4" /></span>
                  </div>
                  <div className="flex flex-col gap-2 mt-4 font-mono text-xs">
                    <div className="flex justify-between border-b border-slate-50 pb-1.5 text-slate-600">
                      <span>{isAr ? "عرض ممرات مرور سيارات الإطفاء:" : "Fire Truck Lane Clearance:"}</span>
                      <span className={`font-extrabold ${fireRoadWidth < 4.5 ? "text-rose-600 animate-pulse" : "text-slate-950"}`}>{fireRoadWidth} {isAr ? "متر" : "m"}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-1.5 text-slate-600">
                      <span>{isAr ? "حجم مياه مكافحة الحريق المخصصة:" : "Dedicated Hydrant Tank Volume:"}</span>
                      <span className="font-extrabold text-rose-600">{fireReserveVolume.toLocaleString()} {isAr ? "لتر" : "L"}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-1.5 text-slate-600">
                      <span>{isAr ? "عدد نقاط الإطفاء السريعة الموزعة:" : "Distributed Quick Fire Pods:"}</span>
                      <span className="font-extrabold text-slate-950">{firePodsNeeded} {isAr ? "نقاط حماية" : "pods"}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>{isAr ? "معدل سلامة وقدرة المناورة:" : "Access Maneuver Status:"}</span>
                      <span className={`font-extrabold ${fireRoadStatus === "COMPLIANT" ? "text-emerald-600" : "text-rose-500 animate-pulse"}`}>
                        {fireRoadStatus === "COMPLIANT" ? (isAr ? "ممرات معتمدة ومطابقة" : "Compliant Access Routes") : (isAr ? "ممرات ضيقة حرجة!" : "RESTRICTED ACCESS WARNING")}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-4 leading-normal text-justify">
                    {isAr
                      ? "المواصفات: تأسيس نقاط إطفاء سريعة على زوايا المربعات السكنية مجهزة بحقيبة إطفاء وبكرة خراطيم بقطر 1.5 إنش متصلة بالخزان المركزي وصمام ضغط لاهوائي."
                      : "Staging specs: Position quick-response lockers at residential corners. Equipping each with one ABC dry-powder extinguisher, CO2 unit, and 1.5-inch canvas hose spools."}
                  </p>
                </div>

                <div className="bg-rose-50 border border-rose-100/50 p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-black text-rose-700 uppercase tracking-widest block mb-1">{isAr ? "تكتيكات التدخل السريع" : "RAPID INTERVENTION TACTICS"}</span>
                    <h5 className="font-extrabold text-slate-800 text-xs">{isAr ? "عزل وحصر بؤر الحريق" : "Sectorized Thermal Blockade"}</h5>
                    <p className="text-[11px] text-slate-600 leading-normal mt-2.5 text-justify">
                      {isAr
                        ? `بوضع صناديق الإطفاء بتباعد ${fireExtinguisherSpacing} متر، يمكن لأي فرد الوصول لأداة مكافحة في غضون 15 ثانية فقط. الحفاظ على خزان مياه مخصص للحريق بسعة ${fireReserveVolume.toLocaleString()} لتر يمنح فرق الإطفاء الميدانية تدفقاً مستمراً للماء بضغط 3 بار لمدة 45 دقيقة متواصلة لعزل النيران ومنع توسع الكارثة.`
                        : `Siting fire lockers at a ${fireExtinguisherSpacing}m distance ensures any resident can fetch containment tools in under 15 seconds. Locking a dedicated ${fireReserveVolume.toLocaleString()}L hydrant reservoir guarantees firefighters a continuous 3-bar pressure flow for up to 45 minutes to suppress spreads.`}
                    </p>
                  </div>
                  <div className="bg-white/80 p-3 rounded-xl border border-rose-150 flex items-center gap-2.5 mt-4">
                    <span className="text-xl">🚒</span>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-500 block font-bold leading-none">{isAr ? "عرض ممرات الطوارئ" : "LANE SPECIFICATIONS"}</span>
                      <span className={`text-[11px] font-extrabold block mt-1 ${fireRoadWidth >= 4.5 ? "text-rose-700" : "text-rose-600 animate-pulse"}`}>
                        {fireRoadWidth >= 4.5 ? (isAr ? `مطابق: ${fireRoadWidth}م آمن` : `Compliant: ${fireRoadWidth}m`) : (isAr ? `تنبيه: ${fireRoadWidth}م ضيق!` : `Warning: ${fireRoadWidth}m Narrow`)}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Dynamic Card 5 */}
            {activeSubTab === "humanitarian" && (
              <>
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-3xs">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">{isAr ? "تغطية المرافق والخدمات الإنسانية" : "Humanitarian Facility Sizing"}</h5>
                    <span className="p-1 rounded bg-pink-50 text-pink-600"><Users className="w-4 h-4" /></span>
                  </div>
                  <div className="flex flex-col gap-2 mt-4 font-mono text-xs">
                    <div className="flex justify-between border-b border-slate-50 pb-1.5 text-slate-600">
                      <span>{isAr ? "المستفيدين النشطين بالمخيم:" : "Active Camp Beneficiaries:"}</span>
                      <span className="font-extrabold text-slate-950">{pop} {isAr ? "مستفيد" : "persons"}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-1.5 text-slate-600">
                      <span>{isAr ? "طاقة استيعاب المدارس المؤقتة:" : "Temporary School Capacity:"}</span>
                      <span className="font-extrabold text-pink-600">{studentCapacity} {isAr ? "طالباً وطالبة" : "students"}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-1.5 text-slate-600">
                      <span>{isAr ? "العيادات الطبية الميدانية:" : "Clinic Daily Caseload:"}</span>
                      <span className="font-extrabold text-slate-950">{clinicCapacity} {isAr ? "مراجع يومياً" : "cases / day"}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>{isAr ? "وجبات المطابخ المركزية اليومية:" : "Daily Hot Meals Sourced:"}</span>
                      <span className="font-extrabold text-slate-950">{foodRations} {isAr ? "وجبات طازجة" : "rations / day"}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-4 leading-normal text-justify">
                    {isAr
                      ? "الدعم الإضافي: توفير مساحات صديقة للأطفال بسعة لـ 35 طفلاً في المرة الواحدة، وعيادة دعم نفسي واجتماعي تدعم 10 عوائل يومياً للحد من صدمات النزوح."
                      : "Socio-emotional: Accommodating up to 35 children in shaded spaces with a localized psychological trauma counseling center helping 10 families/day."}
                  </p>
                </div>

                <div className="bg-pink-50 border border-pink-100/50 p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-black text-pink-700 uppercase tracking-widest block mb-1">{isAr ? "الخدمات الاجتماعية والصحية" : "SOCIO-HEALTH STANDARDS"}</span>
                    <h5 className="font-extrabold text-slate-800 text-xs">{isAr ? "تكامل الرعاية في الميدان" : "Comprehensive Field Care Integration"}</h5>
                    <p className="text-[11px] text-slate-600 leading-normal mt-2.5 text-justify">
                      {isAr
                        ? "يتم تمكين المستوصف الميداني والصيدلية بالكهرباء المستقرة على مدار الساعة لحفظ اللقاحات والأنسولين تحت تبريد مستمر، وربطهما بخط مياه عذبة لغسيل الأيدي والتعقيم للسيطرة الآمنة على مسببات الأوبئة."
                        : "Our clinical unit and pediatric hub are prioritized in solar electrical distribution. Continuous green power secures active vaccine refrigeration and cold-chains, and links to freshwater pipelines for infection control."}
                    </p>
                  </div>
                  <div className="bg-white/80 p-3 rounded-xl border border-pink-100 flex items-center gap-2.5 mt-4">
                    <span className="text-xl">🏥</span>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-500 block font-bold leading-none">{isAr ? "سلسلة التبريد" : "COLD CHAIN STATUS"}</span>
                      <span className="text-[11px] font-extrabold text-pink-700 block mt-1">{isAr ? "آمنة ومغذاة بالطاقة الشمسية 24 ساعة" : "Secure Solar Refrigeration"}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

          </div>

          {/* DYNAMIC COMPUTE SCHEMA GRID (SVG Representation) */}
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Compass className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <h4 className="font-extrabold text-slate-800 text-sm">
                    {isAr ? "مخطط التوزيع الهندسي والشبكات" : "Interactive Schematic Site Network Layout"}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {isAr
                      ? "مخطط فني يوضح تموضع الخزانات والأنابيب والمراحيض الحيوية والصرف والمسارات الآمنة تزامناً مع المعطيات الحالية."
                      : "Computed layout schematic showing fresh water pipes, sanitation lines, solar grids, and fire access ways based on parameters."}
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive SVG Render */}
            <div className="w-full bg-slate-950 rounded-xl p-3 border border-slate-900 relative overflow-hidden" style={{ minHeight: "360px" }}>
              
              {/* Compass symbol */}
              <div className="absolute top-3 right-3 text-slate-600 font-mono text-[9px] flex items-center gap-1">
                <Compass className="w-4 h-4 text-slate-500 animate-spin-slow" />
                <span>N</span>
              </div>

              {/* Topographic height lines representation */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:30px_30px] opacity-10 pointer-events-none" />

              {/* Slope arrow indicator */}
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-slate-900/80 px-2 py-1 rounded border border-slate-800 font-mono text-[8px] text-slate-400">
                <span>{isAr ? "جريان الجاذبية:" : "Gravity Slope:"}</span>
                <span className={groundSlope === "away_from_water" ? "text-emerald-400 font-bold" : "text-rose-400 font-bold animate-pulse"}>
                  {groundSlope === "away_from_water" ? (isAr ? "⬇️ لأسفل (آمن)" : "⬇️ Down (Safe)") : (isAr ? "⬆️ لأعلى (ممرض)" : "⬆️ Up (Hazardous)")}
                </span>
              </div>

              {/* Interactive Schematic SVG Elements */}
              <svg className="w-full h-full" viewBox="0 0 500 360" style={{ minHeight: "340px" }}>
                
                {/* 1. Fire Access Route Path (Green/Red road depending on width) */}
                <rect 
                  x="30" 
                  y="200" 
                  width="440" 
                  height="30" 
                  fill={fireRoadWidth >= 4.5 ? "#14532d" : "#7f1d1d"} 
                  rx="4" 
                  opacity="0.3"
                />
                <line 
                  x1="30" 
                  y1="215" 
                  x2="470" 
                  y2="215" 
                  stroke={fireRoadWidth >= 4.5 ? "#10b981" : "#ef4444"} 
                  strokeDasharray="5 5" 
                  strokeWidth="2"
                />
                <text 
                  x="250" 
                  y="218" 
                  textAnchor="middle" 
                  fill={fireRoadWidth >= 4.5 ? "#a7f3d0" : "#fca5a5"} 
                  fontSize="8" 
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {isAr 
                    ? `مسار الإطفاء (${fireRoadWidth}م) - ${fireRoadStatus === "COMPLIANT" ? "ممر آمن" : "غير كافٍ"}` 
                    : `Fire Access Lane (${fireRoadWidth}m) - ${fireRoadStatus === "COMPLIANT" ? "Compliant" : "Restricted"}`}
                </text>

                {/* 2. Pipe network drawing */}
                {/* Main line from tanks to tap distribution */}
                <line x1="80" y1="60" x2="360" y2="60" stroke="#3b82f6" strokeWidth="2.5" />
                <line x1="120" y1="60" x2="120" y2="150" stroke="#3b82f6" strokeWidth="2" strokeDasharray="2 2" />
                {numberOfWaterTaps > 1 && (
                  <line x1="240" y1="60" x2="240" y2="150" stroke="#3b82f6" strokeWidth="2" strokeDasharray="2 2" />
                )}
                {numberOfWaterTaps > 2 && (
                  <line x1="360" y1="60" x2="360" y2="150" stroke="#3b82f6" strokeWidth="2" strokeDasharray="2 2" />
                )}

                {/* 3. Sewer pipeline drawing to septic tank */}
                {/* Connect latrines to septic tank */}
                <path 
                  d={`M 50 ${Math.min(320, toiletY)} L 320 ${Math.min(320, toiletY)} L 320 ${Math.min(340, toiletY + 30)}`} 
                  fill="none" 
                  stroke={toiletToWaterSafetyStatus === "SAFE" ? "#0d9488" : "#e11d48"} 
                  strokeWidth="2" 
                  strokeDasharray="3 3"
                />

                {/* 4. Power lines representation */}
                <line x1="360" y1="60" x2="40" y2="210" stroke="#d97706" strokeWidth="1" strokeOpacity="0.4" />

                {/* Draw active nodes */}
                {schematicElements.map((el) => {
                  let fillColor = "#1e293b";
                  let strokeColor = "#475569";
                  let emoji = "📦";

                  if (el.type === "watertank") {
                    fillColor = "#1e40af";
                    strokeColor = el.status === "healthy" ? "#3b82f6" : "#f59e0b";
                    emoji = "🛢️";
                  } else if (el.type === "watertap") {
                    fillColor = "#1d4ed8";
                    strokeColor = "#60a5fa";
                    emoji = "🚰";
                  } else if (el.type === "latrine") {
                    fillColor = el.status === "healthy" ? "#0f766e" : "#9f1239";
                    strokeColor = el.status === "healthy" ? "#14b8a6" : "#f43f5e";
                    emoji = "🚽";
                  } else if (el.type === "septictank") {
                    fillColor = el.status === "healthy" ? "#115e59" : "#881337";
                    strokeColor = el.status === "healthy" ? "#2dd4bf" : "#fda4af";
                    emoji = "📥";
                  } else if (el.type === "solar") {
                    fillColor = "#78350f";
                    strokeColor = "#fbbf24";
                    emoji = "☀️";
                  } else if (el.type === "lightpole") {
                    fillColor = "#0f172a";
                    strokeColor = "#eab308";
                    emoji = "💡";
                  } else if (el.type === "fire") {
                    fillColor = el.status === "healthy" ? "#991b1b" : "#7f1d1d";
                    strokeColor = "#f87171";
                    emoji = "🧯";
                  }

                  return (
                    <g key={el.id} className="cursor-pointer group">
                      <circle 
                        cx={el.x} 
                        cy={el.y} 
                        r="18" 
                        fill={fillColor} 
                        stroke={strokeColor} 
                        strokeWidth="1.5" 
                      />
                      <text 
                        x={el.x} 
                        y={el.y + 4} 
                        textAnchor="middle" 
                        fontSize="12"
                      >
                        {emoji}
                      </text>
                      
                      {/* Subtitle label */}
                      <text 
                        x={el.x} 
                        y={el.y + 28} 
                        textAnchor="middle" 
                        fill="#94a3b8" 
                        fontSize="7.5"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {el.label}
                      </text>

                      {/* Tooltip on hover */}
                      <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <rect 
                          x={el.x - 60} 
                          y={el.y - 45} 
                          width="120" 
                          height="20" 
                          fill="#020617" 
                          rx="4" 
                          stroke="#334155" 
                          strokeWidth="1"
                        />
                        <text 
                          x={el.x} 
                          y={el.y - 32} 
                          textAnchor="middle" 
                          fill="#f8fafc" 
                          fontSize="7.5"
                          fontFamily="sans-serif"
                        >
                          {el.label} - {el.status === "healthy" ? (isAr ? "مطابق وآمن" : "Safe & Compliant") : (isAr ? "انتبه! خلل المعيار" : "Alert: Out of Specs")}
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* Central Pathway reference label */}
                <text 
                  x="450" 
                  y="20" 
                  textAnchor="end" 
                  fill="#475569" 
                  fontSize="8" 
                  fontFamily="monospace"
                >
                  {isAr ? "مقياس الرسم: تخطيطي" : "Scale: Schematic Overview"}
                </text>
              </svg>

            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
};
