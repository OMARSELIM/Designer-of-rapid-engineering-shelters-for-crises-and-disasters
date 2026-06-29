import React, { useState, useEffect } from "react";
import {
  Truck,
  Package,
  Users,
  Fuel,
  Clock,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Info,
  MapPin,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Settings
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

interface LogisticsViewProps {
  totalUnits: number;
  peopleCount: number;
  lang: "ar" | "en";
  designType?: "camp" | "smart_city";
  locationName?: string;
  disasterType?: string;
}

export const LogisticsView: React.FC<LogisticsViewProps> = ({
  totalUnits = 12,
  peopleCount = 60,
  lang = "ar",
  designType = "camp",
  locationName = "",
  disasterType = ""
}) => {
  const isAr = lang === "ar";
  const units = totalUnits || 12;

  // INTERACTIVE PARAMETERS State
  const [distance, setDistance] = useState<number>(250); // in km
  const [roadCondition, setRoadCondition] = useState<"paved" | "offroad" | "highrisk">("paved");
  const [truckType, setTruckType] = useState<"small" | "medium" | "large">("medium");
  const [workerCount, setWorkerCount] = useState<number>(Math.max(6, Math.ceil(units * 0.5))); // number of workers

  // Recalculations on parameter change
  // 1. Containers and cargo weight
  // Basic unit weight: 1.5 tons (camp shelter) or 4.5 tons (smart city sector)
  const unitWeightTons = designType === "smart_city" ? 4.8 : 1.6;
  const totalCargoWeight = units * unitWeightTons;

  // Number of 20ft / 40ft containers equivalent
  // Say, 1 40ft container fits 6 basic shelters, or 1.5 smart city modules
  const unitsPerContainer = designType === "smart_city" ? 2 : 6;
  const containerCount = Math.ceil(units / unitsPerContainer);

  // Truck capacity (Tons)
  const truckCapacity = truckType === "small" ? 5 : truckType === "medium" ? 12 : 24;
  // Calculate trucks needed based on cargo weight and capacity
  const trucksNeeded = Math.ceil(totalCargoWeight / truckCapacity);

  // Average speeds based on road conditions (km/h)
  const averageSpeed = roadCondition === "paved" ? 75 : roadCondition === "offroad" ? 40 : 30;

  // Fuel rate per truck (Liters/km)
  let fuelRate = truckType === "small" ? 0.22 : truckType === "medium" ? 0.35 : 0.48;
  if (roadCondition === "offroad") fuelRate *= 1.4; // 40% more fuel on bad roads
  if (roadCondition === "highrisk") fuelRate *= 1.25; // 25% buffer for erratic speed in high-risk zones

  // Total Fuel (Liters) for roundtrip for all trucks
  const totalFuelLiters = Math.ceil(trucksNeeded * (distance * 2) * fuelRate);

  // Transport Hours (one way)
  const transitTimeOneWayHours = parseFloat((distance / averageSpeed).toFixed(1));
  const transitTimeRoundtripHours = parseFloat((transitTimeOneWayHours * 2).toFixed(1));
  // Total convoy transit time including loading/unloading buffer
  const loadingBufferHours = 4; // 4 hours loading/unloading
  const totalTransportDurationHours = parseFloat((transitTimeRoundtripHours + loadingBufferHours).toFixed(1));

  // Assembly speed: Basic unit takes ~12 man-hours to fully assemble (or 45 for smart city sector)
  const manHoursPerUnit = designType === "smart_city" ? 48 : 12;
  const totalManHoursNeeded = units * manHoursPerUnit;
  // Installation days assuming 8 working hours per day for the workers
  const activeWorkers = workerCount;
  const totalInstallationDays = Math.ceil(totalManHoursNeeded / (activeWorkers * 8));

  // Fuel Price assumption (USD per liter)
  const fuelPricePerLiter = 1.2;
  const totalFuelCost = totalFuelLiters * fuelPricePerLiter;

  // Dynamic charts: Transit time vs Distance curve
  const chartDistanceCurve = [50, 150, 250, 400, 600, 800, 1000].map((d) => {
    const time = parseFloat(((d / averageSpeed) * 2 + loadingBufferHours).toFixed(1));
    const fuel = Math.ceil(trucksNeeded * (d * 2) * fuelRate);
    return {
      dist: `${d} km`,
      time,
      fuel
    };
  });

  return (
    <div className="flex flex-col gap-6" id="logistics-supply-chain-panel">
      {/* Header Banner Card */}
      <div className="bg-gradient-to-r from-slate-800 to-indigo-950 text-white rounded-2xl p-5 border border-slate-700 shadow-xl relative overflow-hidden">
        {/* Background ambient light */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-indigo-500 text-[10px] font-black tracking-wider px-2 py-0.5 rounded uppercase font-mono">
                {isAr ? "نظام إدارة الإمداد المتقدم" : "ADVANCED LOGISTICS ENGINE"}
              </span>
              <span className="text-[10px] text-indigo-300 font-mono font-bold">
                v2.4
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black tracking-tight">
              {isAr ? "حساب وتحليل سلسلة الإمداد والخدمات اللوجستية" : "Logistics & Supply Chain Planner"}
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-normal">
              {isAr
                ? "تخطيط شحن الملاجئ السريعة والمواد الإغاثية من المستودعات المركزية إلى الميدان. قم بتغيير معايير الطريق والشاحنات والعمال لحساب الاحتياجات اللوجستية الدقيقة فوراً."
                : "Plan transport convonys and assembly operations from central depots to site. Adjust roads, truck classes, and workforce to instantly recalculate resource requirements."}
            </p>
          </div>
        </div>
      </div>

      {/* Main Interactive Workboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sidebar Controls (Interactive Parameters) */}
        <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl flex flex-col gap-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
              {isAr ? "لوحة التحكم بالمعايير اللوجستية" : "Logistics Parameter Controls"}
            </h4>
          </div>

          {/* Slider: Distance */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                {isAr ? "المسافة إلى موقع الكارثة:" : "Distance to Disaster Site:"}
              </span>
              <span className="font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                {distance} {isAr ? "كم" : "km"}
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="1000"
              step="10"
              value={distance}
              onChange={(e) => setDistance(parseInt(e.target.value))}
              className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-mono">
              <span>10 km</span>
              <span>500 km</span>
              <span>1000 km</span>
            </div>
          </div>

          {/* Dropdown: Road Condition */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" />
              {isAr ? "حالة الطرق والمخاطر الأمنية:" : "Road Security & Safety Status:"}
            </label>
            <select
              value={roadCondition}
              onChange={(e) => setRoadCondition(e.target.value as any)}
              className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="paved">🛣️ {isAr ? "طرق معبدة وسريعة آمنة (75 كم/س)" : "Paved Highways / Secure (75 km/h)"}</option>
              <option value="offroad">⛰️ {isAr ? "طرق وعرة وجبلية مدمّرة (40 كم/س)" : "Off-road / Rugged Terrain (40 km/h)"}</option>
              <option value="highrisk">⚠️ {isAr ? "منطقة نزاع / مخاطر أمنية مرتفعة (30 كم/س)" : "Active Conflict Zone / High Risk (30 km/h)"}</option>
            </select>
          </div>

          {/* Dropdown: Truck Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-indigo-500" />
              {isAr ? "فئة وحمولة شاحنات النقل الداخلي:" : "Transport Truck Payload Class:"}
            </label>
            <select
              value={truckType}
              onChange={(e) => setTruckType(e.target.value as any)}
              className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="small">🚛 {isAr ? "شاحنة صغيرة 5 طن (قوالب مدمجة)" : "Light Utility Truck 5-Ton capacity"}</option>
              <option value="medium">🚚 {isAr ? "شاحنة متوسطة 12 طن (قياسية)" : "Medium Cargo Truck 12-Ton capacity"}</option>
              <option value="large">🚛 {isAr ? "مقطورة ثقيلة / حاوية 24 طن" : "Heavy Semi-Trailer 24-Ton capacity"}</option>
            </select>
          </div>

          {/* Slider: Workers Count */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                {isAr ? "عدد عمال التركيب والتركيب بالموقع:" : "On-site Installation Workers:"}
              </span>
              <span className="font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                {workerCount} {isAr ? "عامل" : "workers"}
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="150"
              step="1"
              value={workerCount}
              onChange={(e) => setWorkerCount(parseInt(e.target.value))}
              className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-mono">
              <span>2</span>
              <span>75</span>
              <span>150</span>
            </div>
          </div>

          {/* Logistics Warning Box depending on Risk state */}
          {roadCondition === "highrisk" && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex gap-2.5 items-start">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
              <p className="text-[10px] text-rose-700 leading-normal">
                {isAr
                  ? "تحذير: عبور منطقة نزاع يتطلب تسيير قوافل عسكرية وحواجز دروع إضافية. تم خفض السرعة وزيادة استهلاك الوقود لتأمين المناورة."
                  : "Attention: Moving through conflict zones requires armed escort & dynamic routing. Transit speed throttled; fuel consumption padded by +25%."}
              </p>
            </div>
          )}

          {roadCondition === "offroad" && (
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex gap-2.5 items-start">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-700 leading-normal">
                {isAr
                  ? "ملاحظة: الطرق الوعرة والجسور المتضررة تضاعف زمن النقل. نوصي بالشاحنات الكبيرة المزودة بنظام دفع رباعي لتجاوز المنحدرات."
                  : "Notice: Ruined bridges or mountain passes will double the transport fatigue. Heavy all-terrain chassis recommended."}
              </p>
            </div>
          )}
        </div>

        {/* Dashboard Results (Main Panel) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Output KPIs Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            
            {/* KPI 1: Trucks */}
            <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs flex flex-col justify-between hover:border-indigo-100 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  {isAr ? "عدد الشاحنات المطلوبة" : "TRUCKS REQUIRED"}
                </span>
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <Truck className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 text-right">
                <span className="text-xl font-black text-slate-800 font-mono block">
                  {trucksNeeded} {isAr ? "شاحنات" : "Trucks"}
                </span>
                <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
                  {isAr ? `إجمالي الوزن: ${totalCargoWeight.toFixed(1)} طن` : `Total Cargo: ${totalCargoWeight.toFixed(1)} Tons`}
                </span>
              </div>
            </div>

            {/* KPI 2: Containers */}
            <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs flex flex-col justify-between hover:border-indigo-100 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  {isAr ? "الحاويات المكافئة" : "EQUIVALENT CONTAINERS"}
                </span>
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 text-right">
                <span className="text-xl font-black text-slate-800 font-mono block">
                  {containerCount} {isAr ? "حاويات 40 قدم" : "TEU/40ft Containers"}
                </span>
                <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
                  {isAr ? `تعبئة مسطحة سريعة` : `Optimized flat-pack loading`}
                </span>
              </div>
            </div>

            {/* KPI 3: Installation workers */}
            <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs flex flex-col justify-between hover:border-indigo-100 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  {isAr ? "العمال المطلوبون" : "INSTALLATION CREW"}
                </span>
                <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 text-right">
                <span className="text-xl font-black text-slate-800 font-mono block">
                  {activeWorkers} {isAr ? "فني تركيب" : "Workers"}
                </span>
                <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
                  {isAr ? `سرعة تركيب الوحدات` : `Rapid deployment speed`}
                </span>
              </div>
            </div>

            {/* KPI 4: Fuel Needed */}
            <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs flex flex-col justify-between hover:border-indigo-100 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  {isAr ? "الوقود المطلوب" : "DIESEL FUEL REQUIRED"}
                </span>
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <Fuel className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 text-right">
                <span className="text-xl font-black text-slate-800 font-mono block">
                  {totalFuelLiters} {isAr ? "لتر" : "Liters"}
                </span>
                <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
                  {isAr ? `التكلفة التقديرية: $${totalFuelCost.toLocaleString()}` : `Estimated Cost: $${totalFuelCost.toLocaleString()}`}
                </span>
              </div>
            </div>

            {/* KPI 5: Transport time */}
            <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs flex flex-col justify-between hover:border-indigo-100 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  {isAr ? "إجمالي زمن النقل" : "TOTAL TRANSIT DURATION"}
                </span>
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 text-right">
                <span className="text-xl font-black text-slate-800 font-mono block">
                  {totalTransportDurationHours} {isAr ? "ساعة" : "Hours"}
                </span>
                <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
                  {isAr ? `ذهاباً وإياباً شامل التعبئة` : `Roundtrip with loading buffer`}
                </span>
              </div>
            </div>

            {/* KPI 6: Execution days */}
            <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs flex flex-col justify-between hover:border-indigo-100 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  {isAr ? "مدة التنفيذ والتركيب" : "TOTAL ASSEMBLY DAYS"}
                </span>
                <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 text-right">
                <span className="text-xl font-black text-slate-800 font-mono block">
                  {totalInstallationDays} {isAr ? "أيام تنفيذ" : "Days"}
                </span>
                <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
                  {isAr ? `بمعدل 8 ساعات يومياً` : `Based on 8h work shift/day`}
                </span>
              </div>
            </div>

          </div>

          {/* Transport Curve Recharts Chart */}
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <h4 className="font-extrabold text-slate-800 text-sm">
                    {isAr ? "منحنى الوقود والزمن حسب المسافة البرية" : "Supply Chain Scaling Curve vs Distance"}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {isAr ? "مراقبة تناسب استهلاك وقود القافلة باللتر وزمن الوصول بالساعة بناء على المسافات المرجعية." : "Correlate transport fuel liters and total roundtrip hours against distance segments."}
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full h-[180px] font-mono text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartDistanceCurve} margin={{ top: 5, right: 15, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="timeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="fuelGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="dist" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "12px", color: "#fff" }} />
                  <Legend iconType="circle" />
                  <Area type="monotone" dataKey="time" stroke="#3b82f6" strokeWidth={2} fill="url(#timeGrad)" name={isAr ? "زمن الدورة اللوجستية (ساعة)" : "Roundtrip Duration (hours)"} />
                  <Area type="monotone" dataKey="fuel" stroke="#f59e0b" strokeWidth={2} fill="url(#fuelGrad)" name={isAr ? "استهلاك القافلة (لتر)" : "Convoy Fuel (Liters)"} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>

      {/* Logistics & Assembly Phases Flow */}
      <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-50">
          <Layers className="w-5 h-5 text-indigo-600" />
          <div className="text-right">
            <h4 className="font-extrabold text-slate-800 text-sm">
              {isAr ? "خطوات ومراحل تنفيذ سلسلة الإمداد" : "End-to-End Logistics & Assembly Phases"}
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {isAr
                ? "تتبع مراحل نقل وتثبيت وإسكان الأسر خطوة بخطوة بطرق هندسية وعملية متكاملة."
                : "Step-by-step trace of materials sourcing, shipping routing, onsite erection, and family housing."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Phase 1 */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between relative">
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-mono">PHASE 01</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <h5 className="font-bold text-slate-800 text-xs mb-1.5">
                {isAr ? "تأمين المكونات والتعبئة" : "Sourcing & Flat-Packing"}
              </h5>
              <p className="text-[10px] text-slate-500 leading-normal text-justify">
                {isAr
                  ? "تجميع ألواح العزل المركبة الجاهزة في المستودع المركزي، ورزم الإطارات الفولاذية في حزم تعبئة مسطحة متناسقة لتقليل مساحة الشحن بنسبة 60%."
                  : "Gather thermal sandwich panels and bolt kits in depot. Arrange components into flat-packed stacks to condense transport volume by 60%."}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/50 flex justify-between items-center text-[10px] font-mono text-slate-400">
              <span>{isAr ? "الحجم:" : "Vol:"} {containerCount * 45} m³</span>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
            </div>
          </div>

          {/* Phase 2 */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between relative">
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-mono">PHASE 02</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <h5 className="font-bold text-slate-800 text-xs mb-1.5">
                {isAr ? "العبور وتسيير القافلة" : "Convoy Dispatch & Transit"}
              </h5>
              <p className="text-[10px] text-slate-500 leading-normal text-justify">
                {isAr
                  ? `تسيير عدد ${trucksNeeded} شاحنات على دفعات برية متزامنة باتجاه الكارثة. يبلغ زمن النقل الفعلي للموقع ${transitTimeOneWayHours} ساعات لرحلة الذهاب.`
                  : `Dispatch ${trucksNeeded} cargo units on coordinated delivery runs. Effective one-way transit duration takes ${transitTimeOneWayHours} hours.`}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/50 flex justify-between items-center text-[10px] font-mono text-slate-400">
              <span>{isAr ? "المسافة:" : "Dist:"} {distance} km</span>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
            </div>
          </div>

          {/* Phase 3 */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between relative">
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-mono">PHASE 03</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <h5 className="font-bold text-slate-800 text-xs mb-1.5">
                {isAr ? "تفريغ وتجهيز الموقع" : "Unloading & Layout Prep"}
              </h5>
              <p className="text-[10px] text-slate-500 leading-normal text-justify">
                {isAr
                  ? "تفريغ الحاويات في مساحة التخزين المؤقت الميدانية، وتخطيط أوتاد القياس الهندسي بمساعدة المساحين، وصب الأساسات العائمة أو تثبيت الأوتاد الأرضية."
                  : "Offload materials at designated staging grids. Run high-precision geodetic layout marking and drop foundation blocks on gravel beds."}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/50 flex justify-between items-center text-[10px] font-mono text-slate-400">
              <span>{isAr ? "المدة:" : "Duration:"} 1-2 {isAr ? "أيام" : "Days"}</span>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
            </div>
          </div>

          {/* Phase 4 */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between relative">
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-mono">PHASE 04</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <h5 className="font-bold text-slate-800 text-xs mb-1.5">
                {isAr ? "تركيب الهيكل والتسليم" : "Erection & Handover"}
              </h5>
              <p className="text-[10px] text-slate-500 leading-normal text-justify">
                {isAr
                  ? `تركيب وتثبيت الجدران والأسقف العازلة بالمسامير والمشدات، وتجهيز المرافق لخدمة المأوى بالكامل. يستغرق التسليم النهائي للعائلات حوالي ${totalInstallationDays} أيام.`
                  : `Assemble self-interlocking wall and roof modules using quick-lock clamps and anchor pins. Final handover to families is reached in ${totalInstallationDays} days.`}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/50 flex justify-between items-center text-[10px] font-mono text-slate-400">
              <span>{isAr ? "العمال:" : "Crew:"} {activeWorkers} pax</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
};
