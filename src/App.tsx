import { useState, useEffect } from "react";
import { 
  Shield, 
  MapPin, 
  Users, 
  Maximize, 
  Layers, 
  Sun, 
  Hammer, 
  Clock, 
  FileText, 
  Download, 
  Check, 
  ChevronRight, 
  RefreshCcw, 
  AlertCircle, 
  FileSpreadsheet, 
  Share2, 
  Grid,
  TrendingUp,
  Search,
  Filter,
  Info,
  Globe
} from "lucide-react";
import { ShelterProject, ProjectInput } from "./types";
import { translations } from "./locales";
import ThreeDView from "./components/ThreeDView";
import BlueprintView from "./components/BlueprintView";
import SavedProjects from "./components/SavedProjects";
import InteractiveMap from "./components/InteractiveMap";

// @ts-ignore
import imgEarthquake from "./assets/images/shelter_earthquake_1782683719432.jpg";
// @ts-ignore
import imgFlood from "./assets/images/shelter_flood_1782683735711.jpg";
// @ts-ignore
import imgCold from "./assets/images/shelter_extreme_cold_1782683750427.jpg";
// @ts-ignore
import imgHeat from "./assets/images/shelter_extreme_heat_1782683765702.jpg";
// @ts-ignore
import imgGeneral from "./assets/images/shelter_general_1782683782574.jpg";

const disasterOptions = [
  "زلزال (Earthquake)",
  "فيضان (Flood)",
  "إعصار رياح (Hurricane)",
  "نزاع مسلح وحرب (Conflict/War)",
  "موجة برد قارس وثلوج (Extreme Cold)",
  "موجة حرارة مفرطة وجفاف (Extreme Heat)",
  "انهيار أرضي وطيني (Landslide)"
];

const soilOptions = [
  "صخرية متماسكة (Rocky/Solid)",
  "رملية جافة (Sandy)",
  "طينية لزجة (Clayey)",
  "هشة أو طمي غير مستقر (Loose/Silt)"
];

const climateOptions = [
  "بارد عاصف وممطر (Cold/Rainy)",
  "حار جاف وقاحل (Hot/Arid)",
  "رياح عاصفة شديدة (High Winds)",
  "أمطار موسمية وفيضانات متكررة (Monsoon/Flooding)",
  "معتدل (Moderate)"
];

const localMaterialOptions = [
  { id: "panels", label: "ألواح عازلة مسبقة الصنع (Sandwich Panels)" },
  { id: "timber", label: "ألواح خشبية وأطر خشبية (Timber)" },
  { id: "clay", label: "طوب محلي وطين طبيعي (Clay Bricks)" },
  { id: "fibers", label: "ألياف طبيعية وقصب وخيزران (Bamboo/Fibers)" },
  { id: "steel", label: "هياكل حديدية وفولاذية خفيفة (Light Steel)" },
  { id: "concrete", label: "أسمنت ورمل ومواد خرسانية (Concrete)" },
  { id: "canvas", label: "خيام وأقمشة مشمعة متينة (Heavy Canvas)" }
];

const durationOptions = [
  "مؤقتة عاجلة (1 - 3 أشهر)",
  "شبه دائم (6 - 24 شهر)",
  "دائم مستقر (أكثر من سنتين)"
];

// Rich default projects populated to give a premium immediate inspection
const defaultProjectAr: ShelterProject = {
  id: "default-earthquake",
  createdAt: new Date().toISOString(),
  input: {
    disasterType: "زلزال",
    locationName: "جبل الزاوية، إدلب - سوريا",
    peopleCount: 120,
    availableArea: 3500,
    soilType: "صخرية متماسكة",
    climateType: "بارد عاصف وممطر",
    localMaterials: ["ألواح خشبية وأطر خشبية", "خيام وأقمشة مشمعة متينة"],
    durationOfUse: "شبه دائم (6 - 24 شهر)"
  },
  generalAnalysis: "نظراً لتأثير الكارثة المتمثل في زلزال مدمر في منطقة جبل الزاوية ذات الطبيعة الصخرية المتماسكة وفي ظل طقس شتوي بارد وعاصف، فإن الهدف الهندسي الأول هو البناء السريع والآمن المقاوم للهزات الارتدادية. نوصي باعتماد هيكل أساس فولاذي خفيف أو إطار خشبي عازل لمرونته الكبيرة في امتصاص الصدمات الأرضية. المساحة الصخرية تدعم التثبيت الخارجي الممتاز دون حفر عميق، ويتطلب المناخ البارد عزل رطوبة سفلي قوي وسقوفاً مائلة للتخلص السريع من الثلوج والأمطار.",
  suggestedModel: {
    name: "مأوى الكرامة الإغاثي المعزز (Al-Karama Rapid Shelter)",
    type: "وحدات سكنية مسبقة الصنع ذات هيكل فولاذي خفيف وجدران عازلة مزدوجة",
    unitDimensions: { width: 5.0, length: 6.0, height: 2.8 },
    roomDistribution: ["غرفة معيشة ونوم عائلية رئيسية", "غرفة نوم أطفال مجهزة بأسرّة طابقية", "مطبخ تحضيري مدمج مستقل", "مرفق صحي مدمج مع تهوية وسخان ماء"],
    totalUnitsNeeded: 24,
    capacityPerUnit: 5,
    floorPlanDescription: "تصميم هندسي مرن يوفر مساحة مستقلة قدرها 30م² للأسرة الواحدة، مقسمة بشكل عقلاني لحفظ الكرامة والخصوصية مع عزل حراري ومائي متكامل ومقاومة ممتازة لعوامل المناخ.",
    foundationType: "قواعد خرسانية خفيفة جاهزة مسبقة الصنع مع ركائز فولاذية مغروسة بالتربة الصخرية",
    insulationRating: "عزل رغوي بولي يوريثان (Polyurethane 50mm) عالي الكثافة مع طبقة غشاء عازل رطوبة أرضي"
  },
  blueprints: {
    floorPlan: {
      dimensions: { w: 6.0, h: 5.0 },
      rooms: [
        { name: "غرفة المعيشة والنوم", x: 0.5, y: 0.5, w: 3.2, h: 4.0, type: "living" },
        { name: "غرفة الأطفال", x: 3.8, y: 0.5, w: 1.7, h: 2.3, type: "room" },
        { name: "مطبخ عائلي", x: 3.8, y: 2.9, w: 1.0, h: 1.6, type: "kitchen" },
        { name: "حمام ومرفق مائي", x: 4.9, y: 2.9, w: 0.6, h: 1.6, type: "toilet" },
        { name: "سرير عائلي رئيسي", x: 0.8, y: 0.8, w: 1.8, h: 1.5, type: "bed" },
        { name: "سرير أطفال طابقي", x: 3.9, y: 0.8, w: 1.5, h: 1.1, type: "bed" },
        { name: "باب رئيسي", x: 1.6, y: 4.5, w: 0.9, h: 0.1, type: "door" },
        { name: "نافذة 1", x: 1.4, y: 0.1, w: 1.0, h: 0.1, type: "window" },
        { name: "نافذة 2", x: 4.1, y: 0.1, w: 0.8, h: 0.1, type: "window" }
      ]
    },
    elevation: {
      facadeType: "واجهة معمارية عازلة مغطاة بألواح الصاج المعزول مسبق الصنع مع باب ونوافذ ألومنيوم مزدوجة الزجاج عازلة للصوت والحرارة",
      wallHeight: 2.3,
      roofHeight: 0.5,
      roofType: "sloped",
      materials: ["ألواح ساندوتش بانل مجلفنة", "أطر فولاذية مدرفلة على البارد", "نوافذ ألومنيوم مزدوجة الزجاج", "رغوة عازلة ومسامير هندسية مجلفنة"]
    },
    campLayout: {
      gridRows: 4,
      gridCols: 6,
      spacing: 6.0,
      facilities: [
        { name: "وحدة سكنية 1", x: 5, y: 5, w: 6, h: 5, type: "shelter" },
        { name: "وحدة سكنية 2", x: 15, y: 5, w: 6, h: 5, type: "shelter" },
        { name: "وحدة سكنية 3", x: 25, y: 5, w: 6, h: 5, type: "shelter" },
        { name: "وحدة سكنية 4", x: 35, y: 5, w: 6, h: 5, type: "shelter" },
        { name: "وحدة سكنية 5", x: 5, y: 15, w: 6, h: 5, type: "shelter" },
        { name: "وحدة سكنية 6", x: 15, y: 15, w: 6, h: 5, type: "shelter" },
        { name: "وحدة سكنية 7", x: 25, y: 15, w: 6, h: 5, type: "shelter" },
        { name: "وحدة سكنية 8", x: 35, y: 15, w: 6, h: 5, type: "shelter" },
        { name: "خزان مياه مشترك", x: 45, y: 5, w: 8, h: 6, type: "water" },
        { name: "نقطة عيادة ميدانية", x: 45, y: 15, w: 10, h: 8, type: "medical" },
        { name: "مبنى الإدارة الميدانية", x: 45, y: 27, w: 10, h: 7, type: "admin" },
        { name: "حمامات عامة مشتركة", x: 5, y: 27, w: 8, h: 5, type: "latrines" },
        { name: "مساحة آمنة للأطفال", x: 17, y: 25, w: 23, h: 9, type: "space" }
      ]
    }
  },
  billOfMaterials: [
    { category: "الهيكل الإنشائي", material: "أعمدة وجسور من الصلب المجلفن الخفيف (Lightweight Steel Frames)", quantity: 12600, unit: "كغ", estimatedUnitPrice: 1.2, totalPrice: 15120, localSourcingPossible: true, sourcingNotes: "شراء محلي من مصانع الحديد بالمناطق الصناعية لسرعة التسليم" },
    { category: "العزل والتشطيب", material: "ألواح عازلة بولي يوريثان مزدوج الصاج (Sandwich Panels 50mm)", quantity: 1440, unit: "لوح عازل", estimatedUnitPrice: 25.0, totalPrice: 36000, localSourcingPossible: false, sourcingNotes: "يتطلب توريداً خارجياً وتخزيناً جافاً لتجنب التلف" },
    { category: "الأبواب والنوافذ", material: "أبواب فولاذية خارجية عازلة مزودة بمفاتيح وقفل أمان", quantity: 24, unit: "قطعة", estimatedUnitPrice: 110.0, totalPrice: 2640, localSourcingPossible: true, sourcingNotes: "يمكن شراؤها من الورش المحلية القريبة لتقليل تكلفة الشحن" },
    { category: "الأبواب والنوافذ", material: "نوافذ ألمنيوم مقاومة للمطر والرياح مع زجاج عازل", quantity: 48, unit: "قطعة", estimatedUnitPrice: 80.0, totalPrice: 3840, localSourcingPossible: true, sourcingNotes: "تصنيع وتركيب بورش الألمنيوم المحلية" },
    { category: "الأساسات والأدوات والتثبيت", material: "كتل خرسانية جاهزة مسبقة الصب لتثبيت الأرجل والركائز", quantity: 96, unit: "قطعة خرسانية", estimatedUnitPrice: 15.0, totalPrice: 1440, localSourcingPossible: true, sourcingNotes: "شراء خرسانة جاهزة من خلاطات المحافظة القريبة" },
    { category: "التمديدات الصحية والكهربائية", material: "مجموعات تمديد أنابيب الصرف والمطابخ وصمامات المياه والنحاس", quantity: 24, unit: "مجموعة متكاملة", estimatedUnitPrice: 240.0, totalPrice: 5760, localSourcingPossible: true, sourcingNotes: "شراء محلي من تجار بيع مستلزمات السباكة والكهرباء" },
    { category: "الأساسات والأدوات والتثبيت", material: "براغي تجميع مجلفنة، سيليكون مقاوم مائي، زوايا تدعيم", quantity: 1, unit: "دفعة كاملة", estimatedUnitPrice: 1100.0, totalPrice: 1100, localSourcingPossible: true, sourcingNotes: "مواد تجميع قياسية متوفرة" }
  ],
  timeline: [
    { phase: "التحضير والتسوية", stepName: "إجراء المسح الهندسي وتطهير وتسوية الأرض", durationDays: 1, durationHours: 12, workersRequired: 10, instructions: "مسح تضاريس الأرض، تطهير الموقع من الأنقاض والصخور، تخطيط حدود الوحدات السكنية ومسافات الأمان." },
    { phase: "الأساسات والتدعيم", stepName: "تنزيل القواعد الخرسانية المسبقة الصب وتثبيت ركائز الدعم", durationDays: 1, durationHours: 10, workersRequired: 8, instructions: "وضع الـ96 قاعدة خرسانية جاهزة في النقاط المساحية بدقة، وزرع أوتاد التثبيت العميقة لحماية الهياكل من الهزات والرياح." },
    { phase: "تركيب الهياكل", stepName: "تركيب وتجميع أطر الهياكل الحديدية للوحدات", durationDays: 2, durationHours: 28, workersRequired: 18, instructions: "رفع الأعمدة والجسور للوحدات الـ24 وربط الزوايا الهندسية بالبراغي عالية المقاومة." },
    { phase: "التغطية والكسوة", stepName: "تثبيت ألواح الساندوتش بانل وتطبيق العوازل المائية والسيليكون", durationDays: 2, durationHours: 36, workersRequired: 22, instructions: "تلبيس جدران الوحدات والأسقف بألواح الساندوتش بانل وتأمين تداخل الوصلات، وحقن الفواصل بالسيليكون المانع للتسرب." },
    { phase: "التمديدات والخدمات", stepName: "تركيب النوافذ والأبواب، وتوصيل التمديدات الصحية والكهرباء", durationDays: 1, durationHours: 15, workersRequired: 14, instructions: "تثبيت الأبواب والنوافذ بالألمنيوم العازل، وربط تمديدات التصريف والحمامات لشبكة الصرف والمياه العامة." },
    { phase: "التسليم الميداني", stepName: "إجراء اختبارات العزل والتأمين الميداني وبدء إسكان العائلات", durationDays: 1, durationHours: 8, workersRequired: 6, instructions: "اختبار فاعلية عزل السقف من المطر وتدفق الهواء، تنظيف المجمّع وبدء تسليم المفاتيح للأسر المتضررة." }
  ],
  budget: {
    materialsCost: 65900,
    laborCost: 11000,
    transportCost: 4000,
    contingencyCost: 7500,
    totalCost: 88400
  }
};

const defaultProjectEn: ShelterProject = {
  id: "default-earthquake",
  createdAt: new Date().toISOString(),
  input: {
    disasterType: "Earthquake",
    locationName: "East Aleppo Governorate, Syria",
    peopleCount: 120,
    availableArea: 3500,
    soilType: "Rocky / Solid Ground",
    climateType: "Cold, Windy & Rainy",
    localMaterials: ["Timber Panels & Frames", "Heavy Canvas & Tarpaulin"],
    durationOfUse: "Semi-permanent (6 - 24 months)"
  },
  generalAnalysis: "Given the devastating impact of an earthquake in the East Aleppo region, featuring solid rocky ground, and amid cold and windy winter weather, the primary engineering objective is rapid and safe assembly resilient to aftershocks. We recommend adopting a lightweight steel frame or insulating timber frames due to their high flexibility in absorbing ground shocks. The rocky ground provides excellent external anchoring without deep excavations, and the cold climate requires robust underfloor moisture insulation and sloped roofs to shed snow and rainwater rapidly.",
  suggestedModel: {
    name: "Al-Karama Reinforced Emergency Shelter",
    type: "Modular prefab units with lightweight steel frames and double insulated walls",
    unitDimensions: { width: 5.0, length: 6.0, height: 2.8 },
    roomDistribution: [
      "Main family living and sleeping room",
      "Children's bedroom equipped with bunk beds",
      "Integrated independent kitchenette",
      "Private sanitary restroom with ventilation and water heater"
    ],
    totalUnitsNeeded: 24,
    capacityPerUnit: 5,
    floorPlanDescription: "Flexible engineering design providing 30m² of space per family, divided rationally to preserve dignity and privacy, with full heat and moisture insulation and excellent weather resistance.",
    foundationType: "Prefabricated lightweight concrete footings with steel anchor posts embedded in the rocky soil",
    insulationRating: "High-density polyurethane foam insulation (50mm) with a ground damp-proof membrane"
  },
  blueprints: {
    floorPlan: {
      dimensions: { w: 6.0, h: 5.0 },
      rooms: [
        { name: "Living & Sleeping Area", x: 0.5, y: 0.5, w: 3.2, h: 4.0, type: "living" },
        { name: "Children's Room", x: 3.8, y: 0.5, w: 1.7, h: 2.3, type: "room" },
        { name: "Family Kitchen", x: 3.8, y: 2.9, w: 1.0, h: 1.6, type: "kitchen" },
        { name: "Toilet & Bathroom", x: 4.9, y: 2.9, w: 0.6, h: 1.6, type: "toilet" },
        { name: "Main Double Bed", x: 0.8, y: 0.8, w: 1.8, h: 1.5, type: "bed" },
        { name: "Children Bunk Bed", x: 3.9, y: 0.8, w: 1.5, h: 1.1, type: "bed" },
        { name: "Main Entrance Door", x: 1.6, y: 4.5, w: 0.9, h: 0.1, type: "door" },
        { name: "Window 1", x: 1.4, y: 0.1, w: 1.0, h: 0.1, type: "window" },
        { name: "Window 2", x: 4.1, y: 0.1, w: 0.8, h: 0.1, type: "window" }
      ]
    },
    elevation: {
      facadeType: "Insulated architectural facade sheeted with prefabricated galvanized sandwich panels, double-glazed aluminum doors and windows for acoustic and thermal insulation",
      wallHeight: 2.3,
      roofHeight: 0.5,
      roofType: "sloped",
      materials: ["Galvanized sandwich panels", "Cold-rolled steel frames", "Double-glazed aluminum windows", "Insulating sealant foam & galvanized fasteners"]
    },
    campLayout: {
      gridRows: 4,
      gridCols: 6,
      spacing: 6.0,
      facilities: [
        { name: "Family Shelter Unit 1", x: 5, y: 5, w: 6, h: 5, type: "shelter" },
        { name: "Family Shelter Unit 2", x: 15, y: 5, w: 6, h: 5, type: "shelter" },
        { name: "Family Shelter Unit 3", x: 25, y: 5, w: 6, h: 5, type: "shelter" },
        { name: "Family Shelter Unit 4", x: 35, y: 5, w: 6, h: 5, type: "shelter" },
        { name: "Family Shelter Unit 5", x: 5, y: 15, w: 6, h: 5, type: "shelter" },
        { name: "Family Shelter Unit 6", x: 15, y: 15, w: 6, h: 5, type: "shelter" },
        { name: "Family Shelter Unit 7", x: 25, y: 15, w: 6, h: 5, type: "shelter" },
        { name: "Family Shelter Unit 8", x: 35, y: 15, w: 6, h: 5, type: "shelter" },
        { name: "Shared Water Reservoir", x: 45, y: 5, w: 8, h: 6, type: "water" },
        { name: "Field Health Clinic", x: 45, y: 15, w: 10, h: 8, type: "medical" },
        { name: "Field Administration Unit", x: 45, y: 27, w: 10, h: 7, type: "admin" },
        { name: "Shared Public Latrines", x: 5, y: 27, w: 8, h: 5, type: "latrines" },
        { name: "Safe Child-Friendly Space", x: 17, y: 25, w: 23, h: 9, type: "space" }
      ]
    }
  },
  billOfMaterials: [
    { category: "Structural Framing", material: "Lightweight galvanized steel frames for rapid on-site assembly", quantity: 12600, unit: "kg", estimatedUnitPrice: 1.2, totalPrice: 15120, localSourcingPossible: true, sourcingNotes: "Procured locally from close steel fabrication shops to accelerate delivery" },
    { category: "Insulation & Finishes", material: "Polyurethane double-sheeted sandwich panels (50mm)", quantity: 1440, unit: "panel", estimatedUnitPrice: 25.0, totalPrice: 36000, localSourcingPossible: false, sourcingNotes: "Requires external supply chain transit; store in a dry climate to avoid moisture" },
    { category: "Doors & Windows", material: "Heavy exterior insulated steel swing doors with secure keys & latches", quantity: 24, unit: "pc", estimatedUnitPrice: 110.0, totalPrice: 2640, localSourcingPossible: true, sourcingNotes: "Can be custom ordered from near local workshops to save on shipping freight" },
    { category: "Doors & Windows", material: "Aluminum weather-resistant sliding windows with double insulating glass", quantity: 48, unit: "pc", estimatedUnitPrice: 80.0, totalPrice: 3840, localSourcingPossible: true, sourcingNotes: "Standard assembly and mounting in local aluminum workshops" },
    { category: "Foundations & Connectors", material: "Precast heavy-duty concrete base block weights for stability anchoring", quantity: 96, unit: "pc", estimatedUnitPrice: 15.0, totalPrice: 1440, localSourcingPossible: true, sourcingNotes: "Order ready-mix units from local suppliers" },
    { category: "Sanitary & Electrical", material: "Plumbing pipes, drainage channels, water taps, toilet bowls & basic power wiring", quantity: 24, unit: "set", estimatedUnitPrice: 240.0, totalPrice: 5760, localSourcingPossible: true, sourcingNotes: "Purchase from close wholesale hardware supply markets" },
    { category: "Foundations & Connectors", material: "Galvanized structural fasteners, heavy silicon glue, reinforcing structural brackets", quantity: 1, unit: "lot", estimatedUnitPrice: 1100.0, totalPrice: 1100, localSourcingPossible: true, sourcingNotes: "Standard assembly components always in local stock" }
  ],
  timeline: [
    { phase: "Site prep & grading", stepName: "Topographical surveying, site debris clearance and flat leveling", durationDays: 1, durationHours: 12, workersRequired: 10, instructions: "Survey ground contours, clear boulders/rubble, and outline residential plot safe boundary separation zones." },
    { phase: "Foundation & Anchors", stepName: "Placing precast concrete deck blocks and aligning anchor post points", durationDays: 1, durationHours: 10, workersRequired: 8, instructions: "Set out the 96 precast concrete blocks, anchor steel spikes deeply to safeguard from heavy storms and seismology." },
    { phase: "Structural Framing", stepName: "Mounting and bolting structural lightweight steel unit outlines", durationDays: 2, durationHours: 28, workersRequired: 18, instructions: "Erect unit framing columns, trusses, and tie bracing brackets with heavy shear-resistant steel fasteners." },
    { phase: "Enclosure & Finishes", stepName: "Fixing sandwich insulated wall sheets and weather-sealing joints", durationDays: 2, durationHours: 36, workersRequired: 22, instructions: "Clad wall panels, join weather-gaskets, seal transitions with thick polyurethane silicon beads." },
    { phase: "Services & Plumbing", stepName: "Securing doors, window frames, plumbing hookups and simple power lines", durationDays: 1, durationHours: 15, workersRequired: 14, instructions: "Install aluminum window blocks and locksets, run private restroom drainage manifolds to the shared septic system." },
    { phase: "Field Handover", stepName: "Inspections, air tightness audit, and shelter key distribution", durationDays: 1, durationHours: 8, workersRequired: 6, instructions: "Run rain-wash test for roofs, sanitize modular units, and register crisis-affected families to their new shelter." }
  ],
  budget: {
    materialsCost: 65900,
    laborCost: 11000,
    transportCost: 4000,
    contingencyCost: 7500,
    totalCost: 88400
  }
};

const getShelterImage = (disasterType: string, climateType: string) => {
  const dLower = disasterType.toLowerCase();
  const cLower = climateType.toLowerCase();
  
  if (dLower.includes("زلزال") || dLower.includes("earthquake")) {
    return imgEarthquake;
  }
  if (dLower.includes("فيضان") || dLower.includes("flood") || dLower.includes("طمي") || dLower.includes("landslide") || dLower.includes("إعصار") || dLower.includes("hurricane")) {
    return imgFlood;
  }
  if (dLower.includes("برد") || dLower.includes("ثلوج") || dLower.includes("cold") || cLower.includes("بارد") || cLower.includes("rainy") || cLower.includes("ممطر") || cLower.includes("winds")) {
    return imgCold;
  }
  if (dLower.includes("حرارة") || dLower.includes("جفاف") || dLower.includes("heat") || cLower.includes("حار") || cLower.includes("arid")) {
    return imgHeat;
  }
  return imgGeneral;
};

const getShelterImageCaption = (disasterType: string, lang?: "ar" | "en") => {
  const isEn = lang === "en";
  const dLower = disasterType.toLowerCase();
  if (dLower.includes("زلزال") || dLower.includes("earthquake")) {
    return isEn 
      ? "3D photorealistic simulation view of a durable earthquake-resistant shelter on solid rocky foundation."
      : "لقطة ثلاثية الأبعاد لمحاكاة مأوى متين ومقاوم للزلازل على أرض صخرية صلبة.";
  }
  if (dLower.includes("فيضان") || dLower.includes("flood") || dLower.includes("انهيار") || dLower.includes("إعصار") || dLower.includes("hurricane") || dLower.includes("landslide")) {
    return isEn
      ? "Engineering conceptual rendering of an elevated shelter on steel piles to prevent water logs and flooding."
      : "محاكاة هندسية لمأوى مرتفع على ركائز فولاذية لتجنب المياه وتدفق الفيضانات الميدانية.";
  }
  if (dLower.includes("برد") || dLower.includes("ثلوج") || dLower.includes("cold")) {
    return isEn
      ? "Thermal shelter visualization with double insulation envelopes and thick insulated panels for extreme winter conditions."
      : "تصور واقعي للمأوى الحراري المزود بعوازل مزدوجة وجدران سميكة لظروف الشتاء القاسية.";
  }
  if (dLower.includes("حرارة") || dLower.includes("جفاف") || dLower.includes("heat")) {
    return isEn
      ? "3D conceptual rendering of a desert-zone shelter with high passive cross-ventilation layout to scatter heat."
      : "تصور ثلاثي الأبعاد لنظام المأوى الصحراوي المزود بسقف مزدوج للتهوية وتشتيت الحرارة.";
  }
  return isEn
    ? "High-fidelity conceptual render of a prefabricated rapid-deploy emergency shelter ready for immediate on-site assembly."
    : "نموذج تخيلي واقعي لوحدة الإيواء السريع مسبقة الصنع للتجميع الميداني الفوري.";
};

export default function App() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const t = translations[lang];

  const [input, setInput] = useState<ProjectInput>({
    disasterType: t.disasterOptions[0],
    locationName: "منطقة حلب الشرقية، سوريا",
    peopleCount: 100,
    availableArea: 2500,
    soilType: t.soilOptions[0],
    climateType: t.climateOptions[0],
    localMaterials: [t.localMaterialOptions[1].label, t.localMaterialOptions[6].label],
    durationOfUse: t.durationOptions[1]
  });

  const [project, setProject] = useState<ShelterProject | null>(defaultProjectAr);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [activeResultTab, setActiveResultTab] = useState<'design' | 'bom' | 'timeline' | 'budget' | 'map'>('design');

  // BOM table filter & search
  const [bomSearch, setBomSearch] = useState<string>("");
  const [bomCategoryFilter, setBomCategoryFilter] = useState<string>("all");

  const [apiErrorDetails, setApiErrorDetails] = useState<string | null>(null);

  const handleInputChange = (field: keyof ProjectInput, value: any) => {
    setInput((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMaterialToggle = (materialLabel: string) => {
    setInput((prev) => {
      const current = prev.localMaterials || [];
      if (current.includes(materialLabel)) {
        return { ...prev, localMaterials: current.filter((m) => m !== materialLabel) };
      } else {
        return { ...prev, localMaterials: [...current, materialLabel] };
      }
    });
  };

  // Run generation through full-stack backend
  const handleGenerate = async () => {
    setLoading(true);
    setErrorMsg("");
    setApiErrorDetails(null);
    setSuccessMsg("");

    // Simulate animated engineering analysis logs for rich UI feedback
    const steps = lang === "ar" ? [
      "تحليل طبيعة التربة وقدرة التحمل الميكانيكية للركائز...",
      "دراسة أحمال الرياح وضغوط مياه المطر والثلوج في منطقة الكارثة...",
      "تحديد النموذج المعماري الأكثر أماناً لحفظ كرامة العائلات المتضررة...",
      "موازنة قائمة المواد واختيار البدائل المحلية الأرخص والأسرع في النقل...",
      "رسم المخطط المعماري الداخلي وتوزيع الغرف والمطابخ والحمامات...",
      "إنشاء الجدول الزمني وتخطيط مراحل العمل بالساعة وعدد العمال..."
    ] : [
      "Analyzing geotechnical soil bearing capacity and anchor physics...",
      "Evaluating storm winds, extreme rain and snow loads in disaster zone...",
      "Selecting the safest structural model to protect families' dignity...",
      "Balancing materials and choosing fast, low-cost local alternatives...",
      "Drawing 2D floor plans and optimizing room layouts...",
      "Scheduling milestone phases and calculating labor requirements..."
    ];

    let currentStepIdx = 0;
    setLoadingStep(steps[0]);
    const stepInterval = setInterval(() => {
      currentStepIdx++;
      if (currentStepIdx < steps.length) {
        setLoadingStep(steps[currentStepIdx]);
      }
    }, 1500);

    try {
      const response = await fetch("/api/shelter/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ...input, language: lang })
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || (lang === "ar" ? `فشل في الاتصال بالخادم (رمز الخطأ: ${response.status})` : `Failed to connect to server (Status Code: ${response.status})`));
      }

      const generatedProjectData = await response.json();
      
      const newProject: ShelterProject = {
        id: `project-${Date.now()}`,
        createdAt: new Date().toISOString(),
        input: { ...input },
        ...generatedProjectData
      };

      setProject(newProject);
      setSuccessMsg(lang === "ar" ? "تم تصميم المأوى وحساب المخططات والكميات بنجاح بواسطة الذكاء الاصطناعي!" : "Shelter blueprint and Bill of Materials generated successfully by the AI engine!");
      setActiveResultTab("design");
    } catch (err: any) {
      clearInterval(stepInterval);
      console.error("Failed generating project:", err);
      
      // Provide a fully working mock fallback in case GEMINI_API_KEY is not configured
      // The user wants a highly robust tool that works even on basic previews!
      setErrorMsg(err.message || (lang === "ar" ? "حدث خطأ أثناء التوليد." : "An error occurred during generation."));
      setApiErrorDetails(
        lang === "ar" 
          ? "يرجى العلم بأنه تم تفعيل نظام المحاكاة والنمذجة الذاتية الاحتياطية لتزويدك بالتصميم المتكامل على الفور دون انقطاع."
          : "Backup generative simulation mode activated to compile a fully compliant emergency shelter model instantly."
      );

      // Generating highly realistic simulated dataset based on inputs to rescue user experience
      setTimeout(() => {
        const isFlood = input.disasterType.toLowerCase().includes("فيضان") || input.disasterType.toLowerCase().includes("flood") || input.disasterType.toLowerCase().includes("أمطار") || input.disasterType.toLowerCase().includes("rain");
        const isCold = input.climateType.toLowerCase().includes("بارد") || input.climateType.toLowerCase().includes("cold") || input.disasterType.toLowerCase().includes("برد") || input.disasterType.toLowerCase().includes("snow");
        const count = input.peopleCount;
        const capacityPerUnit = 5;
        const totalUnits = Math.ceil(count / capacityPerUnit);
        const isEn = lang === "en";
        
        const backupModel: ShelterProject = {
          id: `backup-${Date.now()}`,
          createdAt: new Date().toISOString(),
          input: { ...input },
          generalAnalysis: isEn 
            ? `Rapid Response Engineering Assessment for (${input.locationName}): To address the disaster of type (${input.disasterType}) in a terrain with soil type (${input.soilType}) and climate conditions of (${input.climateType}), a highly resilient and easily deployable modular shelter design has been finalized. The soil profile permits ${input.soilType.toLowerCase().includes("rock") ? "solid mechanical structural anchors" : "wide concrete slab foundations to avoid slip and subsidence"}. The layout integrates local raw materials (${input.localMaterials.length > 0 ? input.localMaterials.join(" & ") : "primary emergency supplies"}) to minimize shipping costs and on-site assembly hours.`
            : `تحليل الاستجابة السريعة لمنطقة (${input.locationName}): لمواجهة كارثة (${input.disasterType}) في محيط ذي تربة (${input.soilType}) ومناخ (${input.climateType})، تم اختيار نظام مأوى مرن وسهل التجميع لتخفيف الأضرار بالسرعة القصوى. التربة تسمح بتثبيت قواعد ارتكاز ${input.soilType.includes("صخر") ? "ميكانيكية صلبة" : "خرسانية عريضة لتفادي الانزلاق"}. التصميم يستغل المواد المتاحة (${input.localMaterials.length > 0 ? input.localMaterials.join(" و") : "الموارد الهندسية الأساسية"}) لتقليل تكلفة وساعات الشحن والنقل للحد الأدنى.`,
          suggestedModel: {
            name: isEn 
              ? (isFlood ? "High-Elevated Flood Resilience Shelter" : isCold ? "Thermal Envelope Insulated Rapid Shelter" : "Standard Rapid Deployment Shelter Model")
              : (isFlood ? "مأوى السلامة المرتفع لمناطق الفيضانات" : isCold ? "مأوى الدفء الحراري المعزول" : "المأوى النموذجي السريع للاستجابة العاجلة"),
            type: isEn
              ? (isFlood ? "Elevated light-gauge steel framing with treated timber panels" : "Prefabricated sandwich panels with high-density polyurethane")
              : (isFlood ? "وحدات هيكلية فولاذية مرتفعة عن سطح الأرض بجدران خشبية معالجة" : "هياكل معزولة مسبقة التجميع بألواح البولي يوريثان"),
            unitDimensions: { width: 4.5, length: 5.5, height: 2.7 },
            roomDistribution: isEn 
              ? ["Integrated family living and sleeping zone", "Compact kitchenette & meal prep corner", "Private insulated bathroom / sanitation facility", "Dedicated emergency logistics storage space"]
              : ["منطقة معيشة ونوم عائلية", "ركن مطبخ عائلي مصغر", "مرفق حمام داخلي معزول بالكامل", "منطقة تخزين للأمتعة الإغاثية"],
            totalUnitsNeeded: totalUnits,
            capacityPerUnit: capacityPerUnit,
            floorPlanDescription: isEn
              ? `Compact layout offering ${(4.5 * 5.5).toFixed(1)}m² of independent space per family, integrating dining and sleeping spaces with isolated latrines to suppress disease vectors in high-density temporary camps.`
              : `مخطط داخلي مدمج يوفر مساحة عائلية مستقلة مقدرة بـ ${(4.5 * 5.5).toFixed(1)}م²، يدمج مناطق المعيشة والنوم مع زوايا مخصصة للطبخ ومراحيض معزولة لمنع انتشار الأمراض في المخيمات الميدانية.`,
            foundationType: isEn
              ? (isFlood ? "Heavy steel piles anchored on concrete ballast blocks elevated 50cm" : "Precast concrete deck blocks with quick leveling bolts")
              : (isFlood ? "أعمدة ارتكاز فولاذية مرفوعة على كتل خرسانية بارتفاع 50سم" : "قواعد خرسانية مسبقة الصب سريعة التثبيت والموازنة"),
            insulationRating: isEn
              ? "Dual thermal reflective membrane with high performance insulation filling to resist extreme weather"
              : "طبقتين من الكسوة مع حشوة ليفية عازلة لمكافحة الظروف المناخية القاسية"
          },
          blueprints: {
            floorPlan: {
              dimensions: { w: 5.5, h: 4.5 },
              rooms: [
                { name: isEn ? "Sleeping & Living" : "غرفة نوم ومعيشة", x: 0.5, y: 0.5, w: 3.0, h: 3.5, type: "living" },
                { name: isEn ? "Kitchen Corner" : "ركن الطبخ", x: 3.8, y: 0.5, w: 1.2, h: 1.5, type: "kitchen" },
                { name: isEn ? "Bathroom" : "مرفق حمام", x: 3.8, y: 2.3, w: 1.2, h: 1.7, type: "toilet" },
                { name: isEn ? "Double Bed" : "سرير ثنائي", x: 0.8, y: 0.8, w: 1.8, h: 1.4, type: "bed" },
                { name: isEn ? "Entrance" : "باب رئيسي", x: 1.5, y: 4.0, w: 0.8, h: 0.1, type: "door" },
                { name: isEn ? "Window" : "نافذة أمامية", x: 1.2, y: 0.1, w: 1.0, h: 0.1, type: "window" }
              ]
            },
            elevation: {
              facadeType: isEn
                ? "Weather-resistant, shock-proof thermal envelope featuring integrated high-level ventilation to prevent humidity"
                : "واجهة معمارية مقاومة للرطوبة والصدمات الجوية بفتحة تهوية علوية لمنع الرطوبة وتكثف المياه داخل الوحدة",
              wallHeight: 2.2,
              roofHeight: 0.5,
              roofType: isFlood || isCold ? "sloped" : "flat",
              materials: isEn
                ? ["Insulated composite panels", "Stainless weather-sealed columns", "Tight insulated steel exterior door"]
                : ["ألواح عزل مركبة مسبقة الصنع", "أطر مدعمة ومقاومة للصدأ", "باب حديد خفيف محكم الإغلاق"]
            },
            campLayout: {
              gridRows: Math.max(2, Math.floor(Math.sqrt(totalUnits))),
              gridCols: Math.ceil(totalUnits / Math.max(2, Math.floor(Math.sqrt(totalUnits)))),
              spacing: 5.0,
              facilities: [
                ...Array.from({ length: Math.min(12, totalUnits) }).map((_, i) => ({
                  name: isEn ? `Shelter Unit ${i+1}` : `وحدة إيواء عائلي ${i+1}`,
                  x: 5 + (i % 3) * 12,
                  y: 5 + Math.floor(i / 3) * 10,
                  w: 6,
                  h: 5,
                  type: "shelter" as const
                })),
                { name: isEn ? "Camp Water Tank" : "خزان مياه المخيم", x: 42, y: 5, w: 8, h: 7, type: "water" },
                { name: isEn ? "Field Clinic" : "العيادة الميدانية", x: 42, y: 15, w: 9, h: 8, type: "medical" },
                { name: isEn ? "Safe Zone & Playground" : "مساحة آمنة وملاعب", x: 5, y: 25, w: 22, h: 8, type: "space" }
              ]
            }
          },
          billOfMaterials: isEn ? [
            { category: "Structural Framing", material: "Lightweight prefabricated steel frames and structural ties", quantity: totalUnits * 400, unit: "kg", estimatedUnitPrice: 1.3, totalPrice: totalUnits * 400 * 1.3, localSourcingPossible: true, sourcingNotes: "Erected immediately from near local metal yards" },
            { category: "Insulation & Finishes", material: "Treated thermal wood or polyurethane foam insulated wall panels", quantity: totalUnits * 16, unit: "panel", estimatedUnitPrice: 22.0, totalPrice: totalUnits * 16 * 22.0, localSourcingPossible: true, sourcingNotes: "In stock at near building supply merchants" },
            { category: "Doors & Windows", material: "Sealed exterior doors and sliding glazed windows for insulation", quantity: totalUnits, unit: "set", estimatedUnitPrice: 180.0, totalPrice: totalUnits * 180.0, localSourcingPossible: true, sourcingNotes: "Fast procurement through regional aluminum workshops" },
            { category: "Sanitary & Electrical", material: "Piping, toilet accessories, drainage pipes & water valves", quantity: totalUnits, unit: "set", estimatedUnitPrice: 150.0, totalPrice: totalUnits * 150.0, localSourcingPossible: true, sourcingNotes: "Purchase from local plumbing markets to bypass delay" },
            { category: "Foundations & Connectors", material: "Galvanized bolts, brackets, anchors and precast footing bases", quantity: 1, unit: "lot", estimatedUnitPrice: 800.0, totalPrice: 800.0, localSourcingPossible: true, sourcingNotes: "Standard structural fasteners in stock" }
          ] : [
            { category: "الهيكل الإنشائي", material: "أعمدة وجسور حديدية خفيفة مسبقة الصنع للتجميع الميداني السريع", quantity: totalUnits * 400, unit: "كغ", estimatedUnitPrice: 1.3, totalPrice: totalUnits * 400 * 1.3, localSourcingPossible: true, sourcingNotes: "تجمع فوري من أقرب مصانع تجميع معدنية" },
            { category: "العزل والتشطيب", material: "ألواح خشبية معززة أو ألواح بانل عازلة للحرارة والرطوبة", quantity: totalUnits * 16, unit: "لوح", estimatedUnitPrice: 22.0, totalPrice: totalUnits * 16 * 22.0, localSourcingPossible: true, sourcingNotes: "متوفر لدى مستودعات البناء القريبة" },
            { category: "الأبواب والنوافذ", material: "أبواب حديدية ونوافذ زجاجية عازلة للوحدات السكنية", quantity: totalUnits, unit: "طقم كامل", estimatedUnitPrice: 180.0, totalPrice: totalUnits * 180.0, localSourcingPossible: true, sourcingNotes: "سلسلة توريد سريعة عبر الورش القريبة" },
            { category: "التمديدات الصحية والكهربائية", material: "صمامات تمديد، خطوط تصريف بلاستيكية ومضخات مياه", quantity: totalUnits, unit: "طقم", estimatedUnitPrice: 150.0, totalPrice: totalUnits * 150.0, localSourcingPossible: true, sourcingNotes: "شراء من السوق المحلي لتجنب تأخير الاستيراد" },
            { category: "الأساسات والأدوات والتثبيت", material: "مسامير تثبيت فولاذية، قواعد خرسانية، زوايا لربط الهيكل", quantity: 1, unit: "دفعة مجمعة", estimatedUnitPrice: 800.0, totalPrice: 800.0, localSourcingPossible: true, sourcingNotes: "أطقم تجميع قياسية هندسية" }
          ],
          timeline: isEn ? [
            { phase: "Site Prep & Grading", stepName: "Clearing site of rubble and leveling ground contours", durationDays: 1, durationHours: 10, workersRequired: 8, instructions: "Survey soil profile and layout storm drains to prevent pools of standing water around units." },
            { phase: "Foundations & Anchors", stepName: "Erecting precast footing blocks and aligning level lines", durationDays: 1, durationHours: 8, workersRequired: 6, instructions: "Set precast blocks and anchor spikes to secure frame nodes from high wind lift." },
            { phase: "Structural Framing", stepName: "Erecting steel studs and raising unit skeletons", durationDays: 1, durationHours: 12, workersRequired: 12, instructions: "Fasten metal frames and connect roof trusses with high-tensile structural bolts." },
            { phase: "Enclosure & Insulation", stepName: "Mounting insulated siding and waterproofing joints", durationDays: 1, durationHours: 14, workersRequired: 15, instructions: "Install sandwich panels, seal gaps with premium silicon compounds, and join windows." },
            { phase: "Field Handover", stepName: "Inspection, service commissioning and family check-in", durationDays: 1, durationHours: 6, workersRequired: 5, instructions: "Check piping connections, clean indoor dust, distribute keys and register incoming families." }
          ] : [
            { phase: "التحضير والتسوية", stepName: "تطهير الموقع وتسوية مناسيب المياه", durationDays: 1, durationHours: 10, workersRequired: 8, instructions: "مسح الأرض وتحديد مجاري تصريف المياه لمنع البرك وتثبيت نقاط تجميع الملاجئ." },
            { phase: "الأساسات والتدعيم", stepName: "توزيع القواعد الخرسانية ورش الأوتاد", durationDays: 1, durationHours: 8, workersRequired: 6, instructions: "تنصيب القواعد مسبقة الصنع وموازنة تدرجها لتفادي حدوث انحراف في الملاجئ." },
            { phase: "تركيب الهياكل", stepName: "ربط الهياكل الإنشائية ورفع الأعمدة", durationDays: 1, durationHours: 12, workersRequired: 12, instructions: "تثبيت الأعمدة وجسور التدعيم للهياكل وربط البراغي بالأدوات المناسبة." },
            { phase: "التغطية والكسوة", stepName: "تطبيق ألواح التلبيس والعوازل المائية والحرارية", durationDays: 1, durationHours: 14, workersRequired: 15, instructions: "تلبيس جدران الوحدات بالكامل وتركيب ألواح السقف وحشو الفراغات بسيليكون العزل المائي." },
            { phase: "التسليم الميداني", stepName: "تسليم المأوى واختبار المقاومة وبدء الإيواء", durationDays: 1, durationHours: 6, workersRequired: 5, instructions: "تنظيف وتعقيم الوحدات واختبار شبكة المياه والصرف وبدء تسكين العائلات المتضررة." }
          ],
          budget: {
            materialsCost: totalUnits * 1100 + 1500,
            laborCost: Math.ceil(totalUnits * 150),
            transportCost: Math.ceil(totalUnits * 80),
            contingencyCost: Math.ceil(totalUnits * 100),
            totalCost: (totalUnits * 1100 + 1500) + Math.ceil(totalUnits * 150) + Math.ceil(totalUnits * 80) + Math.ceil(totalUnits * 100)
          }
        };

        setProject(backupModel);
        setSuccessMsg(isEn ? "Shelter blueprint and budget calculated successfully (simulation mode active)!" : "تم تصميم المأوى وحساب المخططات والكميات والميزانية بنجاح (وضع المحاكاة المتكامل ذو الاستجابة الفورية)!");
        setActiveResultTab("design");
        setLoading(false);
      }, 3500);

    } finally {
      // In case api succeeds, we unset loading here. Falling back is async inside setTimeout.
      // So let's handle the loader removal carefully.
      if (!apiErrorDetails) {
        setLoading(false);
      }
    }
  };

  // Export CSV Data
  const exportToCSV = () => {
    if (!project) return;
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Include BOM for proper Excel Arabic display
    csvContent += "الفئة,المادة,الكمية الكلية,الوحدة,السعر التقديري للوحدة (USD),السعر الإجمالي التقديري (USD),التوفر المحلي,ملاحظات التوريد والشراء\r\n";

    project.billOfMaterials.forEach((item) => {
      const row = [
        item.category,
        item.material.replace(/,/g, " -"),
        item.quantity,
        item.unit,
        item.estimatedUnitPrice,
        item.totalPrice,
        item.localSourcingPossible ? "نعم متوفر محلياً" : "مستورد / يتطلب شحن خاص",
        item.sourcingNotes.replace(/,/g, " -")
      ].join(",");
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `جدول_كميات_مأوى_${project.input.locationName.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON/IFC Data Representation
  const exportToIFC = () => {
    if (!project) return;
    const ifcData = {
      IFC_Header: {
        fileDescription: "BIM Architectural IFC Model Metadata for Rapid Shelter",
        timeStamp: new Date().toISOString(),
        author: "Rapid Shelter Designer AI Engine",
        organization: "Disaster Relief Engineering Alliance"
      },
      ProjectMetadata: {
        location: project.input.locationName,
        disasterType: project.input.disasterType,
        peopleAccommodated: project.input.peopleCount,
        availableAreaSqM: project.input.availableArea,
        suggestedModelName: project.suggestedModel.name
      },
      StructuralGeometry: {
        unitWidthMeters: project.suggestedModel.unitDimensions.width,
        unitLengthMeters: project.suggestedModel.unitDimensions.length,
        unitHeightMeters: project.suggestedModel.unitDimensions.height,
        roofProfile: project.blueprints.elevation.roofType,
        totalUnitsNeeded: project.suggestedModel.totalUnitsNeeded,
        foundationDesign: project.suggestedModel.foundationType
      },
      InteriorRooms: project.blueprints.floorPlan.rooms,
      CampCoordinatesAndFacilities: project.blueprints.campLayout.facilities,
      RequiredBillOfMaterials: project.billOfMaterials
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(ifcData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `مخطط_BIM_IFC_${project.input.locationName.replace(/\s+/g, "_")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  // Export CAD DWG Mockup text script (containing dxf or line vectors instructions)
  const exportToCAD = () => {
    if (!project) return;
    
    // Generate simple readable AutoCAD DXF mock coordinate list
    let dxfContent = "AUTO_CAD_DXF_VECTOR_BLUEPRINT_SCRIPT_MOCK\n";
    dxfContent += "========================================\n";
    dxfContent += `PROJECT: ${project.input.locationName}\n`;
    dxfContent += `DISASTER RESPONSE: ${project.input.disasterType}\n`;
    dxfContent += `BUILDING MODEL: ${project.suggestedModel.name}\n`;
    dxfContent += `DIMENSIONS: ${project.suggestedModel.unitDimensions.width}m x ${project.suggestedModel.unitDimensions.length}m x ${project.suggestedModel.unitDimensions.height}m\n`;
    dxfContent += "========================================\n\n";
    
    dxfContent += "SECTION: OUTLINE WALL LINES (DXF ENTITIES)\n";
    const w = project.suggestedModel.unitDimensions.width;
    const l = project.suggestedModel.unitDimensions.length;
    dxfContent += `LINE: Start(0,0) End(${w},0) - FRONT WALL\n`;
    dxfContent += `LINE: Start(${w},0) End(${w},${l}) - RIGHT WALL\n`;
    dxfContent += `LINE: Start(${w},${l}) End(0,${l}) - BACK WALL\n`;
    dxfContent += `LINE: Start(0,${l}) End(0,0) - LEFT WALL\n\n`;
    
    dxfContent += "SECTION: ROOM PARTITIONS\n";
    project.blueprints.floorPlan.rooms.forEach((room) => {
      dxfContent += `ROOM_BOX: Name="${room.name}" Type="${room.type}" BoxX=${room.x} BoxY=${room.y} BoxW=${room.w} BoxH=${room.h}\n`;
    });
    
    dxfContent += "\nSECTION: CAMP MASTER LAYOUT COORDINATES\n";
    project.blueprints.campLayout.facilities.forEach((fac) => {
      dxfContent += `CAMP_FACILITY: Name="${fac.name}" Type="${fac.type}" CoordinateX=${fac.x} CoordinateY=${fac.y} Width=${fac.w} Height=${fac.h}\n`;
    });

    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(dxfContent);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `مخطط_AutoCAD_CAD_${project.input.locationName.replace(/\s+/g, "_")}.txt`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  // Load project from Saved configurations list
  const loadSavedProject = (loaded: ShelterProject) => {
    setProject(loaded);
    setInput(loaded.input);
    setActiveResultTab("design");
    setSuccessMsg("تم استعادة وتحميل تكوين المشروع المختار بنجاح!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Filter materials based on search & category
  const filteredBOM = project ? project.billOfMaterials.filter((item) => {
    const matchesSearch = item.material.toLowerCase().includes(bomSearch.toLowerCase()) || 
                          item.category.toLowerCase().includes(bomSearch.toLowerCase());
    const matchesCategory = bomCategoryFilter === "all" || item.category === bomCategoryFilter;
    return matchesSearch && matchesCategory;
  }) : [];

  // Sum categories for budget charts
  const materialSum = project ? project.billOfMaterials.reduce((sum, item) => sum + item.totalPrice, 0) : 0;
  
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] p-4 sm:p-6" dir="rtl">
      {/* Premium Elegant Header */}
      <header className="max-w-7xl mx-auto mb-6 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 shadow-inner">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              مصمم الملاجئ الهندسية السريعة للأزمات والكوارث
              <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full uppercase">
                استجابة فورية
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              منصة ذكية لتصميم مراكز ومخيمات الإيواء السريع، نمذجة ثلاثية الأبعاد تفاعلية، حساب جداول الكميات، التنفيذ الزمني والميزانية التقديرية.
            </p>
          </div>
        </div>
        <div className="flex gap-2 self-stretch md:self-auto">
          <span className="text-xs font-mono text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            التوقيت الميداني: {new Date().toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Wizard Form / Input Area (Left Columns - 4 cols on big screens) */}
        <section className="lg:col-span-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-5">
          <div>
            <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2.5 flex items-center gap-2">
              <Layers className="w-4.5 h-4.5 text-indigo-600" />
              تكوين محددات الأزمة وموقع المأوى
            </h2>
            <p className="text-[11px] text-slate-400 mt-1">حدد طبيعة الظروف الإغاثية والبيئية لتخصيص الهيكل المعماري والأساسات وجدول الكميات.</p>
          </div>

          <div className="flex flex-col gap-4">
            {/* Input - Location Name */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                الموقع الجغرافي للاستجابة
              </label>
              <input
                id="input-location-name"
                type="text"
                value={input.locationName}
                onChange={(e) => handleInputChange("locationName", e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 text-right focus:outline-none focus:border-indigo-500 bg-slate-50/50"
                placeholder="مثال: جبل الزاوية، إدلب، سوريا"
              />
            </div>

            {/* Input - Disaster Type */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-500" />
                نوع الكارثة الطبيعية أو الأزمة
              </label>
              <select
                id="input-disaster-type"
                value={input.disasterType}
                onChange={(e) => handleInputChange("disasterType", e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 text-right focus:outline-none bg-slate-50/50"
              >
                {disasterOptions.map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Grid for People Count and Land Area */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-500" />
                  عدد الأشخاص المطلوبين
                </label>
                <input
                  id="input-people-count"
                  type="number"
                  min="5"
                  max="10000"
                  value={input.peopleCount}
                  onChange={(e) => handleInputChange("peopleCount", parseInt(e.target.value) || 0)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs font-mono text-center focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                  <Maximize className="w-3.5 h-3.5 text-indigo-500" />
                  مساحة الأرض المتاحة (م²)
                </label>
                <input
                  id="input-available-area"
                  type="number"
                  min="20"
                  max="100000"
                  value={input.availableArea}
                  onChange={(e) => handleInputChange("availableArea", parseInt(e.target.value) || 0)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs font-mono text-center focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
                />
              </div>
            </div>

            {/* Input - Soil Nature */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">طبيعة التربة الميدانية</label>
              <select
                id="input-soil-type"
                value={input.soilType}
                onChange={(e) => handleInputChange("soilType", e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 text-right focus:outline-none bg-slate-50/50"
              >
                {soilOptions.map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Input - Climate Conditions */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-indigo-500" />
                الظروف المناخية الحالية
              </label>
              <select
                id="input-climate-type"
                value={input.climateType}
                onChange={(e) => handleInputChange("climateType", e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 text-right focus:outline-none bg-slate-50/50"
              >
                {climateOptions.map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Input - Usage Duration */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">مدة الاستخدام المستهدفة للملجأ</label>
              <select
                id="input-duration-of-use"
                value={input.durationOfUse}
                onChange={(e) => handleInputChange("durationOfUse", e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 text-right focus:outline-none bg-slate-50/50"
              >
                {durationOptions.map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Multiple Selection - Local Available Materials */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2 flex items-center gap-1.5">
                <Hammer className="w-3.5 h-3.5 text-indigo-500" />
                المواد المتوفرة محلياً أو المتاحة فوراً
              </label>
              <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto border border-slate-100 rounded-xl p-2.5 bg-slate-50/50">
                {localMaterialOptions.map((mat) => {
                  const isChecked = input.localMaterials.includes(mat.label);
                  return (
                    <label key={mat.id} className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-800 cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleMaterialToggle(mat.label)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                      <span>{mat.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Action buttons */}
            <button
              id="generate-shelter-plan-btn"
              onClick={handleGenerate}
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2.5 text-white shadow-md transition-all ${
                loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]"
              }`}
            >
              {loading ? (
                <>
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                  <span>{loadingStep || "جاري تجميع البيانات وتوليد المخططات..."}</span>
                </>
              ) : (
                <>
                  <RefreshCcw className="w-4 h-4" />
                  <span>توليد وتصميم المأوى بالذكاء الاصطناعي</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Output Workspace Results (Right Columns - 8 cols on big screens) */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Main Error Banner with detail info */}
          {errorMsg && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col gap-2">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-800 text-xs">تنبيه فني للمهندس</h4>
                  <p className="text-xs text-amber-700 leading-relaxed mt-0.5">{errorMsg}</p>
                </div>
              </div>
              {apiErrorDetails && (
                <div className="text-[11px] text-indigo-700 bg-white/70 rounded-xl p-2.5 border border-indigo-100 flex items-center gap-1.5 mt-1">
                  <Info className="w-3.5 h-3.5 text-indigo-500" />
                  {apiErrorDetails}
                </div>
              )}
            </div>
          )}

          {/* Loading Simulator Full Overlay */}
          {loading && (
            <div className="bg-white border border-slate-100 rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-sm min-h-[400px]">
              <div className="relative flex items-center justify-center mb-6">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <Shield className="w-6 h-6 text-indigo-600 absolute animate-pulse" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm mb-2">جاري تصميم وهندسة الملاجئ السريعة...</h3>
              <p className="text-xs text-slate-500 max-w-md leading-relaxed">{loadingStep}</p>
              <div className="w-64 bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                <div className="bg-indigo-600 h-full animate-progress" style={{ width: "65%" }}></div>
              </div>
            </div>
          )}

          {/* Display Project Outputs */}
          {!loading && project && (
            <div className="flex flex-col gap-6">
              
              {/* Suggeted Model & General Analysis Summary block */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-5">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-600">النموذج الهيكلي المقترح والحل الهندسي</span>
                    <h2 className="text-base font-extrabold text-slate-800 mt-1">{project.suggestedModel.name}</h2>
                    <span className="text-xs text-slate-500 block mt-0.5">{project.suggestedModel.type}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 font-bold text-xs px-3.5 py-2 rounded-xl border border-indigo-100">
                    <TrendingUp className="w-4 h-4" />
                    <span>إجمالي الوحدات المطلوبة: {project.suggestedModel.totalUnitsNeeded} وحدة</span>
                  </div>
                </div>

                {/* Split Grid for details & dynamic visualization image */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                  
                  {/* Left Column: Details & stats (7 cols on md) */}
                  <div className="md:col-span-7 flex flex-col gap-4 justify-between">
                    
                    {/* Grid stats cards of shelter dimensions */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                        <span className="text-[10px] text-slate-400 block">أبعاد الوحدة</span>
                        <span className="text-xs font-bold text-slate-700 mt-0.5">
                          {project.suggestedModel.unitDimensions.width}م × {project.suggestedModel.unitDimensions.length}م
                        </span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                        <span className="text-[10px] text-slate-400 block">المساحة الإجمالية</span>
                        <span className="text-xs font-bold text-slate-700 mt-0.5">
                          {(project.suggestedModel.unitDimensions.width * project.suggestedModel.unitDimensions.length).toFixed(1)} م²
                        </span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                        <span className="text-[10px] text-slate-400 block">سعة الوحدة</span>
                        <span className="text-xs font-bold text-slate-700 mt-0.5">
                          {project.suggestedModel.capacityPerUnit} أشخاص / أسرة
                        </span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                        <span className="text-[10px] text-slate-400 block">نوع الأساسات</span>
                        <span className="text-xs font-bold text-slate-700 mt-0.5">
                          {project.suggestedModel.foundationType.split(" ")[0]}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                        التحليل الهندسي والبيئي للموقع:
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed text-justify">{project.generalAnalysis}</p>
                    </div>

                    <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 text-[11px] text-slate-600 leading-normal">
                      <span className="font-bold text-indigo-800 block mb-0.5">العزل والتكييف البيئي الموصى به:</span>
                      {project.suggestedModel.insulationRating}
                    </div>

                  </div>

                  {/* Right Column: Beautiful photorealistic conceptual render (5 cols on md) */}
                  <div className="md:col-span-5 flex flex-col gap-2">
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm border border-slate-200 group bg-slate-50">
                      <img
                        src={getShelterImage(project.input.disasterType, project.input.climateType)}
                        alt={project.suggestedModel.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 right-2 bg-black/60 text-[9px] text-white px-2.5 py-1 rounded-md backdrop-blur-xs font-bold">
                        تصور واقعي ثلاثي الأبعاد
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 text-center leading-normal block">
                      {getShelterImageCaption(project.input.disasterType)}
                    </span>
                  </div>

                </div>

              </div>

              {/* Sub-Tabs for Blueprints, BOM, Schedule and Budget */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <nav className="flex border-b border-slate-100 bg-slate-50/60 overflow-x-auto">
                  <button
                    id="tab-results-design-btn"
                    onClick={() => setActiveResultTab("design")}
                    className={`flex-1 py-4 px-4 text-xs font-extrabold text-center border-b-2 whitespace-nowrap transition-all ${
                      activeResultTab === "design"
                        ? "border-indigo-600 text-indigo-700 bg-white"
                        : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    🏗️ الخرائط والمخططات الهندسية
                  </button>
                  <button
                    id="tab-results-map-btn"
                    onClick={() => setActiveResultTab("map")}
                    className={`flex-1 py-4 px-4 text-xs font-extrabold text-center border-b-2 whitespace-nowrap transition-all ${
                      activeResultTab === "map"
                        ? "border-indigo-600 text-indigo-700 bg-white"
                        : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    🗺️ {lang === "ar" ? "الخارطة التفاعلية الجغرافية" : "Interactive Camp Map"}
                  </button>
                  <button
                    id="tab-results-bom-btn"
                    onClick={() => setActiveResultTab("bom")}
                    className={`flex-1 py-4 px-4 text-xs font-extrabold text-center border-b-2 whitespace-nowrap transition-all ${
                      activeResultTab === "bom"
                        ? "border-indigo-600 text-indigo-700 bg-white"
                        : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    📋 قائمة المواد وجدول الكميات (BOM)
                  </button>
                  <button
                    id="tab-results-timeline-btn"
                    onClick={() => setActiveResultTab("timeline")}
                    className={`flex-1 py-4 px-4 text-xs font-extrabold text-center border-b-2 whitespace-nowrap transition-all ${
                      activeResultTab === "timeline"
                        ? "border-indigo-600 text-indigo-700 bg-white"
                        : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    📅 الجدول الزمني للتنفيذ
                  </button>
                  <button
                    id="tab-results-budget-btn"
                    onClick={() => setActiveResultTab("budget")}
                    className={`flex-1 py-4 px-4 text-xs font-extrabold text-center border-b-2 whitespace-nowrap transition-all ${
                      activeResultTab === "budget"
                        ? "border-indigo-600 text-indigo-700 bg-white"
                        : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    💰 الميزانية التقديرية والتحليل المالي
                  </button>
                </nav>

                <div className="p-5">
                  {/* TAB 1: BLUEPRINTS AND 3D VIEWER */}
                  {activeResultTab === "design" && (
                    <div className="flex flex-col gap-6">
                      <BlueprintView
                        blueprints={project.blueprints}
                        unitDimensions={project.suggestedModel.unitDimensions}
                        foundationType={project.suggestedModel.foundationType}
                        floorPlanDescription={project.suggestedModel.floorPlanDescription}
                        lang={lang}
                      />
                      <ThreeDView
                        unitDimensions={project.suggestedModel.unitDimensions}
                        roofType={project.blueprints.elevation.roofType}
                        shelterType={project.suggestedModel.type}
                        lang={lang}
                      />
                    </div>
                  )}

                  {/* TAB: INTERACTIVE GEOGRAPHIC MAP */}
                  {activeResultTab === "map" && (
                    <InteractiveMap
                      project={project}
                      lang={lang}
                    />
                  )}

                  {/* TAB 2: BILL OF MATERIALS (BOM) */}
                  {activeResultTab === "bom" && (
                    <div className="flex flex-col gap-5">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs">قائمة وجدول المواد اللازمة للبناء (BOM)</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">تغطي المواد والإنشاءات والخدمات لكافة الوحدات الـ ({project.suggestedModel.totalUnitsNeeded}) والخدمات المشتركة.</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">إجمالي تكلفة المواد</span>
                          <span className="text-xs font-extrabold text-indigo-600 font-mono">${materialSum.toLocaleString()} USD</span>
                        </div>
                      </div>

                      {/* Filter and Search controls */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={bomSearch}
                            onChange={(e) => setBomSearch(e.target.value)}
                            className="w-full pl-3 pr-9 py-2.5 rounded-xl border border-slate-200 text-xs text-right focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="بحث في المواد والكميات المقترحة..."
                          />
                          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Filter className="w-4 h-4 text-slate-400" />
                          <select
                            value={bomCategoryFilter}
                            onChange={(e) => setBomCategoryFilter(e.target.value)}
                            className="border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="all">كل الفئات</option>
                            <option value="الهيكل الإنشائي">الهيكل الإنشائي</option>
                            <option value="العزل والتشطيب">العزل والتشطيب</option>
                            <option value="الأبواب والنوافذ">الأبواب والنوافذ</option>
                            <option value="التمديدات الصحية والكهربائية">تمديدات وخدمات صحية</option>
                            <option value="الأساسات والأدوات والتثبيت">الأساسات والتثبيت</option>
                          </select>
                        </div>
                      </div>

                      {/* Materials List Table */}
                      <div className="overflow-x-auto border border-slate-100 rounded-xl">
                        <table className="w-full text-right text-xs">
                          <thead className="bg-slate-50 text-slate-700 border-b border-slate-100 font-semibold">
                            <tr>
                              <th className="py-3 px-3 text-right">المادة والوصف</th>
                              <th className="py-3 px-3">الفئة</th>
                              <th className="py-3 px-3 text-center">الكمية المطلوبة</th>
                              <th className="py-3 px-3 text-center">سعر الوحدة</th>
                              <th className="py-3 px-3 text-center">السعر الإجمالي</th>
                              <th className="py-3 px-3 text-center">التوفر المحلي</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-600">
                            {filteredBOM.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">لا توجد مواد مطابقة للبحث.</td>
                              </tr>
                            ) : (
                              filteredBOM.map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                  <td className="py-3 px-3 text-right font-medium text-slate-800">
                                    <div>{item.material}</div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">{item.sourcingNotes}</div>
                                  </td>
                                  <td className="py-3 px-3 text-slate-500">{item.category}</td>
                                  <td className="py-3 px-3 text-center font-mono">{item.quantity.toLocaleString()} {item.unit}</td>
                                  <td className="py-3 px-3 text-center font-mono">${item.estimatedUnitPrice.toFixed(1)}</td>
                                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">${item.totalPrice.toLocaleString()}</td>
                                  <td className="py-3 px-3 text-center">
                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                                      item.localSourcingPossible ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                                    }`}>
                                      {item.localSourcingPossible ? "متوفر محلياً" : "استيراد / شحن"}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: TIMELINE AND SCHEDULE */}
                  {activeResultTab === "timeline" && (
                    <div className="flex flex-col gap-6">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center text-xs text-slate-700">
                        <div>
                          <h4 className="font-bold text-slate-800">خطة التنفيذ والجدول الزمني الإجمالي للإنشاء السريع</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">خطوات التنفيذ والتشييد الميداني الموصى بها لإتمام الوحدات والخدمات بأمان.</p>
                        </div>
                        <div className="text-left font-mono font-bold text-indigo-700">
                          إجمالي المدة: {project.timeline.reduce((sum, s) => sum + s.durationDays, 0)} أيام ({project.timeline.reduce((sum, s) => sum + s.durationHours, 0)} ساعة)
                        </div>
                      </div>

                      {/* Timline Steps rendering */}
                      <div className="relative border-r-2 border-indigo-100 mr-4 flex flex-col gap-8 py-3">
                        {project.timeline.map((step, idx) => {
                          let phaseColor = "bg-indigo-600";
                          let dotColor = "border-indigo-600";
                          if (step.phase.includes("التحضير")) { phaseColor = "bg-sky-500"; dotColor = "border-sky-500"; }
                          else if (step.phase.includes("الأساسات") || step.phase.includes("التأسيس")) { phaseColor = "bg-amber-500"; dotColor = "border-amber-500"; }
                          else if (step.phase.includes("الهياكل") || step.phase.includes("الهيكل")) { phaseColor = "bg-purple-500"; dotColor = "border-purple-500"; }
                          else if (step.phase.includes("التغطية") || step.phase.includes("الكسوة")) { phaseColor = "bg-rose-500"; dotColor = "border-rose-500"; }
                          else if (step.phase.includes("التسليم")) { phaseColor = "bg-emerald-500"; dotColor = "border-emerald-500"; }

                          return (
                            <div key={idx} className="relative flex flex-col gap-2.5 pr-6 text-right">
                              {/* Glowing Timeline Node */}
                              <div className={`absolute -right-[9px] top-1 w-4 h-4 rounded-full bg-white border-4 ${dotColor} shadow-sm z-10`} />

                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`text-[10px] text-white font-bold px-2 py-0.5 rounded ${phaseColor}`}>
                                  {step.phase}
                                </span>
                                <span className="text-[11px] font-bold text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded-md">
                                  {step.durationDays} أيام ({step.durationHours} ساعة)
                                </span>
                                <span className="text-[11px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5 text-slate-400" />
                                  الأيدي العاملة: {step.workersRequired} متطوعين/عمال
                                </span>
                              </div>

                              <h4 className="font-extrabold text-slate-800 text-xs mt-1">
                                {idx + 1}. {step.stepName}
                              </h4>
                              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                                {step.instructions}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: BUDGET BREAKDOWN & CHARTS */}
                  {activeResultTab === "budget" && (
                    <div className="flex flex-col gap-6">
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                        <div>
                          <h4 className="font-bold text-slate-800">التحليل المالي وتقدير ميزانية الاستجابة</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">تحليل توزيع التكاليف لإتمام وتوصيل كافة الوحدات الإيوائية والمناطق المشتركة بنجاح.</p>
                        </div>
                        <div className="text-left">
                          <span className="text-[10px] text-slate-400 block font-semibold">إجمالي ميزانية المشروع التقديرية</span>
                          <span className="text-sm font-extrabold text-emerald-600 font-mono">${project.budget.totalCost.toLocaleString()} USD</span>
                        </div>
                      </div>

                      {/* Main Financial stats grid cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-4 text-center">
                          <span className="text-[11px] text-slate-400 block">تكلفة الوحدة السكنية الواحدة</span>
                          <span className="text-xs font-bold text-slate-700 mt-1 block font-mono">
                            ${Math.round(project.budget.totalCost / project.suggestedModel.totalUnitsNeeded).toLocaleString()} USD
                          </span>
                          <span className="text-[10px] text-slate-400 mt-1 block">لعدد {project.suggestedModel.totalUnitsNeeded} وحدة كاملة</span>
                        </div>
                        <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-4 text-center">
                          <span className="text-[11px] text-slate-400 block">تكلفة إيواء الفرد الواحد</span>
                          <span className="text-xs font-bold text-slate-700 mt-1 block font-mono">
                            ${Math.round(project.budget.totalCost / project.input.peopleCount).toLocaleString()} USD / شخص
                          </span>
                          <span className="text-[10px] text-slate-400 mt-1 block">لعدد {project.input.peopleCount} شخص</span>
                        </div>
                        <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-4 text-center">
                          <span className="text-[11px] text-slate-400 block">الهامش المالي للطوارئ (Contingency)</span>
                          <span className="text-xs font-bold text-slate-700 mt-1 block font-mono">
                            ${project.budget.contingencyCost.toLocaleString()} USD
                          </span>
                          <span className="text-[10px] text-slate-400 mt-1 block">مخصص بنسبة {Math.round((project.budget.contingencyCost / project.budget.totalCost) * 100)}% للاحتياط</span>
                        </div>
                      </div>

                      {/* Custom SVG Budget Donut Chart / Progress Bar visualizations */}
                      <div className="flex flex-col md:flex-row gap-6 items-center">
                        {/* Custom Hand-Crafted Donut Chart */}
                        <div className="flex justify-center items-center p-4 bg-slate-900 rounded-2xl border border-slate-800 w-full md:w-1/2 min-h-[220px]">
                          <svg width="220" height="220" viewBox="0 0 200 200" className="font-sans">
                            {/* SVG Donut Slices mapping */}
                            {(() => {
                              const b = project.budget;
                              const total = b.materialsCost + b.laborCost + b.transportCost + b.contingencyCost;
                              
                              const pMat = b.materialsCost / total;
                              const pLab = b.laborCost / total;
                              const pTra = b.transportCost / total;
                              const pCon = b.contingencyCost / total;

                              // Radius of donut: 70
                              const r = 60;
                              const cx = 100;
                              const cy = 100;
                              const circ = 2 * Math.PI * r;

                              const strokeMat = circ * pMat;
                              const strokeLab = circ * pLab;
                              const strokeTra = circ * pTra;
                              const strokeCon = circ * pCon;

                              return (
                                <g>
                                  {/* Base shadow circular track */}
                                  <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="20" />

                                  {/* Material Slice */}
                                  <circle
                                    cx={cx}
                                    cy={cy}
                                    r={r}
                                    fill="none"
                                    stroke="#6366f1" // Indigo
                                    strokeWidth="20"
                                    strokeDasharray={`${strokeMat} ${circ - strokeMat}`}
                                    strokeDashoffset="0"
                                    transform={`rotate(-90 ${cx} ${cy})`}
                                  />

                                  {/* Labor Slice */}
                                  <circle
                                    cx={cx}
                                    cy={cy}
                                    r={r}
                                    fill="none"
                                    stroke="#10b981" // Emerald
                                    strokeWidth="20"
                                    strokeDasharray={`${strokeLab} ${circ - strokeLab}`}
                                    strokeDashoffset={-strokeMat}
                                    transform={`rotate(-90 ${cx} ${cy})`}
                                  />

                                  {/* Transport Slice */}
                                  <circle
                                    cx={cx}
                                    cy={cy}
                                    r={r}
                                    fill="none"
                                    stroke="#f59e0b" // Amber
                                    strokeWidth="20"
                                    strokeDasharray={`${strokeTra} ${circ - strokeTra}`}
                                    strokeDashoffset={-(strokeMat + strokeLab)}
                                    transform={`rotate(-90 ${cx} ${cy})`}
                                  />

                                  {/* Contingency Slice */}
                                  <circle
                                    cx={cx}
                                    cy={cy}
                                    r={r}
                                    fill="none"
                                    stroke="#ef4444" // Red
                                    strokeWidth="20"
                                    strokeDasharray={`${strokeCon} ${circ - strokeCon}`}
                                    strokeDashoffset={-(strokeMat + strokeLab + strokeTra)}
                                    transform={`rotate(-90 ${cx} ${cy})`}
                                  />

                                  {/* Centered label */}
                                  <circle cx={cx} cy={cy} r="45" fill="#1e293b" />
                                  <text x={cx} y={cy - 5} textAnchor="middle" className="text-[10px] fill-slate-400 font-bold">إجمالي الميزانية</text>
                                  <text x={cx} y={cy + 12} textAnchor="middle" className="text-[13px] fill-white font-mono font-bold">${b.totalCost.toLocaleString()}</text>
                                </g>
                              );
                            })()}
                          </svg>
                        </div>

                        {/* Bar chart & Details representation */}
                        <div className="flex-1 w-full flex flex-col gap-3.5">
                          <div>
                            <div className="flex justify-between items-center text-xs mb-1.5">
                              <span className="font-semibold text-slate-700">المواد والتجهيزات الإنشائية (Materials)</span>
                              <span className="font-mono font-bold text-indigo-600">${project.budget.materialsCost.toLocaleString()} ({Math.round((project.budget.materialsCost / project.budget.totalCost) * 100)}%)</span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="bg-indigo-500 h-full" style={{ width: `${(project.budget.materialsCost / project.budget.totalCost) * 100}%` }}></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-center text-xs mb-1.5">
                              <span className="font-semibold text-slate-700">الأجور والأيدي العاملة الميدانية (Labor)</span>
                              <span className="font-mono font-bold text-emerald-600">${project.budget.laborCost.toLocaleString()} ({Math.round((project.budget.laborCost / project.budget.totalCost) * 100)}%)</span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full" style={{ width: `${(project.budget.laborCost / project.budget.totalCost) * 100}%` }}></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-center text-xs mb-1.5">
                              <span className="font-semibold text-slate-700">الشحن والنقل واللوجستيات (Transport)</span>
                              <span className="font-mono font-bold text-amber-600">${project.budget.transportCost.toLocaleString()} ({Math.round((project.budget.transportCost / project.budget.totalCost) * 100)}%)</span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="bg-amber-500 h-full" style={{ width: `${(project.budget.transportCost / project.budget.totalCost) * 100}%` }}></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-center text-xs mb-1.5">
                              <span className="font-semibold text-slate-700">احتياطي طوارئ وهامش أمان (Contingency)</span>
                              <span className="font-mono font-bold text-red-600">${project.budget.contingencyCost.toLocaleString()} ({Math.round((project.budget.contingencyCost / project.budget.totalCost) * 100)}%)</span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="bg-red-500 h-full" style={{ width: `${(project.budget.contingencyCost / project.budget.totalCost) * 100}%` }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 5: EXPORT ACTIONS */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-4.5 h-4.5 text-indigo-600" />
                    تصدير ومشاركة مخرجات المشروع الهندسي (Export Center)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">يمكنك تحميل التقارير الهندسية وجداول الكميات والخرائط بنقرة واحدة بمختلف الصيغ المطلوبة للتقديم الميداني.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Export PDF */}
                  <button
                    id="export-pdf-report-btn"
                    onClick={() => window.print()}
                    className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 rounded-xl text-right transition-all flex flex-col justify-between"
                  >
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg w-fit mb-2">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-700 block">تقرير شامل PDF المطبوع</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">للطباعة والتقديم الورقي</span>
                    </div>
                  </button>

                  {/* Export Excel (CSV) */}
                  <button
                    id="export-excel-csv-btn"
                    onClick={exportToCSV}
                    className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-100 rounded-xl text-right transition-all flex flex-col justify-between"
                  >
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg w-fit mb-2">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-700 block">جدول كميات Excel (CSV)</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">لمراجعة الحسابات والأسعار</span>
                    </div>
                  </button>

                  {/* Export BIM IFC (JSON metadata) */}
                  <button
                    id="export-bim-ifc-json-btn"
                    onClick={exportToIFC}
                    className="p-3 bg-slate-50 hover:bg-sky-50 border border-slate-100 hover:border-sky-100 rounded-xl text-right transition-all flex flex-col justify-between"
                  >
                    <div className="p-2 bg-sky-50 text-sky-600 rounded-lg w-fit mb-2">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-700 block">نموذج BIM المعماري (IFC)</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">لتصدير الإحداثيات الهندسية</span>
                    </div>
                  </button>

                  {/* Export CAD Script (DWG/DXF mockup script) */}
                  <button
                    id="export-cad-script-btn"
                    onClick={exportToCAD}
                    className="p-3 bg-slate-50 hover:bg-amber-50 border border-slate-100 hover:border-amber-100 rounded-xl text-right transition-all flex flex-col justify-between"
                  >
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg w-fit mb-2">
                      <Grid className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-700 block">مخطط أوتوكاد CAD (DXF)</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">خطوط ومجسّمات CAD لرسومات DWG</span>
                    </div>
                  </button>
                </div>
              </div>

            </div>
          )}
        </section>
      </main>

      {/* Saved Projects Section */}
      <section className="max-w-7xl mx-auto mt-6">
        <SavedProjects
          currentProject={project}
          onLoadProject={loadSavedProject}
          onSaveCurrent={(name) => {}}
          lang={lang}
        />
      </section>

      {/* Printing Styles to hide controls and fit PDF on standard A4 papers */}
      <style>{`
        @media print {
          header, section.lg:col-span-4, button, select, input, nav, .absolute {
            display: none !important;
          }
          main {
            display: block !important;
          }
          section.lg:col-span-8 {
            width: 100% !important;
            grid-column: span 12 / span 12 !important;
          }
          .bg-white, .bg-slate-50 {
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
