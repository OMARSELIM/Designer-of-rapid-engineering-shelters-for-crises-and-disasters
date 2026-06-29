import React, { useState, useEffect, useRef } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  Zap,
  Droplets,
  Trash2,
  Cpu,
  Sun,
  Moon,
  Battery,
  Wind,
  Settings,
  ShieldCheck,
  TrendingUp,
  Activity
} from "lucide-react";

interface SmartCityMetricsProps {
  peopleCount: number;
  totalUnits: number;
  lang: "ar" | "en";
}

export const SmartCityMetrics: React.FC<SmartCityMetricsProps> = ({
  peopleCount,
  totalUnits,
  lang
}) => {
  // Simulator state controls
  const [timeOfDay, setTimeOfDay] = useState<number>(12); // Hour 0-23
  const [aiOptimization, setAiOptimization] = useState<boolean>(true);
  const [weatherCondition, setWeatherCondition] = useState<"sunny" | "cloudy_storm">("sunny");
  
  // Real-time ticking baseline
  const [tick, setTick] = useState<number>(0);
  const [historicalEnergy, setHistoricalEnergy] = useState<any[]>([]);
  const [historicalWater, setHistoricalWater] = useState<any[]>([]);
  const [wasteDistribution, setWasteDistribution] = useState<any[]>([]);

  // Calculate base needs depending on inputs
  const pop = peopleCount || 500;
  const baseWaterDemand = pop * 15; // 15L per person per day standard
  const basePowerLoad = totalUnits * 0.45; // 0.45kW per unit standard

  // Generate historical or live ticking data
  useEffect(() => {
    // Generate initial 7-hour history
    const energyData = [];
    const waterData = [];
    
    for (let i = 6; i >= 0; i--) {
      const h = (timeOfDay - i + 24) % 24;
      const metrics = calculateMetricsForHour(h, weatherCondition, aiOptimization);
      energyData.push({
        time: `${String(h).padStart(2, "0")}:00`,
        generation: parseFloat(metrics.solarGen.toFixed(1)),
        load: parseFloat(metrics.powerLoad.toFixed(1)),
        battery: parseFloat(metrics.batterySoc.toFixed(1)),
      });

      waterData.push({
        time: `${String(h).padStart(2, "0")}:00`,
        demand: parseFloat(metrics.waterDemand.toFixed(0)),
        recycled: parseFloat(metrics.waterRecycled.toFixed(0)),
        conservation: parseFloat(metrics.waterSaved.toFixed(0)),
      });
    }
    
    setHistoricalEnergy(energyData);
    setHistoricalWater(waterData);

    // Waste distribution static proportions with slight noise
    const noise = (Math.random() - 0.5) * 5;
    const organic = Math.max(10, parseFloat((pop * 0.22 + noise).toFixed(1)));
    const plastic = Math.max(5, parseFloat((pop * 0.08 + noise * 0.3).toFixed(1)));
    const paper = Math.max(5, parseFloat((pop * 0.06 + noise * 0.2).toFixed(1)));
    const metals = Math.max(2, parseFloat((pop * 0.04 + noise * 0.1).toFixed(1)));
    
    setWasteDistribution([
      { name: lang === "ar" ? "نفايات عضوية (غاز حيوي)" : "Organic (Bio-Gas)", value: organic, color: "#10b981" },
      { name: lang === "ar" ? "بلاستيك ومواد قابلة للتدوير" : "Recyclable Plastics", value: plastic, color: "#3b82f6" },
      { name: lang === "ar" ? "ورق كرتون سليلوز" : "Paper & Cellulose", value: paper, color: "#f59e0b" },
      { name: lang === "ar" ? "معادن وألمنيوم معاد تدويرها" : "Metals & Aluminum", value: metals, color: "#8b5cf6" },
    ]);
  }, [timeOfDay, weatherCondition, aiOptimization, lang, pop]);

  // Live simulation tick every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((prev) => prev + 1);
      setTimeOfDay((prevHour) => (prevHour + 1) % 24);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  // Helper calculation logic
  function calculateMetricsForHour(h: number, weather: "sunny" | "cloudy_storm", ai: boolean) {
    // Solar pattern based on hour of day
    let solarBase = 0;
    if (h >= 6 && h <= 18) {
      // Sine wave peak at noon (12:00)
      const angle = ((h - 6) / 12) * Math.PI;
      solarBase = Math.sin(angle) * (basePowerLoad * 1.8);
    }

    if (weather === "cloudy_storm") {
      solarBase *= 0.2; // 80% drop in solar
    }

    // AI Optimization increases efficiency of solar captures slightly (+10%)
    if (ai) {
      solarBase *= 1.1;
    }

    // Power load curve (higher in evening 18:00 - 22:00, and morning 7:00 - 9:00)
    let loadFactor = 0.6;
    if (h >= 18 && h <= 22) {
      loadFactor = 1.4;
    } else if (h >= 7 && h <= 9) {
      loadFactor = 1.1;
    }
    let powerLoad = basePowerLoad * loadFactor;

    // AI efficiency optimization reduces load by 20%
    if (ai) {
      powerLoad *= 0.8;
    }

    // Battery SOC simulation
    // If generation > load, battery charges. If gen < load, battery drains.
    let batterySoc = 75; // Baseline
    if (solarBase > powerLoad) {
      batterySoc = Math.min(100, 75 + (solarBase - powerLoad) * 10);
    } else {
      batterySoc = Math.max(15, 75 - (powerLoad - solarBase) * 8);
    }

    // Water demand curve (peaks at 8:00, 13:00, 20:00)
    let waterFactor = 0.7;
    if (h === 8 || h === 13 || h === 20) {
      waterFactor = 1.5;
    } else if (h >= 23 || h <= 5) {
      waterFactor = 0.3;
    }
    const waterDemand = baseWaterDemand * waterFactor;

    // Greywater recycled
    let recyclingEfficiency = ai ? 0.82 : 0.65; // 82% vs 65% recycling with smart filtration
    const waterRecycled = waterDemand * recyclingEfficiency;
    const waterSaved = waterDemand - (waterDemand * (1 - recyclingEfficiency));

    return {
      solarGen: solarBase,
      powerLoad,
      batterySoc,
      waterDemand,
      waterRecycled,
      waterSaved
    };
  }

  // Current real-time indicators
  const currentMetrics = calculateMetricsForHour(timeOfDay, weatherCondition, aiOptimization);
  const totalRecycledWastePercent = aiOptimization ? 94 : 72;

  return (
    <div className="flex flex-col gap-6" id="smart-city-metrics-panel">
      {/* Simulation Master Controller Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-black text-emerald-400 tracking-wider uppercase font-mono">
                {lang === "ar" ? "نظام المحاكاة والتحليلات الفورية" : "LIVE IOT METRICS SIMULATOR"}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-tight">
              {lang === "ar" ? "لوحة المراقبة الذكية لشبكات البنية التحتية" : "Smart Grid Control & Performance Hub"}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-normal">
              {lang === "ar"
                ? "شاشة مراقبة تفاعلية موصلة بشبكة مستشعرات إنترنت الأشياء (IoT) لقياس وتتبع كفاءة الطاقة المتجددة، تدوير المياه، والتحول الكامل للاقتصاد الدائري في الوقت الفعلي."
                : "Interactive dashboard bound to virtual IoT sensors. Monitor clean microgrid dispatch, smart greywater recovery loops, and zero-waste circular sorting mechanisms."}
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700/60 font-mono">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <div className="text-right">
              <span className="text-[9px] text-slate-400 block font-semibold leading-none">{lang === "ar" ? "التوقيت الافتراضي" : "SIM TIME"}</span>
              <span className="text-xs font-bold text-white block mt-1">
                {String(timeOfDay).padStart(2, "0")}:00 {timeOfDay >= 12 ? "PM" : "AM"}
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 border-t border-slate-800 pt-5 relative z-10">
          
          {/* Day / Night Slider */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 flex flex-col justify-between gap-2">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                {timeOfDay >= 6 && timeOfDay <= 18 ? (
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                )}
                {lang === "ar" ? "دورة اليوم والليلة" : "Day / Night Cycle"}
              </span>
              <span className="text-[10px] text-slate-400 font-mono font-bold bg-slate-800 px-1.5 py-0.5 rounded">
                {timeOfDay}:00
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="23"
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(parseInt(e.target.value))}
              className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer mt-2"
            />
            <span className="text-[9px] text-slate-500 text-right mt-1 font-mono">
              {lang === "ar" ? "اسحب لتقديم الوقت يدوياً" : "Slide to change virtual hour"}
            </span>
          </div>

          {/* AI Optimization Mode */}
          <button
            onClick={() => setAiOptimization(!aiOptimization)}
            className={`p-3.5 rounded-xl border transition-all text-right flex flex-col justify-between gap-1.5 cursor-pointer ${
              aiOptimization
                ? "bg-emerald-950/40 border-emerald-500/40 hover:bg-emerald-950/60 text-emerald-300"
                : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/60 text-slate-400"
            }`}
          >
            <div className="flex justify-between items-center w-full">
              <span className="text-[11px] font-bold flex items-center gap-1.5">
                <Cpu className={`w-3.5 h-3.5 ${aiOptimization ? "text-emerald-400" : "text-slate-500"}`} />
                {lang === "ar" ? "تحسين الشبكة بالذكاء الاصطناعي" : "AI Grid Optimization"}
              </span>
              <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                aiOptimization ? "bg-emerald-500 text-emerald-950" : "bg-slate-800 text-slate-500"
              }`}>
                {aiOptimization ? (lang === "ar" ? "نشط" : "ACTIVE") : (lang === "ar" ? "معطل" : "OFF")}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 text-justify leading-relaxed mt-1">
              {lang === "ar"
                ? "تقوم الحساسات بخفض استهلاك شبكة الإضاءة وضبط ضغط ضخ المياه أوتوماتيكياً لتوفير 20% من التكاليف."
                : "IoT sensor arrays programmatically balance microgrid load and throttle pump speeds to secure up to 20% load saving."}
            </p>
          </button>

          {/* Weather Simulator */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 flex flex-col justify-between gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-indigo-400" />
              {lang === "ar" ? "محاكي الطقس والمناخ" : "Weather & Climate Simulation"}
            </span>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => setWeatherCondition("sunny")}
                className={`py-1.5 text-[10px] font-black rounded-lg transition-all ${
                  weatherCondition === "sunny"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-800/50 text-slate-400 hover:bg-slate-800"
                }`}
              >
                ☀️ {lang === "ar" ? "مشمس" : "Sunny"}
              </button>
              <button
                onClick={() => setWeatherCondition("cloudy_storm")}
                className={`py-1.5 text-[10px] font-black rounded-lg transition-all ${
                  weatherCondition === "cloudy_storm"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-800/50 text-slate-400 hover:bg-slate-800"
                }`}
              >
                ⛈️ {lang === "ar" ? "غائم / عاصف" : "Cloudy / Storm"}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Top Level KPIs Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Real-time Water Recycled */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-3xs flex flex-col justify-between">
          <div className="flex justify-between items-start gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
              {lang === "ar" ? "كفاءة تدوير المياه" : "WATER RECYCLING EFFICIENCY"}
            </span>
            <div className="p-1 rounded-md bg-blue-50 text-blue-600">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-right">
            <span className="text-base font-black text-slate-800 font-mono block">
              {(aiOptimization ? 82 : 65)}%
            </span>
            <p className="text-[9px] text-slate-400 mt-0.5 font-bold">
              {lang === "ar"
                ? `استرداد: ${currentMetrics.waterRecycled.toFixed(0)} لتر / ساعة`
                : `Recovered: ${currentMetrics.waterRecycled.toFixed(0)} L/hour`}
            </p>
          </div>
        </div>

        {/* KPI 2: Solar Generation */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-3xs flex flex-col justify-between">
          <div className="flex justify-between items-start gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
              {lang === "ar" ? "توليد الطاقة الشمسية" : "SOLAR GENERATION"}
            </span>
            <div className="p-1 rounded-md bg-amber-50 text-amber-600">
              <Sun className="w-4 h-4 animate-spin-slow" />
            </div>
          </div>
          <div className="mt-2 text-right">
            <span className="text-base font-black text-slate-800 font-mono block">
              {currentMetrics.solarGen.toFixed(2)} kW
            </span>
            <p className="text-[9px] text-slate-400 mt-0.5 font-bold">
              {weatherCondition === "sunny"
                ? (lang === "ar" ? "إشعاع شمسي مثالي" : "Peak Solar Irradiation")
                : (lang === "ar" ? "تأثر بالغيوم (تراجع 80%)" : "Cloud Coverage (-80%)")}
            </p>
          </div>
        </div>

        {/* KPI 3: Microgrid Battery Level */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-3xs flex flex-col justify-between">
          <div className="flex justify-between items-start gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
              {lang === "ar" ? "مخزون ميكروجريد البطارية" : "MICROGRID BATTERY STATE"}
            </span>
            <div className="p-1 rounded-md bg-indigo-50 text-indigo-600">
              <Battery className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-right">
            <span className="text-base font-black text-slate-800 font-mono block">
              {currentMetrics.batterySoc.toFixed(1)}%
            </span>
            <p className="text-[9px] text-slate-400 mt-0.5 font-bold">
              {currentMetrics.batterySoc > 30 ? (
                <span className="text-emerald-600 font-bold">✓ {lang === "ar" ? "مخزون آمن ومستقر" : "Secure Reserve"}</span>
              ) : (
                <span className="text-amber-500 font-bold">⚠️ {lang === "ar" ? "انخفاض المخزون (تفريغ)" : "Low (Discharging)"}</span>
              )}
            </p>
          </div>
        </div>

        {/* KPI 4: Circular Waste Index */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-3xs flex flex-col justify-between">
          <div className="flex justify-between items-start gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
              {lang === "ar" ? "معدل صفر نفايات" : "CIRCULAR RECOVERY INDEX"}
            </span>
            <div className="p-1 rounded-md bg-purple-50 text-purple-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-right">
            <span className="text-base font-black text-slate-800 font-mono block">
              {totalRecycledWastePercent}%
            </span>
            <p className="text-[9px] text-slate-400 mt-0.5 font-bold">
              {lang === "ar"
                ? `فرز آلي: ${pop * 0.4} كجم / يوم`
                : `Auto-Sorted: ${(pop * 0.4).toFixed(0)} kg/day`}
            </p>
          </div>
        </div>
      </div>

      {/* Recharts Data Visualization Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Microgrid Energy Flow */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Zap className="w-5 h-5" />
              </div>
              <div className="text-right">
                <h4 className="font-extrabold text-slate-800 text-sm">
                  {lang === "ar" ? "توليد الطاقة الشمسية مقابل الحمل الشبكي" : "Solar Generation vs. Grid Load Demand"}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {lang === "ar" ? "مراقبة التوليد المباشر والاستهلاك الموزع وإمداد البطارية الذاتي." : "Monitor solar microgrid generation, active load, and battery storage buffer."}
                </p>
              </div>
            </div>
          </div>
          
          <div className="w-full h-[250px] font-mono text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalEnergy} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="loadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" unit="kW" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "12px", color: "#fff" }} 
                  labelStyle={{ fontWeight: "bold", color: "#94a3b8" }}
                />
                <Legend iconType="circle" />
                <Area 
                  type="monotone" 
                  dataKey="generation" 
                  stroke="#f59e0b" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#solarGrad)" 
                  name={lang === "ar" ? "توليد الخلايا الشمسية (kW)" : "Solar Micro-Generation (kW)"} 
                />
                <Area 
                  type="monotone" 
                  dataKey="load" 
                  stroke="#6366f1" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#loadGrad)" 
                  name={lang === "ar" ? "الحمل الكهربائي المطلوب (kW)" : "Grid Load Demand (kW)"} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Smart Greywater Loop */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Droplets className="w-5 h-5" />
              </div>
              <div className="text-right">
                <h4 className="font-extrabold text-slate-800 text-sm">
                  {lang === "ar" ? "شبكة إمداد المياه وتدوير المياه الرمادية" : "Water Consumption & Greywater Recycling"}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {lang === "ar" ? "تحليل الكفاءة لتدوير وترشيد المياه في الوحدات وحقول المزارع البيئية." : "Water flow efficiency tracking across residential, sanitization, and eco-parks."}
                </p>
              </div>
            </div>
          </div>

          <div className="w-full h-[250px] font-mono text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historicalWater} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" unit=" L" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "12px", color: "#fff" }}
                  labelStyle={{ fontWeight: "bold", color: "#94a3b8" }}
                />
                <Legend iconType="circle" />
                <Bar 
                  dataKey="demand" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]} 
                  name={lang === "ar" ? "إجمالي استهلاك المياه (لتر)" : "Total Water Intake (Liters)"} 
                />
                <Bar 
                  dataKey="recycled" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]} 
                  name={lang === "ar" ? "المياه الرمادية المستردة (لتر)" : "Recycled Greywater (Liters)"} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Zero-Waste Circular Economy Proportions */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="text-right">
                <h4 className="font-extrabold text-slate-800 text-sm">
                  {lang === "ar" ? "فرز النفايات الصلبة والاقتصاد الدائري" : "Solid Waste Sorting & Circular Sourcing"}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {lang === "ar" ? "معدلات الفرز التلقائي في الموقع لإنتاج الأسمدة وغاز الميثان الحيوي للمطابخ المشتركة." : "Real-time municipal waste sorting for organic composting and bio-methane gas production."}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="w-full h-[180px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={wasteDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {wasteDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "12px", color: "#fff", fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col gap-2.5">
              {wasteDistribution.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs border-b border-slate-50 pb-1.5 last:border-none">
                  <div className="flex items-center gap-2 text-right">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 font-bold">{item.name}</span>
                  </div>
                  <span className="font-mono text-slate-800 font-extrabold">{item.value} {lang === "ar" ? "كجم" : "kg"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 4: Grid Efficiency Analytics Panel */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-2xl border border-indigo-950/40 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="bg-indigo-500/20 text-indigo-300 font-mono text-[9px] font-black px-2 py-0.5 rounded-md border border-indigo-500/30">
                AI COGNITIVE COMPLIANCE
              </span>
              <span className="text-xs text-indigo-400 font-mono flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                {lang === "ar" ? "تحليل الكفاءة المتكاملة" : "Combined Efficiency"}
              </span>
            </div>
            <h4 className="text-sm font-black tracking-tight text-white">
              {lang === "ar" ? "تأثير إدارة إنترنت الأشياء والشبكة المستدامة" : "Net Environmental Impact & IoT Benefits"}
            </h4>
            <p className="text-[11px] text-slate-300 leading-normal mt-2 text-justify">
              {lang === "ar"
                ? "بتفعيل شبكة الميكروجريد الذكية مع ترشيد الاستهلاك الفوري بالذكاء الاصطناعي، يتم تقليل الانبعاثات بنسبة إجمالية تبلغ 35% وتفادي هدر المياه العذبة بالكامل عبر الحلقة المغلقة لإعادة معالجة المياه الرمادية والصرف الصحي الآمن."
                : "By locking greywater loops and optimizing solar microgrid dispatch via AI edge compute, this temporary shelter City architecture achieves a net 35% carbon reduction over standard diesel setups while completely preventing regional water depletion."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-slate-950/40 p-3 rounded-xl border border-indigo-500/10">
              <span className="text-[9px] text-indigo-300 block font-bold uppercase">{lang === "ar" ? "خفض الطاقة المهدورة" : "AVOIDED ENERGY LOSS"}</span>
              <span className="text-sm font-extrabold text-white font-mono block mt-1">
                {(basePowerLoad * 0.25).toFixed(2)} kW/h
              </span>
            </div>
            <div className="bg-slate-950/40 p-3 rounded-xl border border-indigo-500/10">
              <span className="text-[9px] text-indigo-300 block font-bold uppercase">{lang === "ar" ? "إجمالي المياه الموفرة" : "NET WATER SAVED"}</span>
              <span className="text-sm font-extrabold text-emerald-400 font-mono block mt-1 font-bold">
                {currentMetrics.waterSaved.toFixed(0)} {lang === "ar" ? "لتر / ساعة" : "L/hour"}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
