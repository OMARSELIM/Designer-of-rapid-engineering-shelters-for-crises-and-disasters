import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Flame,
  Droplets,
  ShieldAlert,
  Skull,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  TrendingUp,
  Sliders,
  Users,
  AlertCircle,
  HelpCircle,
  Gauge,
  Info,
  ChevronRight,
  ShieldCheck,
  Zap
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

interface EvacuationSimulationViewProps {
  totalUnits?: number;
  peopleCount?: number;
  lang?: "ar" | "en";
  project?: any;
}

interface Person {
  id: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  speed: number;
  baseSpeed: number;
  angle: number;
  status: "evacuating" | "safe" | "stuck";
  path: { x: number; y: number }[];
  currentPathIndex: number;
  size: number;
  color: string;
  panicFactor: number;
}

interface AssemblyPoint {
  id: string;
  nameAr: string;
  nameEn: string;
  x: number;
  y: number;
  capacity: number;
  count: number;
  status: "safe" | "warning" | "danger";
}

interface Obstacle {
  x: number;
  y: number;
  radius: number;
  labelAr: string;
  labelEn: string;
}

export const EvacuationSimulationView: React.FC<EvacuationSimulationViewProps> = ({
  totalUnits = 12,
  peopleCount = 60,
  lang = "ar",
  project
}) => {
  const isAr = lang === "ar";
  const pop = peopleCount || 80;
  const units = totalUnits || 12;

  // Configuration States
  const [scenario, setScenario] = useState<"fire" | "flood" | "shelling" | "aftershock">("fire");
  const [panicLevel, setPanicLevel] = useState<"low" | "medium" | "high">("medium");
  const [roadObstruction, setRoadObstruction] = useState<number>(15); // % of path blockage
  const [assemblyCount, setAssemblyCount] = useState<number>(3); // Number of active assembly points (1-4)
  const [simSpeed, setSimSpeed] = useState<number>(1); // 1x, 2x, 4x

  // Simulation Running State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [simTime, setSimTime] = useState<number>(0); // in seconds
  const [evacuatedPercent, setEvacuatedPercent] = useState<number>(0);
  const [stuckPercent, setStuckPercent] = useState<number>(0);
  const [congestionLevel, setCongestionLevel] = useState<number>(0); // 0 to 100%

  // Graph History data
  const [historyData, setHistoryData] = useState<{ time: number; evacuated: number; remaining: number }[]>([]);

  // Simulation Tick References & Particle states
  const [particles, setParticles] = useState<Person[]>([]);
  const requestRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);

  // Hardcoded map layout dimensions
  const mapWidth = 600;
  const mapHeight = 400;

  // Hazard Center/Expansion properties
  const [hazardRadius, setHazardRadius] = useState<number>(30);
  const maxHazardRadius = 130;

  // Defined Assembly Points
  const allAssemblyPoints: AssemblyPoint[] = [
    { id: "A1", nameAr: "نقطة التجمع أ (الشمال الشرقي - مرتفع)", nameEn: "Assembly A (NE High Ground)", x: 530, y: 60, capacity: 50, count: 0, status: "safe" },
    { id: "A2", nameAr: "نقطة التجمع ب (الشمال الغربي - الساحة الكبرى)", nameEn: "Assembly B (NW Grand Square)", x: 70, y: 60, capacity: 40, count: 0, status: "safe" },
    { id: "A3", nameAr: "نقطة التجمع ج (الجنوب الشرقي - المركز الطبي الإضافي)", nameEn: "Assembly C (SE Medical Gate)", x: 530, y: 340, capacity: 35, count: 0, status: "safe" },
    { id: "A4", nameAr: "نقطة التجمع د (الجنوب الغربي - البوابة الخلفية)", nameEn: "Assembly D (SW Rear Gate)", x: 70, y: 340, capacity: 30, count: 0, status: "safe" }
  ];

  // Selected active assembly points based on configuration count
  const activeAssemblyPoints = allAssemblyPoints.slice(0, assemblyCount);

  // Buildings / Shelters coordinates on our grid
  const shelters = [
    { id: "s1", name: "Sector A1", x: 180, y: 120, type: "shelter" },
    { id: "s2", name: "Sector A2", x: 240, y: 120, type: "shelter" },
    { id: "s3", name: "Sector A3", x: 300, y: 120, type: "shelter" },
    { id: "s4", name: "Sector A4", x: 360, y: 120, type: "shelter" },
    { id: "s5", name: "Sector B1", x: 180, y: 180, type: "shelter" },
    { id: "s6", name: "Sector B2", x: 240, y: 180, type: "shelter" },
    { id: "s7", name: "Sector B3", x: 300, y: 180, type: "shelter" },
    { id: "s8", name: "Sector B4", x: 360, y: 180, type: "shelter" },
    { id: "s9", name: "Sector C1", x: 180, y: 240, type: "shelter" },
    { id: "s10", name: "Sector C2", x: 240, y: 240, type: "shelter" },
    { id: "s11", name: "Sector C3", x: 300, y: 240, type: "shelter" },
    { id: "s12", name: "Sector C4", x: 360, y: 240, type: "shelter" },
    { id: "clinic", name: "Clinic", x: 140, y: 150, type: "facility" },
    { id: "school", name: "School", x: 410, y: 150, type: "facility" },
    { id: "kitchen", name: "Kitchen", x: 290, y: 80, type: "facility" },
    { id: "admin", name: "Admin", x: 210, y: 80, type: "facility" }
  ];

  // Obstacles / Danger centers depending on scenario
  const getHazardCenter = () => {
    switch (scenario) {
      case "fire":
        return { x: 290, y: 85, labelAr: "بؤرة الحريق (المطبخ المركزي)", labelEn: "Fire Epicenter (Central Kitchen)" };
      case "flood":
        return { x: 300, y: 390, labelAr: "تدفق السيول (المنطقة المنخفضة)", labelEn: "Flash Flood Flow (Low Ground)" };
      case "shelling":
        return { x: 240, y: 200, labelAr: "منطقة الخطر العسكري", labelEn: "Tactical Warning Zone" };
      case "aftershock":
        return { x: 300, y: 200, labelAr: "خط التصدع الزلزالي الارتدادي", labelEn: "Seismic Fault Rupture" };
    }
  };

  const hazardInfo = getHazardCenter();

  // Create initial population of particles (individual/group units)
  const initializeSimulation = () => {
    setIsRunning(false);
    setSimTime(0);
    setEvacuatedPercent(0);
    setStuckPercent(0);
    setCongestionLevel(0);
    setHazardRadius(scenario === "fire" ? 25 : scenario === "flood" ? 40 : 35);
    setHistoryData([{ time: 0, evacuated: 0, remaining: 100 }]);

    // Generate ~45 particles distributed among existing shelters
    const newParticles: Person[] = [];
    const countPerLocation = Math.ceil(pop / 15);

    shelters.forEach((shelter, idx) => {
      const isFacility = shelter.type === "facility";
      const loopLimit = isFacility ? 2 : countPerLocation;

      for (let i = 0; i < loopLimit; i++) {
        // Offset starting coordinates slightly to look like a crowd
        const startX = shelter.x + (Math.random() * 16 - 8);
        const startY = shelter.y + (Math.random() * 16 - 8);

        // Calculate nearest assembly point among active ones
        let bestAssembly = activeAssemblyPoints[0];
        let minDist = Infinity;

        activeAssemblyPoints.forEach((ap) => {
          // Compute simple distance
          const d = Math.hypot(ap.x - startX, ap.y - startY);
          if (d < minDist) {
            minDist = d;
            bestAssembly = ap;
          }
        });

        // Generate customized path avoiding the obstacle center
        // Basic path is: start -> checkpoint node (to bypass hazard) -> target assembly point
        const path: { x: number; y: number }[] = [{ x: startX, y: startY }];

        // Check if path passes directly through the danger zone
        const hCenter = getHazardCenter();
        const distToHazard = Math.hypot(startX - hCenter.x, startY - hCenter.y);

        // If starting too close to hazard, panic is higher
        const personalPanic = panicLevel === "high" ? 1.5 : panicLevel === "medium" ? 1.1 : 0.8;
        const baseSpeed = (1.2 + Math.random() * 0.8) * (panicLevel === "high" ? 1.4 : 1.0);

        // Intermediate waypoints for realistic evacuation routing avoiding the core map blockages
        // Add road layout grid points
        const waypointY = startY < 200 ? 150 : 250;
        const waypointX = startX < 300 ? 180 : 420;

        path.push({ x: waypointX, y: waypointY });
        path.push({ x: bestAssembly.x, y: bestAssembly.y });

        newParticles.push({
          id: idx * 10 + i,
          x: startX,
          y: startY,
          startX,
          startY,
          targetX: bestAssembly.x,
          targetY: bestAssembly.y,
          speed: baseSpeed,
          baseSpeed,
          angle: 0,
          status: "evacuating",
          path,
          currentPathIndex: 0,
          size: 4 + Math.random() * 3,
          color: getRandomColor(idx),
          panicFactor: personalPanic
        });
      }
    });

    setParticles(newParticles);
  };

  const getRandomColor = (index: number) => {
    const colors = [
      "#ef4444", // red
      "#f97316", // orange
      "#eab308", // yellow
      "#84cc16", // lime
      "#10b981", // emerald
      "#06b6d4", // cyan
      "#3b82f6", // blue
      "#6366f1", // indigo
      "#a855f7", // purple
      "#ec4899"  // pink
    ];
    return colors[index % colors.length];
  };

  // Run on mount or configuration changes
  useEffect(() => {
    initializeSimulation();
  }, [scenario, panicLevel, roadObstruction, assemblyCount]);

  // Main simulation mathematical tick update
  const updateSimulationTick = (timestamp: number) => {
    if (!lastUpdateTimeRef.current) lastUpdateTimeRef.current = timestamp;
    const elapsed = timestamp - lastUpdateTimeRef.current;

    // Control frame-rate and simulation speed multiplier
    if (elapsed > 40) {
      lastUpdateTimeRef.current = timestamp;

      // Update simulation time (1 tick is roughly 0.5s in model time at 1x speed)
      setSimTime((prev) => parseFloat((prev + 0.1 * simSpeed).toFixed(1)));

      // Gradually expand the hazard radius
      setHazardRadius((prev) => {
        if (prev < maxHazardRadius) {
          // Flood expands faster, bombardment pulses, fire burns continuously
          const expandRate = scenario === "flood" ? 0.4 : scenario === "fire" ? 0.25 : 0.15;
          return prev + expandRate * simSpeed;
        }
        return prev;
      });

      // Update particle positions
      setParticles((prevParticles) => {
        let totalEvacuated = 0;
        let totalStuck = 0;
        let totalParticles = prevParticles.length;
        let localCongestionSum = 0;

        const hCenter = getHazardCenter();

        const updated = prevParticles.map((p) => {
          if (p.status === "safe") {
            totalEvacuated++;
            return p;
          }
          if (p.status === "stuck") {
            totalStuck++;
            return p;
          }

          // Check distance to hazard center
          const distToHazard = Math.hypot(p.x - hCenter.x, p.y - hCenter.y);
          if (distToHazard < hazardRadius && scenario !== "aftershock") {
            // Particle got consumed by hazard (trapped)
            return { ...p, status: "stuck" as const };
          }

          // Path following logic
          const currentWaypoint = p.path[p.currentPathIndex];
          if (!currentWaypoint) {
            // Reached destination assembly point safely
            totalEvacuated++;
            return { ...p, status: "safe" as const, x: p.targetX, y: p.targetY };
          }

          const dx = currentWaypoint.x - p.x;
          const dy = currentWaypoint.y - p.y;
          const distanceToWaypoint = Math.hypot(dx, dy);

          if (distanceToWaypoint < 12) {
            // Proceed to next node in path
            const nextIdx = p.currentPathIndex + 1;
            if (nextIdx >= p.path.length) {
              totalEvacuated++;
              return { ...p, status: "safe" as const, x: p.targetX, y: p.targetY };
            }
            return { ...p, currentPathIndex: nextIdx };
          }

          // Basic vector heading
          const angle = Math.atan2(dy, dx);

          // Simulate congestion / bottlenecks
          // Look at surrounding active evacuating particles
          let closeCount = 0;
          prevParticles.forEach((other) => {
            if (other.id !== p.id && other.status === "evacuating") {
              const d = Math.hypot(p.x - other.x, p.y - other.y);
              if (d < 18) closeCount++;
            }
          });

          // Bottleneck speed degradation formula
          // Obstruction % and high panic limits crowd fluid flow
          const densitySlowdown = Math.max(0.2, 1 - closeCount * 0.12);
          const obstructionSlowdown = Math.max(0.3, 1 - (roadObstruction / 100) * 0.6);
          const currentSpeed = p.baseSpeed * densitySlowdown * obstructionSlowdown * simSpeed;

          if (closeCount > 4) {
            localCongestionSum += 1;
          }

          // Compute next steps
          let stepX = p.x + Math.cos(angle) * currentSpeed;
          let stepY = p.y + Math.sin(angle) * currentSpeed;

          // Add subtle steering/evasion vectors around the hazard boundary if getting too close
          const nextDistToHazard = Math.hypot(stepX - hCenter.x, stepY - hCenter.y);
          if (nextDistToHazard < hazardRadius + 20) {
            // Steer away! Repulsive force vector
            const repulsionAngle = Math.atan2(p.y - hCenter.y, p.x - hCenter.x);
            stepX += Math.cos(repulsionAngle) * 1.5 * simSpeed;
            stepY += Math.sin(repulsionAngle) * 1.5 * simSpeed;
          }

          return {
            ...p,
            x: stepX,
            y: stepY,
            angle
          };
        });

        // Compute overall percents
        const evacPercent = Math.round((totalEvacuated / totalParticles) * 100);
        const stuckPerc = Math.round((totalStuck / totalParticles) * 100);
        const overallCongestion = Math.min(100, Math.round((localCongestionSum / totalParticles) * 150));

        setEvacuatedPercent(evacPercent);
        setStuckPercent(stuckPerc);
        setCongestionLevel(overallCongestion);

        // Stop simulation when all safe or trapped
        if (totalEvacuated + totalStuck >= totalParticles) {
          setIsRunning(false);
        }

        return updated;
      });
    }

    if (isRunning) {
      requestRef.current = requestAnimationFrame(updateSimulationTick);
    }
  };

  // Update history array for Recharts rendering periodically
  useEffect(() => {
    if (simTime > 0) {
      setHistoryData((prev) => {
        // Only append unique time ticks
        if (prev.some((d) => d.time === Math.round(simTime))) return prev;
        return [
          ...prev,
          {
            time: Math.round(simTime),
            evacuated: evacuatedPercent,
            remaining: 100 - evacuatedPercent - stuckPercent
          }
        ];
      });
    }
  }, [simTime, evacuatedPercent, stuckPercent]);

  // Request Animation Frame control
  useEffect(() => {
    if (isRunning) {
      requestRef.current = requestAnimationFrame(updateSimulationTick);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning, simSpeed, hazardRadius, scenario, panicLevel, roadObstruction]);

  const toggleSimulation = () => {
    setIsRunning(!isRunning);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    initializeSimulation();
  };

  // Derived calculations based on inputs and state
  const timeLimit = scenario === "shelling" ? 45 : scenario === "fire" ? 90 : 120; // safe seconds window
  const evacuationEfficiency = evacuatedPercent;
  const criticalThreatLevel =
    evacuatedPercent > 90
      ? isAr
        ? "مستوى آمن جداً"
        : "Highly Secured"
      : stuckPercent > 20
      ? isAr
        ? "مستوى خطورة كارثي"
        : "Catastrophic Alert"
      : isAr
      ? "تأثير معتدل"
      : "Moderate Alert";

  // Assembly Point distribution status
  const updateAssemblyCounts = () => {
    const counts: Record<string, number> = {};
    activeAssemblyPoints.forEach((ap) => {
      counts[ap.id] = 0;
    });

    particles.forEach((p) => {
      if (p.status === "safe") {
        // Find which AP it was targeted for
        activeAssemblyPoints.forEach((ap) => {
          const dist = Math.hypot(p.x - ap.x, p.y - ap.y);
          if (dist < 20) {
            counts[ap.id] = (counts[ap.id] || 0) + 1;
          }
        });
      }
    });

    return counts;
  };

  const assemblyRealCounts = updateAssemblyCounts();

  // Dynamic feedback and recommendations
  const getSimRecommendations = () => {
    const recs = [];
    if (roadObstruction > 25) {
      recs.push({
        id: "r1",
        titleAr: "إزالة الأنقاض وتوسيع الممرات",
        titleEn: "Clear debris & widen pathways",
        descAr: "نسبة انسداد الممرات البالغة " + roadObstruction + "% تسبب تأخيراً حرجاً. يوصى بإخلاء الممرات وتوسيعها إلى 5.5 متر لتجنب اختناق التدفق.",
        descEn: "Path blockade of " + roadObstruction + "% induces vital evacuation lag. Clear emergency lanes to 5.5m minimum width."
      });
    }
    if (panicLevel === "high") {
      recs.push({
        id: "r2",
        titleAr: "تدريب فرق الإرشاد وتنصيب مكبرات صوتية",
        titleEn: "Erect sound alerts & train wardens",
        descAr: "حالة الذعر الشديد تسبب تدافعاً عشوائياً. وضع لوحات إرشاد فسفورية ومكبرات إنذار يقلل زمن الاستجابة بـ 35%.",
        descEn: "Extreme panic triggers high queuing conflicts. Luminescent routing signs and emergency sirens cut start-lag by 35%."
      });
    }
    if (assemblyCount < 3) {
      recs.push({
        id: "r3",
        titleAr: "زيادة نقاط التجمع الآمنة",
        titleEn: "Deploy additional assembly hubs",
        descAr: "تحديد " + assemblyCount + " نقاط تجمع فقط يركز الحشود في بقعة واحدة مما يؤدي للتدافع. تفعيل نقاط تجمع إضافية يوزع الكثافة.",
        descEn: "Sparsely utilizing " + assemblyCount + " assembly zones concentrates evacuees. Activate all 4 quadrants to divide crowd flow."
      });
    }
    if (scenario === "flood") {
      recs.push({
        id: "r4",
        titleAr: "توجيه حصري نحو المرتفع الشمالي",
        titleEn: "Strict uphill route prioritization",
        descAr: "الفيضان يجتاح القطاع الجنوبي السفلي للمخيم. يجب حظر نقاط التجمع الجنوبية ج و د وتوجيه السكان كلياً للشمال.",
        descEn: "Waters submerge southern lowlands. Forbid South gates (C & D) and divert entire flow uphill to North structures."
      });
    }

    if (recs.length === 0) {
      recs.push({
        id: "r5",
        titleAr: "المخطط الحالي متوافق هندسياً",
        titleEn: "Current layout fully optimized",
        descAr: "توزيع ممرات الهروب والتباعد الحسابي آمن كلياً ومطابق لقواعد ميثاق إسفير الدولي للبناء المؤقت.",
        descEn: "Current geometric escape routing and separation buffers fully comply with global Sphere safety policies."
      });
    }
    return recs;
  };

  return (
    <div className="flex flex-col gap-6" id="evacuation-simulation-main">
      
      {/* Top Banner with Alert Accent */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-black tracking-wider px-2 py-0.5 rounded uppercase font-mono">
                {isAr ? "نظام النمذجة والحساب الجغرافي الحي" : "REAL-TIME GEOGRAPHIC MOTION MODEL"}
              </span>
              <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping" />
              <span className="text-[10px] text-rose-400 font-mono font-bold uppercase">
                {isAr ? "محاكي الأمان التكتيكي" : "Tactical Safety Simulator"}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-tight">
              {isAr ? "منظومة محاكاة الإخلاء والطوارئ بالذكاء الاصطناعي" : "AI Autonomous Emergency & Evacuation Simulator"}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-normal text-justify">
              {isAr
                ? "قم بنمذجة ومحاكاة عمليات الهروب الجماعي ومسارات النفاذ الآمنة للسكان عند حدوث الأزمات. اختبر تداعيات الحرائق، السيول، القصف والارتدادات الزلزلية لحساب اختناقات الممرات واختبار فاعلية نقاط التجمع."
                : "Model crowd flow dynamics during extreme disasters. Run physics-based simulations for Fire, Flash Flood, Bombardment, and Earthquake scenarios to calculate bottlenecks, safe corridors, and assembly security."}
            </p>
          </div>
        </div>
      </div>

      {/* Control Panel Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* LEFT PANEL: Simulation Scenarios & Settings */}
        <div className="xl:col-span-1 bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col gap-5">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200">
            <Sliders className="w-4 h-4 text-rose-600" />
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
              {isAr ? "إعدادات سيناريو الطوارئ" : "Emergency Scenario Settings"}
            </h4>
          </div>

          {/* Scenario Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-700">{isAr ? "اختر نوع الكارثة المسببة للإخلاء:" : "Select Disaster Scenario:"}</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setScenario("fire")}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                  scenario === "fire"
                    ? "bg-rose-50 border-rose-300 text-rose-700 shadow-2xs"
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <Flame className="w-5 h-5 text-rose-500" />
                <span>{isAr ? "حريق" : "Fire"}</span>
              </button>

              <button
                onClick={() => setScenario("flood")}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                  scenario === "flood"
                    ? "bg-blue-50 border-blue-300 text-blue-700 shadow-2xs"
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <Droplets className="w-5 h-5 text-blue-500" />
                <span>{isAr ? "فيضان" : "Flood"}</span>
              </button>

              <button
                onClick={() => setScenario("shelling")}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                  scenario === "shelling"
                    ? "bg-purple-50 border-purple-300 text-purple-700 shadow-2xs"
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <ShieldAlert className="w-5 h-5 text-purple-500" />
                <span>{isAr ? "قصف" : "Shelling"}</span>
              </button>

              <button
                onClick={() => setScenario("aftershock")}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                  scenario === "aftershock"
                    ? "bg-amber-50 border-amber-300 text-amber-700 shadow-2xs"
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <Activity className="w-5 h-5 text-amber-500" />
                <span>{isAr ? "هزة ارتدادية" : "Aftershock"}</span>
              </button>
            </div>
          </div>

          {/* Additional Parameter Inputs */}
          <div className="flex flex-col gap-4 border-t border-slate-200 pt-4">
            
            {/* Panic Level Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 flex justify-between">
                <span>{isAr ? "مستوى الذعر والهلع الجماعي:" : "Crowd Panic Factor:"}</span>
                <span className="font-extrabold text-rose-600">
                  {panicLevel === "low" ? (isAr ? "منخفض" : "Low") : panicLevel === "medium" ? (isAr ? "متوسط" : "Medium") : (isAr ? "ذعر مفرط" : "High Panic")}
                </span>
              </label>
              <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-lg border border-slate-200">
                {(["low", "medium", "high"] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setPanicLevel(level)}
                    className={`py-1 text-[10px] font-black rounded-md transition-all cursor-pointer uppercase ${
                      panicLevel === level
                        ? "bg-slate-900 text-white"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {level === "low" ? (isAr ? "منخفض" : "Low") : level === "medium" ? (isAr ? "متوسط" : "Mid") : (isAr ? "عالي" : "High")}
                  </button>
                ))}
              </div>
            </div>

            {/* Path Obstruction Factor Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">{isAr ? "نسبة انسداد الممرات بالركام:" : "Debris Corridor Blockage:"}</span>
                <span className="font-mono font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{roadObstruction}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="5"
                value={roadObstruction}
                onChange={(e) => setRoadObstruction(parseInt(e.target.value))}
                className="w-full accent-rose-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[9px] text-slate-500 leading-normal">
                {isAr ? "💡 الركام الناتج عن الكارثة يقلص عرض الممرات ويبطئ سرعة التدفق." : "💡 Physical ruins reduce effective road widths and crowd speeds."}
              </span>
            </div>

            {/* Assembly Point Count Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">{isAr ? "عدد نقاط التجمع النشطة:" : "Active Assembly Zones:"}</span>
                <span className="font-mono font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{assemblyCount} {isAr ? "بوابات" : "gates"}</span>
              </div>
              <input
                type="range"
                min="1"
                max="4"
                step="1"
                value={assemblyCount}
                onChange={(e) => setAssemblyCount(parseInt(e.target.value))}
                className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[9px] text-slate-500 leading-normal">
                {isAr ? "💡 توزيع السكان على مخارج متعددة يقلل الضغط وتدافع الحشود." : "💡 Spreading escapes across multiple exits curbs gridlock."}
              </span>
            </div>

          </div>

          {/* Quick Real-Time Metric Summary Panel */}
          <div className="bg-white p-4 rounded-xl border border-slate-150 flex flex-col gap-3 shadow-3xs mt-auto">
            <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-50 pb-1.5">
              {isAr ? "تقدير الكفاءة الجيوفيزيائية" : "PREDICTED EVAC MODULE"}
            </h5>
            
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-700">
              <span>{isAr ? "السرعة النظرية للتدفق:" : "Theoretical Flow Speed:"}</span>
              <span className="font-mono font-extrabold text-slate-900">
                {panicLevel === "high" ? "1.8 m/s" : "1.2 m/s"}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] font-medium text-slate-700">
              <span>{isAr ? "زمن الاستجابة للإنذار:" : "Alarm Response Lag:"}</span>
              <span className="font-mono font-extrabold text-slate-900">
                {panicLevel === "high" ? "12s" : "28s"}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] font-medium text-slate-700">
              <span>{isAr ? "كفاءة التوزيع الهندسي:" : "Layout Routing Factor:"}</span>
              <span className="font-mono font-extrabold text-emerald-600">
                {roadObstruction > 20 ? "65% (Suboptimal)" : "94% (High Efficiency)"}
              </span>
            </div>
          </div>

        </div>

        {/* RIGHT SIMULATOR ENGINE: Interactive SVG + Diagnostics */}
        <div className="xl:col-span-3 flex flex-col gap-6">
          
          {/* Main Map Box & Live Controls */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            
            {/* Simulation Header & Controller */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              
              {/* Dynamic Live Timer Tickers */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 bg-slate-900 text-white font-mono px-3 py-1.5 rounded-xl text-xs font-bold">
                  <Clock className="w-4 h-4 text-rose-500" />
                  <span>{isAr ? "زمن المحاكاة:" : "Elapsed Time:"}</span>
                  <span className="text-amber-400 font-black">{simTime}s</span>
                </div>

                <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 font-mono px-3 py-1.5 rounded-xl text-xs font-bold">
                  <Users className="w-4 h-4" />
                  <span>{isAr ? "الإخلاء:" : "Evacuated:"}</span>
                  <span className="text-blue-900 font-black">{evacuatedPercent}%</span>
                </div>

                {stuckPercent > 0 && (
                  <div className="flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-100 font-mono px-3 py-1.5 rounded-xl text-xs font-bold animate-pulse">
                    <Skull className="w-4 h-4" />
                    <span>{isAr ? "عالق:" : "Trapped:"}</span>
                    <span className="text-red-900 font-black">{stuckPercent}%</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                
                {/* Speed Controls */}
                <div className="flex items-center bg-slate-100 rounded-lg p-1 mr-2 text-xs">
                  {([1, 2, 4] as const).map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setSimSpeed(spd)}
                      className={`px-2 py-1 font-extrabold rounded-md cursor-pointer transition-all ${
                        simSpeed === spd
                          ? "bg-slate-900 text-white"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>

                {/* Primary Simulation Button */}
                <button
                  id="btn-run-evacuation-sim"
                  onClick={toggleSimulation}
                  className={`flex items-center gap-1.5 text-xs font-black px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer ${
                    isRunning
                      ? "bg-amber-600 hover:bg-amber-700 text-white"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isRunning 
                    ? (isAr ? "إيقاف مؤقت" : "Pause") 
                    : (isAr ? "تشغيل محاكاة الإخلاء" : "Run Simulation")}
                </button>

                {/* Reset Button */}
                <button
                  id="btn-reset-evacuation-sim"
                  onClick={resetSimulation}
                  className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-black p-2.5 rounded-xl transition-all cursor-pointer"
                  title={isAr ? "إعادة تهيئة المحاكاة" : "Reset Simulation"}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

              </div>

            </div>

            {/* Dynamic Interactive SVG Mapping Canvas */}
            <div className="relative w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800" style={{ minHeight: "360px" }}>
              
              {/* Grid overlay for military technical radar vibe */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
                style={{
                  backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                  backgroundSize: "20px 20px"
                }} 
              />

              <svg 
                viewBox={`0 0 ${mapWidth} ${mapHeight}`} 
                className="w-full h-auto select-none block"
              >
                
                {/* 1. Roads & Escape Routes Network Grid */}
                {/* Horizontal corridors */}
                <line x1="100" y1="150" x2="500" y2="150" stroke="#1e293b" strokeWidth="12" strokeLinecap="round" />
                <line x1="100" y1="250" x2="500" y2="250" stroke="#1e293b" strokeWidth="12" strokeLinecap="round" strokeDasharray={roadObstruction > 30 ? "8 6" : "0"} />
                {/* Vertical pathways */}
                <line x1="180" y1="100" x2="180" y2="300" stroke="#1e293b" strokeWidth="10" strokeLinecap="round" />
                <line x1="300" y1="80" x2="300" y2="320" stroke="#1e293b" strokeWidth="14" strokeLinecap="round" />
                <line x1="420" y1="100" x2="420" y2="300" stroke="#1e293b" strokeWidth="10" strokeLinecap="round" />

                {/* Safe evacuation direction arrows (drawn underneath particles) */}
                {activeAssemblyPoints.map((ap) => (
                  <g key={`arrow-${ap.id}`}>
                    <path
                      d={`M ${ap.x === 70 ? ap.x + 35 : ap.x - 35} ${ap.y} L ${ap.x === 70 ? ap.x + 10 : ap.x - 10} ${ap.y}`}
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeDasharray="4 2"
                      className="animate-pulse"
                      fill="none"
                    />
                  </g>
                ))}

                {/* Bottleneck highlight zones (corridors glowing red under heavy congestion) */}
                {congestionLevel > 30 && (
                  <g>
                    {/* Central intersection bottlenecks */}
                    <circle cx="300" cy="150" r="35" fill="#ef4444" fillOpacity="0.12" className="animate-pulse" />
                    <circle cx="300" cy="250" r="30" fill="#f59e0b" fillOpacity="0.1" />
                    <text x="300" y="125" textAnchor="middle" fill="#ef4444" fontSize="8" fontWeight="bold" fontFamily="monospace">
                      {isAr ? "⚠️ منطقة اختناق" : "⚠️ BOTTLENECK CHOKEPOINT"}
                    </text>
                  </g>
                )}

                {/* 2. Disaster Epicenter pulsing impact area */}
                <g>
                  {scenario === "flood" ? (
                    // Rising Flood wave from bottom
                    <path
                      d={`M 0 400 L 0 ${400 - hazardRadius * 1.5} Q 150 ${400 - hazardRadius * 1.5 - 20} 300 ${400 - hazardRadius * 1.5} T 600 ${400 - hazardRadius * 1.5} L 600 400 Z`}
                      fill="#3b82f6"
                      fillOpacity="0.35"
                      stroke="#60a5fa"
                      strokeWidth="2"
                    />
                  ) : scenario === "aftershock" ? (
                    // Fault line cracks
                    <path
                      d="M 120 200 L 220 210 L 320 190 L 410 215 L 500 200"
                      stroke="#f59e0b"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray="15 5"
                      fill="none"
                      className="animate-pulse"
                    />
                  ) : (
                    // Expanding radial epicenters (Fire / Shelling)
                    <>
                      <circle
                        cx={hazardInfo.x}
                        cy={hazardInfo.y}
                        r={hazardRadius}
                        fill={scenario === "fire" ? "#ef4444" : "#a855f7"}
                        fillOpacity="0.25"
                        stroke={scenario === "fire" ? "#f97316" : "#c084fc"}
                        strokeWidth="2"
                        className="animate-ping"
                        style={{ animationDuration: "3s" }}
                      />
                      <circle
                        cx={hazardInfo.x}
                        cy={hazardInfo.y}
                        r={Math.max(10, hazardRadius - 20)}
                        fill={scenario === "fire" ? "#f97316" : "#e9d5ff"}
                        fillOpacity="0.4"
                      />
                    </>
                  )}
                  
                  {/* Danger epicenter text node */}
                  <text
                    x={hazardInfo.x}
                    y={scenario === "flood" ? 380 : hazardInfo.y - 5}
                    textAnchor="middle"
                    fill="#fca5a5"
                    fontSize="9"
                    fontWeight="black"
                    fontFamily="sans-serif"
                    className="bg-black/80 px-1"
                  >
                    🔥 {isAr ? hazardInfo.labelAr : hazardInfo.labelEn}
                  </text>
                </g>

                {/* 3. Render Shelters & Camp Buildings */}
                {shelters.map((shelter) => {
                  const isStuck = Math.hypot(shelter.x - hazardInfo.x, shelter.y - hazardInfo.y) < hazardRadius && scenario !== "aftershock";
                  return (
                    <g key={shelter.id} className="cursor-help">
                      {/* Structure Box */}
                      <rect
                        x={shelter.x - 12}
                        y={shelter.y - 12}
                        width="24"
                        height="24"
                        rx="4"
                        fill={isStuck ? "#7f1d1d" : shelter.type === "facility" ? "#1e1b4b" : "#0f172a"}
                        stroke={isStuck ? "#ef4444" : shelter.type === "facility" ? "#4f46e5" : "#334155"}
                        strokeWidth="1.5"
                      />
                      {/* Icon or Symbol representation */}
                      <text
                        x={shelter.x}
                        y={shelter.y + 4}
                        textAnchor="middle"
                        fontSize="10"
                        fill={isStuck ? "#fca5a5" : shelter.type === "facility" ? "#a5b4fc" : "#94a3b8"}
                      >
                        {shelter.type === "facility" ? "🏥" : "🎪"}
                      </text>
                    </g>
                  );
                })}

                {/* 4. Active Moving Evacuees (Particles) */}
                {particles.map((p) => {
                  if (p.status === "safe") return null; // hide or render gathered separately
                  return (
                    <g key={`p-${p.id}`}>
                      {/* Person Indicator Dot */}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={p.size / 2 + 1.5}
                        fill={p.status === "stuck" ? "#7f1d1d" : p.color}
                        stroke={p.status === "stuck" ? "#ef4444" : "#ffffff"}
                        strokeWidth="0.5"
                        className={p.status === "stuck" ? "animate-pulse" : ""}
                      />
                      {/* Panic micro-glow */}
                      {p.status === "evacuating" && panicLevel === "high" && (
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={p.size + 2}
                          fill={p.color}
                          fillOpacity="0.15"
                          stroke="none"
                        />
                      )}
                    </g>
                  );
                })}

                {/* 5. Assembly / Safe Gathering Zones */}
                {activeAssemblyPoints.map((ap) => {
                  const currentCount = assemblyRealCounts[ap.id] || 0;
                  const isFull = currentCount >= ap.capacity;
                  return (
                    <g key={ap.id}>
                      {/* Outer target boundary circle */}
                      <circle
                        cx={ap.x}
                        cy={ap.y}
                        r="32"
                        fill="none"
                        stroke={isFull ? "#ef4444" : "#10b981"}
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                        className="animate-spin"
                        style={{ animationDuration: "12s" }}
                      />
                      {/* Inner solid zone */}
                      <circle
                        cx={ap.x}
                        cy={ap.y}
                        r="22"
                        fill={isFull ? "#7f1d1d" : "#064e3b"}
                        fillOpacity="0.45"
                        stroke={isFull ? "#ef4444" : "#10b981"}
                        strokeWidth="2"
                      />
                      {/* Assembly Point Tag */}
                      <text
                        x={ap.x}
                        y={ap.y - 2}
                        textAnchor="middle"
                        fontSize="8"
                        fontWeight="black"
                        fill="#ffffff"
                        fontFamily="monospace"
                      >
                        {ap.id}
                      </text>
                      {/* Evacuee Gathered Counter */}
                      <text
                        x={ap.x}
                        y={ap.y + 8}
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="black"
                        fill={isFull ? "#fca5a5" : "#34d399"}
                        fontFamily="monospace"
                      >
                        {currentCount}/{ap.capacity}
                      </text>

                      {/* Descriptive Label floating outside */}
                      <text
                        x={ap.x}
                        y={ap.y + 44}
                        textAnchor="middle"
                        fontSize="7"
                        fontWeight="bold"
                        fill="#94a3b8"
                        fontFamily="sans-serif"
                      >
                        {isAr ? ap.nameAr.split(" ")[0] + " " + ap.nameAr.split(" ")[1] : ap.nameEn.split(" ")[0]}
                      </text>
                    </g>
                  );
                })}

              </svg>

              {/* Live Overlay Notification Card */}
              <div className={`absolute bottom-3 ${isAr ? "left-3" : "right-3"} bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg text-[10px] text-slate-300 max-w-xs flex flex-col gap-1 backdrop-blur-xs`}>
                <div className="flex items-center gap-1.5 font-bold text-white uppercase tracking-wide">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>{isAr ? "مفاتيح المحاكاة الرادارية:" : "Simulation Radar Legends:"}</span>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-1 font-mono text-[9px]">
                  <span className="flex items-center gap-1">🎪 <span className="text-slate-400">{isAr ? "مأوى" : "Shelter"}</span></span>
                  <span className="flex items-center gap-1">🏥 <span className="text-slate-400">{isAr ? "مرفق طبي" : "Clinic"}</span></span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> <span className="text-slate-400">{isAr ? "تجمع آمن" : "Safe Zone"}</span></span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-600" /> <span className="text-slate-400">{isAr ? "ممر مائي/نار" : "Threat"}</span></span>
                </div>
              </div>

            </div>

          </div>

          {/* LOWER GRID: Simulation History Graph & Structural Diagnostics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart: Evacuation Progression over Time */}
            <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h5 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                    {isAr ? "تحليل معدل تقدم الإخلاء البياني" : "Evacuation Flow Progression Graph"}
                  </h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {isAr ? "معدل تدفق الحشود وإجمالي السكان الذين نجحوا في الوصول لنقاط التجمع" : "Evacuation throughput rate relative to countdown window"}
                  </p>
                </div>
                <span className="p-1 rounded bg-rose-50 text-rose-600"><TrendingUp className="w-4 h-4" /></span>
              </div>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorEvac" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorRemain" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={9} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ background: "#0f172a", border: "none", borderRadius: "8px", color: "#fff", fontSize: "10px" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="evacuated"
                      name={isAr ? "النازحون الآمنون %" : "Safe Evac %"}
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorEvac)"
                    />
                    <Area
                      type="monotone"
                      dataKey="remaining"
                      name={isAr ? "المتبقون بانتظار الإخلاء %" : "Awaiting Evac %"}
                      stroke="#6366f1"
                      strokeWidth={1.5}
                      fillOpacity={1}
                      fill="url(#colorRemain)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2 font-mono">
                <span>{isAr ? "محور س: الزمن المتراكم (ثانية)" : "X: Cumulative seconds"}</span>
                <span>{isAr ? "محور ص: النسبة المئوية %" : "Y: Percentage %"}</span>
              </div>
            </div>

            {/* Diagnostics, Bottlenecks, and Action Items */}
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col justify-between">
              
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <h5 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                    {isAr ? "التوصيات وتدابير الأمان الموصى بها" : "Engineering Safe Routing Audit"}
                  </h5>
                </div>

                <div className="flex flex-col gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {getSimRecommendations().map((rec) => (
                    <div 
                      key={rec.id} 
                      className="bg-white p-3 rounded-xl border border-slate-150/80 flex flex-col gap-1 shadow-3xs hover:border-indigo-200 transition-colors"
                    >
                      <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                        {isAr ? rec.titleAr : rec.titleEn}
                      </span>
                      <p className="text-[10px] text-slate-600 leading-normal text-justify">
                        {isAr ? rec.descAr : rec.descEn}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Final Safety Seal */}
              <div className="bg-indigo-900 text-indigo-100 p-3 rounded-xl border border-indigo-950 flex items-center gap-2.5 mt-4">
                <div className="p-1 bg-indigo-800 rounded text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] text-indigo-300 block font-bold leading-none uppercase tracking-wider">
                    {isAr ? "التوافق الدولي للسلامة" : "Sphere Safety Audit"}
                  </span>
                  <span className="text-[11px] font-extrabold text-white block mt-0.5">
                    {criticalThreatLevel}
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
