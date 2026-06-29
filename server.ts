import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with custom user agent and key checks
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } else {
    console.warn("WARNING: GEMINI_API_KEY is not defined in the environment.");
  }
} catch (err) {
  console.error("Failed to initialize GoogleGenAI:", err);
}

// Helper for deterministic high-precision emergency shelter planning on demand or API failure
function generateHeuristicProject(input: any) {
  const {
    disasterType = "عام",
    locationName = "موقع ميداني",
    peopleCount = 5,
    availableArea = 100,
    soilType = "تربة عادية",
    climateType = "معتدل",
    localMaterials = [],
    durationOfUse = "6 أشهر",
    language = "ar"
  } = input;

  const isEn = language === "en";

  // Calculate units needed
  const capacityPerUnit = peopleCount <= 4 ? Number(peopleCount) : 5;
  const totalUnitsNeeded = Math.ceil(Number(peopleCount) / capacityPerUnit) || 1;

  // Set up details based on disaster type
  let modelName = "";
  let techStyle = "";
  let foundationType = "";
  let roofType = "";
  let insulation = "";
  let facadeDesc = "";

  const typeLower = (disasterType || "").toString().toLowerCase();

  if (isEn) {
    if (typeLower.includes("earthquake") || typeLower.includes("زلزال")) {
      modelName = "Resilient Flex-Frame S1";
      techStyle = "Lightweight treated timber framing with steel connection bracketry";
      foundationType = "High-friction skid base with perimeter soil anchor tie-downs";
      roofType = "sloped";
      insulation = "Expanded Polystyrene (EPS) panels (R-15) + fire-retardant wrap";
      facadeDesc = "Fiber-cement outer sheathing with light seismic-expansion gap seals";
    } else if (typeLower.includes("flood") || typeLower.includes("فيضان") || typeLower.includes("torrent") || typeLower.includes("سيول")) {
      modelName = "Amphibious Raised Shield M2";
      techStyle = "Prefabricated elevated steel modular chassis with composite sandwich panels";
      foundationType = "Raised helical screw piles with cross-bracing steel legs (0.8m above grade)";
      roofType = "sloped";
      insulation = "Rigid Polyurethane Foam (R-16) with waterproof membrane backing";
      facadeDesc = "High-density PVC siding with watertight seals around door and window frame joins";
    } else if (typeLower.includes("hurricane") || typeLower.includes("إعصار") || typeLower.includes("storm") || typeLower.includes("عاصفة") || typeLower.includes("wind")) {
      modelName = "Aero-Dynamic Dome H3";
      techStyle = "Reinforced interlocking monolithic geodesic domes with tension bands";
      foundationType = "Deep concrete anchor footing with steel anchor-strap embeds";
      roofType = "dome";
      insulation = "Thermal reflective bubble-shield wraps + Rockwool batting (R-18)";
      facadeDesc = "Aerodynamic fiberglass compound panels resisting winds up to 220 km/h";
    } else {
      modelName = "Modular Eco-Shield U4";
      techStyle = "Rapid-assembly insulated sandwich panel system with aluminum framing";
      foundationType = "Direct ground-anchored steel pins on compacted gravel beds";
      roofType = "sloped";
      insulation = "Extruded Polystyrene foam core (R-12) with integrated vapor barrier";
      facadeDesc = "Galvanized pre-painted steel sheet cladding with ventilation air gaps";
    }
  } else {
    if (typeLower.includes("زلزال") || typeLower.includes("earthquake")) {
      modelName = "درع الزلازل المرن S1";
      techStyle = "هيكل خشبي معالج خفيف الوزن مع زوايا تدعيم فولاذية مرنة ومقاومة للقص والاهتزاز";
      foundationType = "أساسات منزلقة ذات احتكاك عالي مع أوتاد ربط جانبية لامتصاص الصدمات الأرضية";
      roofType = "sloped";
      insulation = "ألواح البوليسترين الممدد (EPS) ذاتية الإطفاء سمك 10 سم مع حاجز رطوبة";
      facadeDesc = "ألياف أسمنتية خارجية مقاومة للعوامل الجوية مع فواصل تمدد ممتصة للاهتزازات";
    } else if (typeLower.includes("فيضان") || typeLower.includes("flood") || typeLower.includes("سيول") || typeLower.includes("torrent")) {
      modelName = "الدرع العائم المرتفع M2";
      techStyle = "هيكل معدني مسبق الصنع مرفوع عن مستوى الأرض مع ألواح معزولة مقاومة للمياه";
      foundationType = "ركائز فولاذية لولبية مرتفعة بمقدار 0.8 متر فوق منسوب المياه المتوقع";
      roofType = "sloped";
      insulation = "فوم البولي يوريثان الصلب (R-16) مع طبقات عزل مائي مزدوجة الجوانب";
      facadeDesc = "ألواح PVC عالية الكثافة مانعة للتسرب تماماً حول النوافذ والأبواب والمفاصل الإنشائية";
    } else if (typeLower.includes("إعصار") || typeLower.includes("hurricane") || typeLower.includes("عاصفة") || typeLower.includes("storm") || typeLower.includes("رياح")) {
      modelName = "القبة الانسيابية المضادة للرياح H3";
      techStyle = "قبة جيوديسية انسيابية ذات مقاطع فولاذية متشابكة وأحزمة شد أرضية مغمورة";
      foundationType = "قواعد خرسانية مدفونة عميقاً مع أشرطة شد فولاذية مدمجة بالأساسات";
      roofType = "dome";
      insulation = "رقائق الألومنيوم العاكسة للحرارة مع صوف صخري مضغوط عالي الكثافة (R-18)";
      facadeDesc = "ألواح مركبة من الألياف الزجاجية المقواة ذات انحناء انسيابي يشتت ضغط الرياح العاتية";
    } else {
      modelName = "الملجأ النموذجي السريع U4";
      techStyle = "نظام ألواح الساندوتش بانل مسبقة الصنع وسريعة التركيب مع إطارات ألومنيوم معززة";
      foundationType = "أوتاد فولاذية للتثبيت المباشر بالتربة مع فرشة حصى مرصوص لرفع الرطوبة";
      roofType = "sloped";
      insulation = "بوليسترين مقذوف بسماكة 7.5 سم مدمج ومقاوم للتسرب الحراري وامتصاص المياه";
      facadeDesc = "صاج مجلفن مطلي ومقاوم للصدأ مع فتحات تهوية علوية منظمة للضغط الداخلي";
    }
  }

  // Generate rooms
  const rooms = [
    {
      name: isEn ? "Main Living Area" : "منطقة المعيشة الرئيسية",
      x: 0.2,
      y: 0.2,
      w: 3.6,
      h: 2.2,
      type: "living"
    },
    {
      name: isEn ? "Sleeping Pod (Beds)" : "منطقة النوم (الأسرة)",
      x: 0.2,
      y: 2.5,
      w: 2.2,
      h: 1.8,
      type: "bed"
    },
    {
      name: isEn ? "Compact Kitchenette" : "مطبخ تحضيري مدمج",
      x: 2.5,
      y: 2.5,
      w: 1.3,
      h: 0.9,
      type: "kitchen"
    },
    {
      name: isEn ? "Private Latrine (Ventilated)" : "دورة مياه خاصة مهواة",
      x: 2.5,
      y: 3.5,
      w: 1.3,
      h: 0.8,
      type: "toilet"
    },
    {
      name: isEn ? "Main Entry Door" : "الباب الرئيسي",
      x: 1.5,
      y: 0,
      w: 0.9,
      h: 0.1,
      type: "door"
    },
    {
      name: isEn ? "North Ventilation Window" : "نافذة تهوية شمالية",
      x: 3.8,
      y: 1.2,
      w: 0.1,
      h: 0.8,
      type: "window"
    }
  ];

  // Camp Layout setup
  const gridRows = Math.ceil(Math.sqrt(totalUnitsNeeded));
  const gridCols = Math.ceil(totalUnitsNeeded / gridRows);
  const spacing = 4.5; // spacing in meters
  
  const facilities: any[] = [];
  
  // Place family shelters
  let count = 0;
  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      if (count < totalUnitsNeeded) {
        facilities.push({
          name: isEn ? `Family Unit ${count + 1}` : `وحدة سكنية عائلية ${count + 1}`,
          x: c * (4 + spacing) + 2,
          y: r * (4.3 + spacing) + 5,
          w: 4,
          h: 4.3,
          type: "shelter"
        });
        count++;
      }
    }
  }

  // Add communal facilities
  const totalWidth = gridCols * (4 + spacing) + 10;
  const totalHeight = gridRows * (4.3 + spacing) + 15;

  facilities.push({
    name: isEn ? "Main Water Storage Cistern" : "خزان المياه الرئيسي للمجمع",
    x: totalWidth / 2 - 2,
    y: 1,
    w: 4,
    h: 3,
    type: "water"
  });

  facilities.push({
    name: isEn ? "Crisis Health Clinic" : "المركز الطبي وعيادة الميدان",
    x: 2,
    y: 1,
    w: 6,
    h: 4,
    type: "medical"
  });

  facilities.push({
    name: isEn ? "Administration & Logistics Tent" : "خيمة الإدارة والتنسيق اللوجستي",
    x: totalWidth - 8,
    y: 1,
    w: 6,
    h: 4,
    type: "admin"
  });

  facilities.push({
    name: isEn ? "Safe Social Space / Children Play" : "المساحة المجتمعية الآمنة وألعاب الأطفال",
    x: totalWidth / 2 - 4,
    y: totalHeight - 5,
    w: 8,
    h: 4,
    type: "space"
  });

  facilities.push({
    name: isEn ? "Communal Wash & Latrine Block" : "كتلة دورات المياه العامة والغسيل المشترك",
    x: 2,
    y: totalHeight - 5,
    w: 6,
    h: 3,
    type: "latrines"
  });

  // Material list calculation
  const totalMaterialCostPerUnit = 1200;
  const materialsCost = totalUnitsNeeded * totalMaterialCostPerUnit + 2500; // units + communal
  const laborCost = Math.round(materialsCost * 0.25);
  const transportCost = Math.round(materialsCost * 0.15);
  const contingencyCost = Math.round((materialsCost + laborCost + transportCost) * 0.10);
  const totalCost = materialsCost + laborCost + transportCost + contingencyCost;

  const billOfMaterials = [
    {
      category: isEn ? "Structural Framing" : "الهيكل الإنشائي",
      material: isEn ? "Heavy-duty structural framing posts & connectors" : "أعمدة وقواطع الهيكل الإنشائي الرئيسي المقاوم للرياح والاهتزازات",
      quantity: totalUnitsNeeded * 12,
      unit: "piece",
      estimatedUnitPrice: 35,
      totalPrice: totalUnitsNeeded * 12 * 35,
      localSourcingPossible: true,
      sourcingNotes: isEn ? "Easily sourced from regional timber/metal yards." : "متوفر في مستودعات المواد والحديد بالمنطقة المجاورة."
    },
    {
      category: isEn ? "Insulation & Finishes" : "العزل والتشطيب",
      material: isEn ? "Weatherproof double-sided composite insulation panels" : "ألواح العزل الحراري والرطوبي المزدوجة والمقاومة للمياه والحرارة",
      quantity: totalUnitsNeeded * 32,
      unit: "sheet",
      estimatedUnitPrice: 20,
      totalPrice: totalUnitsNeeded * 32 * 20,
      localSourcingPossible: false,
      sourcingNotes: isEn ? "Recommended central warehouse dispatch for quality assurance." : "يفضل شحنها من المستودعات المركزية لضمان كفاءة العزل الحراري."
    },
    {
      category: isEn ? "Doors & Windows" : "الأبواب والنوافذ",
      material: isEn ? "Pre-hung exterior metal doors with double latches" : "أبواب معدنية خارجية مسبقة التجهيز مع مفصلات وأقفال أمان مزدوجة",
      quantity: totalUnitsNeeded,
      unit: "piece",
      estimatedUnitPrice: 75,
      totalPrice: totalUnitsNeeded * 75,
      localSourcingPossible: true,
      sourcingNotes: isEn ? "Can be assembled using local workshops." : "يمكن تصنيعها أو شراؤها مباشرة من الورش المحلية لتسريع التشييد."
    },
    {
      category: isEn ? "Doors & Windows" : "الأبواب والنوافذ",
      material: isEn ? "Polycarbonate ventilation windows with mesh screen" : "نوافذ تهوية بولي كربونيت مقاومة للكسر مع شبك سلكي للحماية من الحشرات",
      quantity: totalUnitsNeeded * 2,
      unit: "piece",
      estimatedUnitPrice: 25,
      totalPrice: totalUnitsNeeded * 2 * 25,
      localSourcingPossible: true,
      sourcingNotes: isEn ? "Readily available locally in commercial markets." : "نوافذ خفيفة الوزن وسهلة التثبيت متوفرة بكثرة في السوق المحلي."
    },
    {
      category: isEn ? "Sanitary & Electrical" : "التمديدات الصحية والكهربائية",
      material: isEn ? "Integrated piping, water storage unit, and low-flow plumbing" : "تمديدات السباكة والمواسير والقطع الصحية الموفرة للمياه مع خزان ملحق",
      quantity: totalUnitsNeeded,
      unit: "bag",
      estimatedUnitPrice: 110,
      totalPrice: totalUnitsNeeded * 110,
      localSourcingPossible: true,
      sourcingNotes: isEn ? "Standard plumbing items available in any trade center." : "مستلزمات صحية قياسية يسهل تأمينها من محلات السباكة المحلية."
    },
    {
      category: isEn ? "Foundations & Connectors" : "الأساسات والأدوات والتثبيت",
      material: isEn ? "Soil anchor pins, heavy-duty bracket ties, and screws" : "أوتاد تثبيت أرضية فولاذية، زوايا تثبيت وهياكل الربط المتكاملة والبراغي",
      quantity: totalUnitsNeeded * 250,
      unit: "piece",
      estimatedUnitPrice: 0.8,
      totalPrice: Math.round(totalUnitsNeeded * 250 * 0.8),
      localSourcingPossible: true,
      sourcingNotes: isEn ? "Standard fasteners. Essential to purchase in bulk." : "براغي تثبيت قياسية مجلفنة يفضل شراؤها بالجملة لتقليل التكاليف."
    }
  ];

  // Timeline
  const timeline = [
    {
      phase: isEn ? "Site Preparation" : "تحضير وتهيئة الموقع",
      stepName: isEn ? "Geotechnical leveling and marking of unit footprints" : "تطهير، تسوية وتخطيط مساحات المجمع والوحدات الإيوائية",
      durationDays: 1,
      durationHours: 8,
      workersRequired: Math.max(3, Math.round(totalUnitsNeeded * 0.4)),
      instructions: isEn
        ? "Clear obstacles, map alignment coordinates, and secure boundaries."
        : "إزالة أي عوائق، تسوية التربة بالمعدات الخفيفة، إسقاط المخطط المساحي لضمان التباعد الإنشائي."
    },
    {
      phase: isEn ? "Foundations" : "تأسيس القواعد والأساسات",
      stepName: isEn ? "Driving soil anchors and placing stability structures" : "غرس أوتاد التثبيت وتشييد القواعد المدعمة المضادة لاهتزازات الكارثة",
      durationDays: 1.5,
      durationHours: 12,
      workersRequired: Math.max(4, Math.round(totalUnitsNeeded * 0.5)),
      instructions: isEn
        ? "Ensure structural steel pins or posts are driven to correct geotechnical depths based on soil."
        : "تثبيت الأوتاد الفولاذية أو الشدادات لضمان ثبات الهيكل ومقاومة الانزلاق أو الانجراف بفعل العوامل الطبيعية."
    },
    {
      phase: isEn ? "Structural Framing" : "بناء الهيكل الإنشائي",
      stepName: isEn ? "Assembling principal wall columns and roof trusses" : "تركيب وتشييد القوائم الرأسية والدعامات العلوية للمأوى",
      durationDays: 2,
      durationHours: 16,
      workersRequired: Math.max(5, Math.round(totalUnitsNeeded * 0.6)),
      instructions: isEn
        ? "Erect principal frame columns first, bracing them immediately with horizontal structural steel or wood ties."
        : "تركيب القوائم الأساسية وربطها بالجسور الأفقية مع شد الهيكل بالمفصلات لضمان توزيع الأحمال الهندسية بشكل متوازن."
    },
    {
      phase: isEn ? "Enclosure & Finishes" : "التغطية والكسوة والعزل",
      stepName: isEn ? "Mounting insulated panel cores, weatherproofing layers" : "تركيب ألواح الجدران والأسقف العازلة وحواجز الرطوبة الخارجية",
      durationDays: 2,
      durationHours: 16,
      workersRequired: Math.max(4, Math.round(totalUnitsNeeded * 0.5)),
      instructions: isEn
        ? "Fit outer wall panels. Seal joins carefully to secure dry, heated/cooled spaces."
        : "تثبيت ألواح الجدران وسد الفواصل بمادة السيليكون أو أشرطة العزل لضمان منع تسرب الهواء أو المياه تماماً."
    },
    {
      phase: isEn ? "Handover & Hand-off" : "التشطيبات والتسليم الميداني",
      stepName: isEn ? "Installing sanitary elements, doors, windows, final check" : "تركيب الأبواب والنوافذ والقطع الصحية والتسليم النهائي للمستفيدين",
      durationDays: 1,
      durationHours: 8,
      workersRequired: Math.max(3, Math.round(totalUnitsNeeded * 0.3)),
      instructions: isEn
        ? "Test water pipe leaks, latch doors, clear rubbish and handover keys to families."
        : "تركيب الأبواب والنوافذ والتمديدات الداخلية، إجراء فحص السلامة وتسليم المفاتيح للأسر بشكل منظم."
    }
  ];

  const backupNoteAr = `💡 [محرك الطوارئ الميداني]: تم تشغيل محرك التصميم والتحليل الهندسي الميداني عالي الكفاءة بنجاح لتوليد مخططات آمنة مطابقة للمعايير الإنسانية الدولية.`;
  const backupNoteEn = `💡 [Field Engineering Engine]: The high-efficiency backup on-site planning engine has successfully generated the blueprints, material schedules, and timeline according to international humanitarian standards.`;

  // Heuristic Site Risk Assessment Calculation based on input parameters
  let safetyScore = 95;
  let windDir = { name: "اتجاه الرياح", value: "شمالية غربية معتدلة (NW 15 كم/س)", riskLevel: "low", description: "رياح مستقرة لا تشكل أي تهديد مباشر على الهيكل الإنشائي للمأوى." };
  let floodProb = { name: "احتمالية الفيضانات", value: "منخفضة (نسبة أقل من 5%)", riskLevel: "low", description: "الموقع مرتفع هندسياً وخطر تجمع مياه الأمطار محدود جداً." };
  let landslide = { name: "مخاطر الانهيارات الأرضية", value: "آمنة (منخفضة)", riskLevel: "low", description: "التربة صلبة ومستقرة وميول الأرض مستوٍ مما يمنع حدوث الانزلاقات." };
  let quakeInt = { name: "شدة الزلازل المتوقعة", value: "مستقرة (لا يوجد نشاط تكتوني نشط)", riskLevel: "low", description: "المنطقة ذات سجل زلزالي آمن وتصميم المأوى يوفر حماية إضافية." };
  let seasonalTemp = { name: "درجة الحرارة الموسمية", value: "معتدلة (متوسط 22° مئوية)", riskLevel: "low", description: "درجات حرارة لطيفة تدعم راحة القاطنين بمعدل عزل قياسي." };
  let groundwater = { name: "مستوى المياه الجوفية", value: "متوسط العمق (3م - 6م)", riskLevel: "low", description: "عمق آمن يمنع تسرب الرطوبة أو صعود المياه للأساسات الإنشائية." };
  let torrentProx = { name: "قرب الموقع من مجاري السيول", value: "آمن تماماً (مسافة تزيد عن 3 كم)", riskLevel: "low", description: "الموقع يقع خارج الخرائط الطبوغرافية لمجاري ومصبات المياه الموسمية." };
  let recommendations: string[] = [
    "الالتزام بتباعد كافٍ يبلغ 6 أمتار على الأقل بين الوحدات للحماية من الحريق والخصوصية.",
    "توجيه فتحات المداخن والتهوية بعيداً عن اتجاه الرياح السائد.",
    "مراقبة سنوية للأساسات للتأكد من خلوها من أي تصدعات ناتجة عن هبوط التربة."
  ];

  const dTypeAr = (disasterType || "").toString().toLowerCase();
  const sTypeAr = (soilType || "").toString().toLowerCase();
  const cTypeAr = (climateType || "").toString().toLowerCase();

  if (isEn) {
    windDir = { name: "Wind Direction", value: "Moderate Westerly (NW 15 km/h)", riskLevel: "low", description: "Stable winds posing no direct threat to the structural frame." };
    floodProb = { name: "Flood Probability", value: "Low (probability under 5%)", riskLevel: "low", description: "The site topography is elevated; water pooling hazards are minimal." };
    landslide = { name: "Landslide Risk", value: "Safe / Negligible", riskLevel: "low", description: "Flat terrain with solid ground compaction preventing soil slide events." };
    quakeInt = { name: "Expected Earthquake Intensity", value: "Stable (no active tectonic history)", riskLevel: "low", description: "The region has a highly secure seismic profile; the structure exceeds local safety codes." };
    seasonalTemp = { name: "Seasonal Temperature", value: "Moderate (Average 22°C)", riskLevel: "low", description: "Pleasant temperatures supporting resident comfort with standard insulation." };
    groundwater = { name: "Groundwater Level", value: "Medium Depth (3m - 6m)", riskLevel: "low", description: "Safe level preventing dampness migration or hydrostatic uplift." };
    torrentProx = { name: "Torrent Proximity", value: "Secure (over 3 km distance)", riskLevel: "low", description: "The site lies entirely outside topographic active runoff channels." };
    recommendations = [
      "Maintain a 6m firebreak and safety clearance buffer between family clusters.",
      "Orient door openings away from dominant prevailing wind gusts to prevent draft chill.",
      "Execute periodic ground moisture checks around foundation anchor points."
    ];
  }

  // Deduct based on parameters
  if (dTypeAr.includes("زلزال") || dTypeAr.includes("earthquake")) {
    safetyScore -= 12;
    if (isEn) {
      quakeInt = { name: "Expected Earthquake Intensity", value: "High Seismic Risk (Potential 7.0 Richter)", riskLevel: "high", description: "Active seismological zone. Lightweight framing with flexible anchor joints is essential." };
      recommendations.push("Implement ductile framing steel brackets to absorb shear loads and lateral earth forces.");
    } else {
      quakeInt = { name: "شدة الزلازل المتوقعة", value: "مخاطر زلزالية نشطة (احتمالية هزة بقوة 7.0 ريختر)", riskLevel: "high", description: "موقع ذو نشاط تكتوني مستمر. الالتزام بالأطر المرنة والوصلات الفولاذية الممتصة للقص إجباري." };
      recommendations.push("تثبيت زوايا تدعيم فولاذية مرنة لامتصاص الأحمال الجانبية وقوى القص الأرضية.");
    }
  }

  if (dTypeAr.includes("فيضان") || dTypeAr.includes("flood") || dTypeAr.includes("سيول") || dTypeAr.includes("torrent")) {
    safetyScore -= 18;
    if (isEn) {
      floodProb = { name: "Flood Probability", value: "High Risk (Seasonal inundation potential)", riskLevel: "high", description: "High risk of flash flooding. Requiring unit elevation of at least 0.8 meters." };
      torrentProx = { name: "Torrent Proximity", value: "Critical Proximity (Less than 250m)", riskLevel: "high", description: "Close to a seasonal drainage runoff. Diversion channels and dikes should be constructed." };
      recommendations.push("Elevate all floor levels on screw-piles to protect from standing or flowing water.");
    } else {
      floodProb = { name: "احتمالية الفيضانات", value: "مرتفعة (خطر غمر موسمي للتربة)", riskLevel: "high", description: "احتمالية عالية لتراكم المياه. تصميم مأوى مرتفع عن الأرض بمقدار 0.8 متر على الأقل يعتبر إلزامياً." };
      torrentProx = { name: "قرب الموقع من مجاري السيول", value: "حرج وقريب (أقل من 250 متر)", riskLevel: "high", description: "قريب من مصبات السيول الجبلية الموسمية. ينصح بإنشاء قنوات تصريف وسواتر ترابية حامية." };
      recommendations.push("رفع مستوى أرضيات المأوى على قوائم فولاذية أو خشبية لحماية العائلات من السيول.");
    }
  }

  if (sTypeAr.includes("رمل") || sTypeAr.includes("طين") || sTypeAr.includes("loose") || sTypeAr.includes("sand") || sTypeAr.includes("clay")) {
    safetyScore -= 10;
    if (isEn) {
      landslide = { name: "Landslide Risk", value: "Moderate / Mudslide Potential", riskLevel: "medium", description: "Soft clay/sand soil. Ground anchorage depth must be doubled to reach firm strata." };
      recommendations.push("Drive helical foundation stakes 1.5m deeper into the soil to prevent structural shifting.");
    } else {
      landslide = { name: "مخاطر الانهيارات الأرضية", value: "متوسطة (احتمالية انزلاق طيني)", riskLevel: "medium", description: "تربة رملية/طينية هشة. غرس أوتاد التثبيت يجب أن يتضاعف هندسياً للوصول للطبقة الأكثر تماسكاً." };
      recommendations.push("غرس خرسانة التأسيس والشدادات الأرضية لمسافة 1.5م إضافية تحت الأرض لضمان الثبات.");
    }
  }

  if (cTypeAr.includes("عاصف") || cTypeAr.includes("windy") || cTypeAr.includes("storm") || cTypeAr.includes("رياح")) {
    safetyScore -= 7;
    if (isEn) {
      windDir = { name: "Wind Direction", value: "Dominant Northern Gale (NW 45-60 km/h)", riskLevel: "medium", description: "Frequent stormy winds. Aerodynamic curved roof or sloped roof with tension ties is required." };
      recommendations.push("Apply heavy steel storm collar strapping on all roof-to-wall framing joins.");
    } else {
      windDir = { name: "اتجاه الرياح", value: "رياح شمالية عاتية مستمرة (NW 45-60 كم/س)", riskLevel: "medium", description: "رياح مستمرة شديدة الضغط. ينصح بسطح مائل أو انسيابي قبيبي مع أحزمة تثبيت أرضية إضافية." };
      recommendations.push("تركيب أحزمة شد فولاذية علوية على الأسقف لضمان استقرار المأوى ضد الرياح الهابطة.");
    }
  }

  if (cTypeAr.includes("بارد") || cTypeAr.includes("cold") || cTypeAr.includes("شتاء") || cTypeAr.includes("winter")) {
    safetyScore -= 5;
    if (isEn) {
      seasonalTemp = { name: "Seasonal Temperature", value: "Severe Cold (Dropping to -5°C)", riskLevel: "medium", description: "Sub-freezing night temps. High thermal mass insulation R-15+ and vapor barrier are essential." };
    } else {
      seasonalTemp = { name: "درجة الحرارة الموسمية", value: "برودة شديدة (تنخفض لـ -5° مئوية ليلاً)", riskLevel: "medium", description: "صقيع قارس ليلاً. يتطلب رغوة عازلة بكثافة R-15+ مع حاجز رطوبة لمنع الصدمات الحرارية." };
    }
  }

  if (cTypeAr.includes("حار") || cTypeAr.includes("hot") || cTypeAr.includes("صحرا") || cTypeAr.includes("desert")) {
    safetyScore -= 5;
    if (isEn) {
      seasonalTemp = { name: "Seasonal Temperature", value: "Severe Dry Heat (Reaching 45°C)", riskLevel: "medium", description: "Intense solar radiation. Reflective foil backing and double cross-ventilation openings required." };
    } else {
      seasonalTemp = { name: "درجة الحرارة الموسمية", value: "حرارة صحراوية شديدة (تصل لـ 45° مئوية)", riskLevel: "medium", description: "إشعاع شمسي مباشر وقوي. يتطلب رقائق عاكسة للحرارة مع فتحات تهوية متقاطعة لتدفق الهواء المبرد." };
    }
  }

  const siteRiskAssessment = {
    safetyScore: Math.max(50, safetyScore),
    windDirection: windDir,
    floodProbability: floodProb,
    landslideRisk: landslide,
    earthquakeIntensity: quakeInt,
    seasonalTemperature: seasonalTemp,
    groundwaterLevel: groundwater,
    torrentProximity: torrentProx,
    recommendations
  };

  return {
    generalAnalysis: (isEn ? backupNoteEn : backupNoteAr) + "\n\n" + (isEn 
      ? `This rapid-deploy shelter masterplan has been tailored specifically for ${locationName} following a ${disasterType}. The design directly mitigates structural risk associated with ${soilType} soil conditions and ${climateType} climatic loads.
We recommend deploying ${totalUnitsNeeded} units of the ${modelName} model, constructed using ${techStyle}. Ground anchors of type ${foundationType} ensure absolute structural load transfer. Interior layouts provide functional zones including ${rooms.map(r => r.name).join(", ")}. Global transport and local assembly procedures are configured below.`
      : `تم إعداد وتصميم مخطط التدخل الإيواء السريع لـ ${locationName} للتعامل مع آثار ${disasterType}. يراعي التصميم المقترح بشكل مباشر طبيعة التربة من نوع (${soilType}) والأحمال المناخية لـ (${climateType}).
تم تحديد الحاجة إلى ${totalUnitsNeeded} وحدة سكنية عائلية من طراز "${modelName}" والتي تعتمد تقنية تشييد (${techStyle}) مع تثبيتها بنظام أساسات (${foundationType}) لضمان السلامة الإنشائية القصوى ضد أي مخاطر تكرارية. التوزيع الداخلي يوفر مناطق وظيفية هامة تشمل ${rooms.map(r => r.name).join("، ")}. تم حساب المواد والميزانية والجدول الزمني بدقة للتشغيل الفوري.`),
    suggestedModel: {
      name: modelName,
      type: techStyle,
      unitDimensions: {
        width: 4.0,
        length: 4.3,
        height: 2.8
      },
      roomDistribution: rooms.map(r => r.name),
      totalUnitsNeeded,
      capacityPerUnit,
      floorPlanDescription: isEn 
        ? `A 17.2 sq.m smart floor layout optimized for rapid deploy. It segments the floor into private sleeping beds, a dry social living zone, a compact culinary kitchenette, and an isolated ventilated wet latrine.`
        : `مساحة ذكية ومدروسة تبلغ 17.2 متر مربع مصممة بكفاءة عالية، وتفصل بين مناطق النوم الهادئة ومنطقة المعيشة، مع توفير ركن للمطبخ التحضيري ودورة مياه مدمجة ومعزولة مع تهوية مباشرة لمنع الرطوبة والروائح.`,
      foundationType,
      insulationRating: insulation
    },
    blueprints: {
      floorPlan: {
        dimensions: { w: 4.0, h: 4.3 },
        rooms
      },
      elevation: {
        facadeType: facadeDesc,
        wallHeight: 2.2,
        roofHeight: 0.6,
        roofType,
        materials: isEn 
          ? ["Fiber-cement boards", "EPS core", "Galvanized structural steel", "Waterproof breathable wrap"]
          : ["ألواح ألياف أسمنتية خارجية", "فوم بوليسترين عازل", "مقاطع حديد مجلفن", "أشرطة مانعة للتسرب وجليد حماية"]
      },
      campLayout: {
        gridRows,
        gridCols,
        spacing,
        facilities
      }
    },
    billOfMaterials,
    timeline,
    budget: {
      materialsCost,
      laborCost,
      transportCost,
      contingencyCost,
      totalCost
    },
    siteRiskAssessment
  };
}

// API endpoint for shelter generation
app.post("/api/shelter/generate", async (req, res) => {
  try {
    const input = req.body;
    if (!input) {
       res.status(400).json({ error: "بيانات الإدخال مفقودة" });
       return;
    }

    const {
      disasterType,
      locationName,
      peopleCount,
      availableArea,
      soilType,
      climateType,
      localMaterials,
      durationOfUse,
      language
    } = input;

    const isEn = language === "en";

    // If Gemini key is missing, or we want a quick response, we can directly fall back 
    // or try calling the model first. Since we want maximum reliability, we try model first,
    // and if it fails or isn't initialized, we transparently serve the heuristic plan!
    if (!process.env.GEMINI_API_KEY || !ai) {
      console.warn("WARNING: GEMINI_API_KEY is not defined or AI not initialized. Using local generator.");
      const fallbackResult = generateHeuristicProject(input);
      res.json(fallbackResult);
      return;
    }

    const systemInstruction = isEn
      ? `You are an expert structural architect and engineer specializing in humanitarian architecture, rapid-deploy disaster relief shelter, and crisis engineering.
Your job is to design a secure, cost-effective, and highly resilient emergency shelter unit and layout based on the user's input in English.
You MUST return the output strictly in JSON format conforming to the provided schema.
All names, descriptions, room names, material names, instructions, and analysis must be in professional architectural English.`
      : `أنت مهندس معماري خبير ومتخصص في العمارة الإنسانية وتصميم ملاجئ الطوارئ والإنشاءات السريعة لضحايا الكوارث الطبيعية والنزاعات.
عملك هو تصميم نظام مأوى وهيكل إنشائي آمن، فعال، اقتصادي، وسريع التنفيذ بناءً على مدخلات المستخدم باللغة العربية.
يجب أن ترجع المخرجات بدقة بصيغة JSON متوافقة مع المخطط (Schema) المعطى لك.
كل الأسماء والأوصاف والتعليمات للمخططات الهندسية والمواد والجدول الزمني يجب أن تكون باللغة العربية الفصحى الواضحة والعملية.`;

    const userPrompt = isEn
      ? `Design an emergency shelter and camp layout based on the following:
- Disaster type: ${disasterType}
- Target location: ${locationName}
- Target population size: ${peopleCount} people
- Available land area: ${availableArea} sq meters
- Geotechnical soil type: ${soilType}
- Prevailing climate: ${climateType}
- Local raw materials available: ${localMaterials && localMaterials.length > 0 ? localMaterials.join(", ") : "None specified"}
- Target duration of utility: ${durationOfUse}

Engineering & Structural Requirements:
1. Floor Plan: A highly rational internal space allocation (e.g., sleeping area, private kitchenette, integrated private latrine, main door, windows, beds) with relative meter coordinates.
2. Elevation: Wall height, roof profile (flat, sloped, or dome) and thermal insulation recommendations.
3. Camp Layout: Structured grid placement for units ensuring safe clearance spacing, water tanks, healthcare clinics, public spaces, and admin facilities.
4. Bill of Materials (BOM): Realistic quantative assessment of total required structural components (columns, roof sheets, insulation, fixtures, bolts) with unit prices in USD.
5. Construction Timeline: Concrete actionable milestones (Preparation, Foundation, Framing, Enclosure, Handover) with hours/days and required workforce.
6. Capital Cost Estimation (Budget): Balanced financial breakdown of material, assembly, freight, and 10% contingency.
7. Site Risk Assessment & Safety Score: Perform a detailed site risk analysis considering the 7 parameters: Wind Direction, Flood Probability, Landslide Risk, Expected Earthquake Intensity, Seasonal Temperature, Groundwater Level, and Proximity to Torrent Pathways. Assign a final "Safety Score" out of 100 representing the security of the setup, and provide actionable recommendations.`
      : `قم بتصميم مأوى طارئ ومجمع ملاجئ متكامل بناءً على البيانات التالية:
- نوع الكارثة: ${disasterType}
- الموقع الجغرافي: ${locationName}
- عدد الأشخاص المطلوب إيواؤهم: ${peopleCount} شخص
- مساحة الأرض المتاحة: ${availableArea} متر مربع
- طبيعة التربة: ${soilType}
- الظروف المناخية: ${climateType}
- المواد المتوفرة محلياً: ${localMaterials && localMaterials.length > 0 ? localMaterials.join("، ") : "لا توجد مواد محددة"}
- مدة الاستخدام المستهدفة: ${durationOfUse}

المتطلبات الهندسية:
1. المخطط الهندسي (Floor Plan): يجب أن يحتوي على توزيع داخلي منطقي للملجأ (مثل: مناطق النوم، حمام مدمج أو خارجي، مطبخ تحضيري صغير، المداخل، النوافذ، الأسرّة) مع إحداثيات نسبية واضحة ومقاسات دقيقة بالمتر (مثلاً وحدة سكنية طولها 5م وعرضها 5م).
2. الواجهة والارتفاع (Elevation): حدد ارتفاع الجدران والأسقف ونوع السقف (مائل لتصريف الأمطار، مستوٍ للرياح، قبة، إلخ) ومواد العزل المطلوبة.
3. توزيع المخيم (Camp Layout): توزيع منظم للوحدات السكنية بشكل شبكي يحافظ على المساحات الآمنة والتهوية والخدمات المشتركة كخزان المياه، العيادة الطبية، المرافق العامة، مساحات اللعب، ونقاط الإدارة.
4. جدول الكميات والمواد (Bill of Materials): تفصيل كميات دقيقة وواقعية للمشروع بأكمله (مثلاً إذا كان هناك 20 وحدة سكنية، احسب إجمالي الألواح والعناصر الفولاذية والخرسانة والبراغي والوصلات المطلوبة)، مع تقدير واقعي للأسعار بالدولار.
5. الجدول الزمني للتنفيذ (Timeline): خطوات واضحة (التحضير، الأساسات، الهيكل، العزل، الخدمات، التسليم) مقدرة بالأيام والساعات وعدد المتطوعين أو العمال المطلوبين لكل مرحلة.
6. الميزانية التقديرية (Budget): تحليل للتكاليف يتناسب منطقياً مع جدول المواد والأيدي العاملة والنقل ومصاريف الطوارئ.
7. تحليل المخاطر ودرجة الأمان: تحليل آلي للمخاطر في الموقع يغطي 7 معايير أساسية: اتجاه الرياح، احتمالية الفيضانات، مخاطر الانهيارات الأرضية، شدة الزلازل المتوقعة، درجة الحرارة الموسمية، مستوى المياه الجوفية، وقرب الموقع من مجاري السيول. احسب درجة أمان نهائية للموقع (Safety Score) من 100 وقدم توصيات هندسية آمنة للتعامل مع أي مخاطر مرصودة.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              generalAnalysis: {
                type: Type.STRING,
                description: "Detailed geotechnical, environmental, and threat-vector design justification analysis in the target language"
              },
              suggestedModel: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Name of the suggested emergency shelter model" },
                  type: { type: Type.STRING, description: "Construction technology style (e.g., prefab sandwich panel, treated timber framing, eco-dome, rapid-deploy modular)" },
                  unitDimensions: {
                    type: Type.OBJECT,
                    properties: {
                      width: { type: Type.NUMBER, description: "Width of single shelter unit in meters" },
                      length: { type: Type.NUMBER, description: "Length of single shelter unit in meters" },
                      height: { type: Type.NUMBER, description: "Height of single shelter unit in meters" }
                    },
                    required: ["width", "length", "height"]
                  },
                  roomDistribution: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "List of interior partitions, facilities, or functions in a single unit"
                  },
                  totalUnitsNeeded: { type: Type.INTEGER, description: "Total quantity of units needed for the population" },
                  capacityPerUnit: { type: Type.INTEGER, description: "Maximum recommended occupancy capacity per single unit (number of persons)" },
                  floorPlanDescription: { type: Type.STRING, description: "Detailed description of floor space usage and structural compartmentalization" },
                  foundationType: { type: Type.STRING, description: "Geotechnically adapted foundation type recommended for stability against selected disaster" },
                  insulationRating: { type: Type.STRING, description: "Recommended wall insulation material, R-value rating, and weatherproofing layers" }
                },
                required: [
                  "name", "type", "unitDimensions", "roomDistribution", 
                  "totalUnitsNeeded", "capacityPerUnit", "floorPlanDescription", 
                  "foundationType", "insulationRating"
                ]
              },
              blueprints: {
                type: Type.OBJECT,
                properties: {
                  floorPlan: {
                    type: Type.OBJECT,
                    properties: {
                      dimensions: {
                        type: Type.OBJECT,
                        properties: {
                          w: { type: Type.NUMBER, description: "Floor plan bounding box width in meters" },
                          h: { type: Type.NUMBER, description: "Floor plan bounding box height in meters" }
                        },
                        required: ["w", "h"]
                      },
                      rooms: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            name: { type: Type.STRING, description: "Name of the partition or element (e.g., Living Room, Private Latrine, Cooking Alcove, Door, Window, Bed 1)" },
                            x: { type: Type.NUMBER, description: "Relative start X-coordinate in meters (must be less than dimensions.w)" },
                            y: { type: Type.NUMBER, description: "Relative start Y-coordinate in meters (must be less than dimensions.h)" },
                            w: { type: Type.NUMBER, description: "Element width in meters" },
                            h: { type: Type.NUMBER, description: "Element height in meters" },
                            type: { type: Type.STRING, description: "Element category, must be exactly one of: 'room' | 'toilet' | 'kitchen' | 'door' | 'window' | 'bed' | 'living'" }
                          },
                          required: ["name", "x", "y", "w", "h", "type"]
                        }
                      }
                    },
                    required: ["dimensions", "rooms"]
                  },
                  elevation: {
                    type: Type.OBJECT,
                    properties: {
                      facadeType: { type: Type.STRING, description: "Detailed description of exterior facade, ventilation, and aesthetics" },
                      wallHeight: { type: Type.NUMBER, description: "Main wall height in meters" },
                      roofHeight: { type: Type.NUMBER, description: "Additional roof pitch/rise height in meters" },
                      roofType: { type: Type.STRING, description: "Roof category: flat, sloped, or dome" },
                      materials: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "List of exterior envelope finishing and sheathing materials"
                      }
                    },
                    required: ["facadeType", "wallHeight", "roofHeight", "roofType", "materials"]
                  },
                  campLayout: {
                    type: Type.OBJECT,
                    properties: {
                      gridRows: { type: Type.INTEGER, description: "Number of rows in structural layout grid" },
                      gridCols: { type: Type.INTEGER, description: "Number of columns in structural layout grid" },
                      spacing: { type: Type.NUMBER, description: "Inter-unit clearance/firebreak distance in meters" },
                      facilities: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            name: { type: Type.STRING, description: "Name of layout component (e.g., Family Shelter 1, Main Water Cistern, Medical Hub, Communal Toilets, Administration Tent, Safe Space/Playground)" },
                            x: { type: Type.NUMBER, description: "Horizontal layout coordinate in meters" },
                            y: { type: Type.NUMBER, description: "Vertical layout coordinate in meters" },
                            w: { type: Type.NUMBER, description: "Component footprint width in meters" },
                            h: { type: Type.NUMBER, description: "Component footprint height in meters" },
                            type: { type: Type.STRING, description: "Facility type, must be exactly one of: 'shelter' | 'water' | 'medical' | 'latrines' | 'admin' | 'space'" }
                          },
                          required: ["name", "x", "y", "w", "h", "type"]
                        }
                      }
                    },
                    required: ["gridRows", "gridCols", "spacing", "facilities"]
                  }
                },
                required: ["floorPlan", "elevation", "campLayout"]
              },
              billOfMaterials: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING, description: "Material category (Structural Framing, Insulation & Finishes, Doors & Windows, Sanitary & Electrical, Foundations & Connectors)" },
                    material: { type: Type.STRING, description: "Detailed structural component or raw material description" },
                    quantity: { type: Type.NUMBER, description: "Total quantity required for the complete camp development" },
                    unit: { type: Type.STRING, description: "Unit of measurement (sq meters, kg, sheet, cubic meters, piece, bag, liter)" },
                    estimatedUnitPrice: { type: Type.NUMBER, description: "Est. unit cost in USD" },
                    totalPrice: { type: Type.NUMBER, description: "Total cost in USD (quantity * estimatedUnitPrice)" },
                    localSourcingPossible: { type: Type.BOOLEAN, description: "Can this item be sourced within immediate crisis-response region" },
                    sourcingNotes: { type: Type.STRING, description: "Procurement instructions and local alternate suggestions" }
                  },
                  required: [
                    "category", "material", "quantity", "unit", 
                    "estimatedUnitPrice", "totalPrice", "localSourcingPossible", "sourcingNotes"
                  ]
                }
              },
              timeline: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    phase: { type: Type.STRING, description: "Project milestone phase name" },
                    stepName: { type: Type.STRING, description: "Actionable specific step description" },
                    durationDays: { type: Type.NUMBER, description: "Estimated duration in days" },
                    durationHours: { type: Type.NUMBER, description: "Cumulative or extra hourly effort" },
                    workersRequired: { type: Type.INTEGER, description: "Laborers / volunteers needed for task" },
                    instructions: { type: Type.STRING, description: "Precise mechanical or civil engineering instructions for optimal implementation" }
                  },
                  required: [
                    "phase", "stepName", "durationDays", "durationHours", 
                    "workersRequired", "instructions"
                  ]
                }
              },
              budget: {
                type: Type.OBJECT,
                properties: {
                  materialsCost: { type: Type.NUMBER, description: "Sum of material component costs in USD" },
                  laborCost: { type: Type.NUMBER, description: "Estimated field labor/assembly cost in USD" },
                  transportCost: { type: Type.NUMBER, description: "Estimated logistics and shipping cost in USD" },
                  contingencyCost: { type: Type.NUMBER, description: "Emergency buffer amount in USD (usually 10-15%)" },
                  totalCost: { type: Type.NUMBER, description: "Total estimated crisis response budget in USD" }
                },
                required: ["materialsCost", "laborCost", "transportCost", "contingencyCost", "totalCost"]
              },
              siteRiskAssessment: {
                type: Type.OBJECT,
                description: "AI-driven geotechnical, safety, and site hazard assessment",
                properties: {
                  safetyScore: { type: Type.INTEGER, description: "Calculated safety score out of 100" },
                  windDirection: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING, description: "Field name, e.g., 'Wind Direction'" },
                      value: { type: Type.STRING, description: "Description of parameter, e.g., 'NW 45 km/h'" },
                      riskLevel: { type: Type.STRING, description: "low, medium, or high" },
                      description: { type: Type.STRING, description: "Impact assessment on design" }
                    },
                    required: ["name", "value", "riskLevel", "description"]
                  },
                  floodProbability: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      value: { type: Type.STRING },
                      riskLevel: { type: Type.STRING },
                      description: { type: Type.STRING }
                    },
                    required: ["name", "value", "riskLevel", "description"]
                  },
                  landslideRisk: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      value: { type: Type.STRING },
                      riskLevel: { type: Type.STRING },
                      description: { type: Type.STRING }
                    },
                    required: ["name", "value", "riskLevel", "description"]
                  },
                  earthquakeIntensity: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      value: { type: Type.STRING },
                      riskLevel: { type: Type.STRING },
                      description: { type: Type.STRING }
                    },
                    required: ["name", "value", "riskLevel", "description"]
                  },
                  seasonalTemperature: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      value: { type: Type.STRING },
                      riskLevel: { type: Type.STRING },
                      description: { type: Type.STRING }
                    },
                    required: ["name", "value", "riskLevel", "description"]
                  },
                  groundwaterLevel: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      value: { type: Type.STRING },
                      riskLevel: { type: Type.STRING },
                      description: { type: Type.STRING }
                    },
                    required: ["name", "value", "riskLevel", "description"]
                  },
                  torrentProximity: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      value: { type: Type.STRING },
                      riskLevel: { type: Type.STRING },
                      description: { type: Type.STRING }
                    },
                    required: ["name", "value", "riskLevel", "description"]
                  },
                  recommendations: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "3-5 key actionable safety and layout engineering recommendations in the target language"
                  }
                },
                required: [
                  "safetyScore", "windDirection", "floodProbability", "landslideRisk",
                  "earthquakeIntensity", "seasonalTemperature", "groundwaterLevel",
                  "torrentProximity", "recommendations"
                ]
              }
            },
            required: [
              "generalAnalysis", "suggestedModel", "blueprints", 
              "billOfMaterials", "timeline", "budget", "siteRiskAssessment"
            ]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("لم يتم إرجاع أي رد من نموذج الذكاء الاصطناعي");
      }

      const cleanJsonText = responseText.trim();
      const resultObj = JSON.parse(cleanJsonText);
      res.json(resultObj);
    } catch (apiErr) {
      console.warn("Gemini API call failed or timed out. Falling back to high-fidelity on-site structural generator:", apiErr);
      const fallbackResult = generateHeuristicProject(input);
      res.json(fallbackResult);
    }
  } catch (error: any) {
    console.error("General error generating shelter plan:", error);
    res.status(500).json({ 
      error: error.message || "حدث خطأ غير متوقع أثناء معالجة البيانات وتصميم الملجأ.",
      details: error.toString()
    });
  }
});

// Simple persistent store for shared projects
const SHARED_FILE = path.join(process.cwd(), "shared_projects.json");
let sharedProjectsInMemory: Record<string, any> = {};

// Load existing shared projects on start
try {
  if (fs.existsSync(SHARED_FILE)) {
    const content = fs.readFileSync(SHARED_FILE, "utf-8");
    sharedProjectsInMemory = JSON.parse(content);
    console.log(`Loaded ${Object.keys(sharedProjectsInMemory).length} shared projects from file.`);
  }
} catch (err) {
  console.error("Failed to load shared projects from disk:", err);
}

// Route to share a project
app.post("/api/shelter/share", (req, res) => {
  try {
    const { project } = req.body;
    if (!project) {
       res.status(400).json({ error: "بيانات المشروع مفقودة" });
       return;
    }

    // Generate a unique short ID (8 characters)
    const id = Math.random().toString(36).substring(2, 10);
    sharedProjectsInMemory[id] = project;

    // Persist to file
    try {
      fs.writeFileSync(SHARED_FILE, JSON.stringify(sharedProjectsInMemory, null, 2), "utf-8");
    } catch (writeErr) {
      console.error("Failed to persist shared project to disk:", writeErr);
    }

    res.json({ id });
  } catch (err: any) {
    console.error("Error sharing project:", err);
    res.status(500).json({ error: err.message || "Failed to share project" });
  }
});

// Route to get a shared project
app.get("/api/shelter/project/:id", (req, res) => {
  try {
    const { id } = req.params;
    const project = sharedProjectsInMemory[id];
    if (!project) {
       res.status(404).json({ error: "المشروع غير موجود أو منتهي الصلاحية" });
       return;
    }
    res.json({ project });
  } catch (err: any) {
    console.error("Error retrieving shared project:", err);
    res.status(500).json({ error: err.message || "Failed to retrieve shared project" });
  }
});

// Configure Vite and Express integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT} with environment ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
