export interface TranslationType {
  title: string;
  slogan: string;
  configTitle: string;
  configSub: string;
  disasterLabel: string;
  locationLabel: string;
  locationPlaceholder: string;
  peopleCountLabel: string;
  peopleSuffix: string;
  availableAreaLabel: string;
  areaSuffix: string;
  soilLabel: string;
  climateLabel: string;
  materialsLabel: string;
  durationLabel: string;
  btnGenerate: string;
  generatingMsg: string;
  suggestedModelTitle: string;
  dimensionsLabel: string;
  totalAreaLabel: string;
  unitCapacityLabel: string;
  unitCapacitySuffix: string;
  foundationLabel: string;
  generalAnalysisLabel: string;
  insulationLabel: string;
  renderCaption: string;
  tabBlueprints: string;
  tabBOM: string;
  tabTimeline: string;
  tabBudget: string;
  tab3D: string;
  tabMetrics: string;
  tabLogistics: string;
  btnSave: string;
  btnExportCSV: string;
  btnExportBIM: string;
  btnExportCAD: string;
  btnExportQR: string;
  btnDelete: string;
  btnLoad: string;
  savedTitle: string;
  savedSub: string;
  noSavedProjects: string;
  noSavedSub: string;
  saveModalTitle: string;
  saveModalSub: string;
  saveModalPlaceholder: string;
  cancel: string;
  confirmSave: string;
  saveSuccessMsg: string;
  loadSuccessMsg: string;
  generateSuccessMsg: string;
  generateSuccessFallback: string;
  apiFallbackWarning: string;
  failedToConnect: string;
  bomSearchPlaceholder: string;
  bomCategoryAll: string;
  bomTableCategory: string;
  bomTableMaterial: string;
  bomTableQty: string;
  bomTableUnit: string;
  bomTableUnitPrice: string;
  bomTableTotal: string;
  bomTableLocal: string;
  bomTableNotes: string;
  bomLocalYes: string;
  bomLocalNo: string;
  timelinePhase: string;
  timelineStep: string;
  timelineDuration: string;
  timelineWorkers: string;
  timelineInstructions: string;
  timelineDays: string;
  timelineHours: string;
  budgetCategories: string;
  budgetMaterials: string;
  budgetLabor: string;
  budgetTransport: string;
  budgetContingency: string;
  budgetTotal: string;
  budgetChartTitle: string;
  budgetInUSD: string;
  demographicSectionTitle: string;
  demographicSectionSub: string;
  childrenLabel: string;
  elderlyLabel: string;
  disabledLabel: string;
  sphereWaterLabel: string;
  sphereToiletsLabel: string;
  sphereDistanceLabel: string;
  designTypeLabel: string;
  designTypeCamp: string;
  designTypeSmartCity: string;
  sustainableMaterialsLabel: string;
  sustainableMaterialsDesc: string;
  lowCostOptimizationLabel: string;
  lowCostOptimizationDesc: string;
  voiceAssistantLabel: string;
  voiceAssistantListening: string;
  voiceAssistantIdle: string;
  voiceAssistantNotSupported: string;
  voiceAssistantSuccess: string;
  voiceAssistantError: string;
  soilOptions: string[];
  disasterOptions: string[];
  climateOptions: string[];
  durationOptions: string[];
  localMaterialOptions: { id: string; label: string }[];
}

export const translations: Record<"ar" | "en", TranslationType> = {
  ar: {
    title: "المصمم الذكي لملاجئ الطوارئ والمدن المؤقتة",
    slogan: "نظام هندسي متكامل لتصميم الملاجئ السريعة مسبقة الصنع وتخطيط مخيمات الطوارئ الآمنة باستخدام الذكاء الاصطناعي.",
    configTitle: "تكوين سيناريو الكارثة والموقع",
    configSub: "حدد المعطيات الميدانية والظروف الجغرافية والبيئية لتوليد الحل الهندسي والإنشائي المتكامل",
    disasterLabel: "نوع الكارثة ومصدر التهديد:",
    locationLabel: "الموقع الجغرافي المستهدف:",
    locationPlaceholder: "مثال: منطقة حلب الشرقية، سوريا",
    peopleCountLabel: "عدد الأشخاص المستهدف إيواؤهم:",
    peopleSuffix: "شخص",
    availableAreaLabel: "المساحة الإجمالية المتاحة (م²):",
    areaSuffix: "متر مربع",
    soilLabel: "طبيعة تربة الموقع:",
    climateLabel: "الظروف المناخية السائدة:",
    materialsLabel: "المواد الخام المتوفرة في الجوار (اختياري):",
    durationLabel: "مدة الاستخدام المستهدفة للمأوى:",
    btnGenerate: "توليد تصميم المأوى والمخيم الذكي ←",
    generatingMsg: "جاري التحليل المعماري والمحاكاة الهندسية...",
    suggestedModelTitle: "النموذج الهيكلي المقترح والحل الهندسي",
    dimensionsLabel: "أبعاد الوحدة",
    totalAreaLabel: "المساحة الإجمالية",
    unitCapacityLabel: "سعة الوحدة",
    unitCapacitySuffix: "أشخاص / أسرة",
    foundationLabel: "نوع الأساسات",
    generalAnalysisLabel: "التحليل الهندسي والبيئي للموقع:",
    insulationLabel: "العزل والتكييف البيئي الموصى به:",
    renderCaption: "تصور واقعي ثلاثي الأبعاد",
    tabBlueprints: "المخططات الهندسية (Blueprints)",
    tabBOM: "جدول الكميات (BOM)",
    tabTimeline: "جدول التنفيذ (Schedule)",
    tabBudget: "الميزانية والتكلفة (Budget)",
    tab3D: "النموذج ثلاثي الأبعاد (3D WebGL)",
    tabMetrics: "مؤشرات المدينة الذكية (Metrics)",
    tabLogistics: "سلسلة الإمداد واللوجستيات (Logistics)",
    btnSave: "حفظ التصميم الحالي",
    btnExportCSV: "تصدير جدول الكميات (CSV)",
    btnExportBIM: "تصدير مخطط BIM (IFC)",
    btnExportCAD: "تصدير AutoCAD Script",
    btnExportQR: "تحميل كود QR الميداني (PNG)",
    btnDelete: "حذف",
    btnLoad: "تحميل التصميم ←",
    savedTitle: "المشاريع والتصاميم المحفوظة (Saved Configurations)",
    savedSub: "تصفح السيناريوهات المحفوظة لتصاميم الملاجئ السريعة والمقارنة بينها.",
    noSavedProjects: "لا توجد مشاريع محفوظة حالياً.",
    noSavedSub: "قم بملء البيانات وتوليد مأوى، ثم انقر على \"حفظ التصميم الحالي\" لحفظه في المتصفح.",
    saveModalTitle: "تسمية وحفظ التصميم",
    saveModalSub: "أدخل اسماً فريداً لحفظ تكوين المخطط الهندسي وجدول الكميات لتتمكن من الرجوع إليه لاحقاً.",
    saveModalPlaceholder: "اسم التصميم (مثال: مخيم إغاثة زلزال حلب)",
    cancel: "إلغاء",
    confirmSave: "تأكيد الحفظ",
    saveSuccessMsg: "تم حفظ التصميم والمخططات بنجاح!",
    loadSuccessMsg: "تم استعادة وتحميل تكوين المشروع المختار بنجاح!",
    generateSuccessMsg: "تم تصميم المأوى وحساب المخططات والكميات بنجاح بواسطة الذكاء الاصطناعي!",
    generateSuccessFallback: "تم تصميم المأوى وحساب المخططات والكميات والميزانية بنجاح (وضع المحاكاة المتكامل ذو الاستجابة الفورية)!",
    apiFallbackWarning: "يرجى العلم بأنه تم تفعيل نظام المحاكاة والنمذجة الذاتية الاحتياطية لتزويدك بالتصميم المتكامل على الفور دون انقطاع.",
    failedToConnect: "فشل في الاتصال بالخادم (رمز الخطأ: ",
    bomSearchPlaceholder: "البحث في المواد والكميات...",
    bomCategoryAll: "جميع الفئات",
    bomTableCategory: "الفئة",
    bomTableMaterial: "المادة الإنشائية",
    bomTableQty: "الكمية",
    bomTableUnit: "الوحدة",
    bomTableUnitPrice: "سعر الوحدة (USD)",
    bomTableTotal: "السعر الإجمالي (USD)",
    bomTableLocal: "التوفر المحلي",
    bomTableNotes: "ملاحظات وتوجيهات الشراء",
    bomLocalYes: "نعم متوفر محلياً",
    bomLocalNo: "شحن واستيراد خاص",
    timelinePhase: "المرحلة",
    timelineStep: "الخطوة العملية",
    timelineDuration: "المدة الزمنية",
    timelineWorkers: "عدد الأيدي العاملة",
    timelineInstructions: "التعليمات والتوجيهات الإنشائية التفصيلية",
    timelineDays: "أيام",
    timelineHours: "ساعات",
    budgetCategories: "تصنيف الميزانية",
    budgetMaterials: "تكلفة المواد واللوح الإنشائي",
    budgetLabor: "تكلفة التركيب والأيدي العاملة",
    budgetTransport: "تكلفة اللوجستيات والشحن والنقل",
    budgetContingency: "احتياطي ومصاريف طوارئ",
    budgetTotal: "التكلفة الكلية المتوقعة للمشروع",
    budgetChartTitle: "توزيع التكاليف الإجمالي بالدولار الأمريكي",
    budgetInUSD: "القيمة (بالدولار)",
    demographicSectionTitle: "تصنيف ديموغرافيا السكان والاحتياجات الخاصة",
    demographicSectionSub: "حدد تركيبة السكان لتخصيص ملاجئ مهيأة ومطابقة للمعايير الإنسانية الدولية",
    childrenLabel: "الأطفال (دون 12 سنة):",
    elderlyLabel: "كبار السن (فوق 60 سنة):",
    disabledLabel: "ذوي الإعاقة والاحتياجات الخاصة:",
    sphereWaterLabel: "إجمالي المياه المطلوبة يومياً (Sphere):",
    sphereToiletsLabel: "إجمالي عدد المراحيض المطلوبة (Sphere):",
    sphereDistanceLabel: "تباعد الأمان الإلزامي بين الوحدات:",
    designTypeLabel: "نوع المخطط ونموذج الإعمار:",
    designTypeCamp: "مخيم إغاثي ميداني سريع (Emergency Camp)",
    designTypeSmartCity: "مدينة ذكية مؤقتة متكاملة (Smart City Generator)",
    sustainableMaterialsLabel: "مواد بناء مستدامة وصديقة للبيئة",
    sustainableMaterialsDesc: "عند التفعيل، يعطى الخيزران (البامبو) والطين المحلي والأخشاب الأولوية على الحديد والخرسانة لخفض الانبعاثات الكربونية.",
    lowCostOptimizationLabel: "تحسين التكلفة والبدائل الاقتصادية",
    lowCostOptimizationDesc: "تفعيل خيارات المواد منخفضة الميزانية (شديدة الاقتصادية كالصاج والمشمعات) لمواجهة التكاليف عند إيواء أعداد ضخمة.",
    voiceAssistantLabel: "مساعد الإدخال الصوتي الميداني",
    voiceAssistantListening: "جاري الاستماع... تحدث بوضوح باللغة العربية أو الإنجليزية (مثال: زلزال في حلب لـ 400 شخص)",
    voiceAssistantIdle: "اضغط على المايك وتحدث لملء حقول الموقع، الكارثة، والعدد صوتياً بسرعة فائقة.",
    voiceAssistantNotSupported: "عذراً، متصفحك لا يدعم خاصية التعرف على الصوت (Web Speech API).",
    voiceAssistantSuccess: "تم معالجة الصوت وتحديث حقول الموقع والكارثة والعدد تلقائياً بنجاح!",
    voiceAssistantError: "لم نتمكن من التقاط الصوت أو تحليل المدخلات بشكل صحيح، يرجى المحاولة مجدداً.",
    disasterOptions: [
      "زلزال",
      "فيضان",
      "إعصار رياح",
      "نزاع مسلح وحرب",
      "موجة برد قارس وثلوج",
      "موجة حرارة مفرطة وجفاف",
      "انهيار أرضي وطيني"
    ],
    soilOptions: [
      "صخرية متماسكة",
      "رملية جافة",
      "طينية لزجة",
      "هشة أو طمي غير مستقر"
    ],
    climateOptions: [
      "بارد عاصف وممطر",
      "حار جاف وقاحل",
      "رياح عاصفة شديدة",
      "أمطار موسمية وفيضانات متكررة",
      "معتدل"
    ],
    durationOptions: [
      "مؤقتة عاجلة (1 - 3 أشهر)",
      "شبه دائم (6 - 24 شهر)",
      "دائم مستقر (أكثر من سنتين)"
    ],
    localMaterialOptions: [
      { id: "panels", label: "ألواح عازلة مسبقة الصنع" },
      { id: "timber", label: "ألواح خشبية وأطر خشبية" },
      { id: "clay", label: "طوب محلي وطين طبيعي" },
      { id: "fibers", label: "ألياف طبيعية وقصب وخيزران" },
      { id: "steel", label: "هياكل حديدية وفولاذية خفيفة" },
      { id: "concrete", label: "أسمنت ورمل ومواد خرسانية" },
      { id: "canvas", label: "خيام وأقمشة مشمعة متينة" }
    ]
  },
  en: {
    title: "AI Emergency Shelter & Camp Designer",
    slogan: "An intelligent, end-to-end engineering platform for designing high-performance rapid shelters and layout plans using generative AI.",
    configTitle: "Disaster Scenario & Location Config",
    configSub: "Specify the field parameters and environmental conditions to synthesize a compliant structural and spatial layout solution.",
    disasterLabel: "Disaster / Threat Vector Type:",
    locationLabel: "Target Geographical Location:",
    locationPlaceholder: "e.g., East Aleppo Governorate, Syria",
    peopleCountLabel: "Target Population size to Accommodate:",
    peopleSuffix: "people",
    availableAreaLabel: "Total Available Land Area (m²):",
    areaSuffix: "sq. meters",
    soilLabel: "Site Geotechnical Soil Type:",
    climateLabel: "Prevailing Environmental Climate:",
    materialsLabel: "Nearby Raw Materials Available (Optional):",
    durationLabel: "Target Duration of Shelter Utility:",
    btnGenerate: "Generate Custom AI Structural Blueprint ←",
    generatingMsg: "Synthesizing structural models and executing simulation logs...",
    suggestedModelTitle: "Suggested Structural Model & Engineering Solution",
    dimensionsLabel: "Unit Dimensions",
    totalAreaLabel: "Total Footprint",
    unitCapacityLabel: "Unit Capacity",
    unitCapacitySuffix: "people / families",
    foundationLabel: "Foundation Type",
    generalAnalysisLabel: "Geotechnical & Environmental Site Analysis:",
    insulationLabel: "Recommended Thermal Insulation & Adaptability:",
    renderCaption: "3D Photorealistic Conceptual Visualization",
    tabBlueprints: "Engineering Blueprints",
    tabBOM: "Bill of Materials (BOM)",
    tabTimeline: "Construction Schedule",
    tabBudget: "Cost Estimation & Budget",
    tab3D: "Interactive 3D WebGL",
    tabMetrics: "Smart City Metrics",
    tabLogistics: "Logistics & Supply Chain",
    btnSave: "Save Configuration",
    btnExportCSV: "Export BOM as CSV",
    btnExportBIM: "Export BIM Model (IFC)",
    btnExportCAD: "Export AutoCAD DXF",
    btnExportQR: "Download Field QR (PNG)",
    btnDelete: "Delete",
    btnLoad: "Load Design ←",
    savedTitle: "Saved Scenarios & Configurations",
    savedSub: "Browse, compare, and manage rapid emergency shelter models saved locally on this browser.",
    noSavedProjects: "No saved projects found.",
    noSavedSub: "Enter parameters, generate a customized shelter plan, and click 'Save Configuration' to persist your configurations.",
    saveModalTitle: "Save Current Design Configuration",
    saveModalSub: "Provide a unique identifier name for this configuration to save the complete layout, BOM, and budget for later retrieval.",
    saveModalPlaceholder: "Configuration Name (e.g., Aleppo Earthquake Crisis Response)",
    cancel: "Cancel",
    confirmSave: "Save Blueprint",
    saveSuccessMsg: "Design configuration saved successfully!",
    loadSuccessMsg: "Project configuration loaded successfully!",
    generateSuccessMsg: "Shelter blueprint and Bill of Materials generated successfully by the AI engine!",
    generateSuccessFallback: "Shelter blueprint and budget calculated successfully (simulation mode active)!",
    apiFallbackWarning: "Generative backup simulation mode activated to instantly compile a compliant emergency framework.",
    failedToConnect: "Failed to establish server connection (Status Code: ",
    bomSearchPlaceholder: "Search within materials, categories...",
    bomCategoryAll: "All Categories",
    bomTableCategory: "Category",
    bomTableMaterial: "Material / Component",
    bomTableQty: "Quantity",
    bomTableUnit: "Unit",
    bomTableUnitPrice: "Unit Price (USD)",
    bomTableTotal: "Total Price (USD)",
    bomTableLocal: "Local Sourcing",
    bomTableNotes: "Procurement & Sourcing Instructions",
    bomLocalYes: "Yes, Locally Available",
    bomLocalNo: "Requires Import / Special Logistics",
    timelinePhase: "Project Phase",
    timelineStep: "Actionable Milestones",
    timelineDuration: "Est. Duration",
    timelineWorkers: "Labor Required",
    timelineInstructions: "Detailed Mechanical and Construction Guidelines",
    timelineDays: "Days",
    timelineHours: "Hours",
    budgetCategories: "Budget Allocation Item",
    budgetMaterials: "Structural & Insulation Materials",
    budgetLabor: "Field Assembly & Labor Force",
    budgetTransport: "Freight, Shipping & Logistics",
    budgetContingency: "Contingency Fund (10-15%)",
    budgetTotal: "Total Project Cost Estimate",
    budgetChartTitle: "Capital Cost Allocation Chart (USD)",
    budgetInUSD: "Value (USD)",
    demographicSectionTitle: "Demographic Classification & Special Needs",
    demographicSectionSub: "Define population demographics to allocate adapted shelters and comply with Sphere humanitarian standards",
    childrenLabel: "Children (under 12):",
    elderlyLabel: "Elderly (over 60):",
    disabledLabel: "People with Disabilities:",
    sphereWaterLabel: "Sphere Required Water / Day:",
    sphereToiletsLabel: "Sphere Required Latrines:",
    sphereDistanceLabel: "Mandatory Safety Clearance:",
    designTypeLabel: "Layout Type & Urban Architecture Model:",
    designTypeCamp: "Emergency Rapid Field Camp",
    designTypeSmartCity: "Temporary Smart City Generator",
    sustainableMaterialsLabel: "Sustainable Materials",
    sustainableMaterialsDesc: "Prioritizes bamboo, local clay, and timber options over steel or concrete, reducing calculated CO₂ impact.",
    lowCostOptimizationLabel: "Low-Cost Optimization",
    lowCostOptimizationDesc: "Prioritizes ultra-budget alternative materials (corrugated iron, tarpaulins) when scaling up for extremely large populations.",
    voiceAssistantLabel: "Field Voice Assistant",
    voiceAssistantListening: "Listening... Speak clearly in English or Arabic (e.g. 'Flood in Chittagong for 800 people')",
    voiceAssistantIdle: "Click micro and speak to auto-fill location, hazard type, and population size in seconds.",
    voiceAssistantNotSupported: "Speech recognition is not supported in this browser (Web Speech API).",
    voiceAssistantSuccess: "Voice input successfully processed! Fields have been auto-filled.",
    voiceAssistantError: "Could not capture voice or parse inputs correctly. Please try again.",
    disasterOptions: [
      "Earthquake",
      "Flood",
      "Hurricane",
      "Conflict / War",
      "Extreme Cold & Snow",
      "Extreme Heat & Drought",
      "Landslide"
    ],
    soilOptions: [
      "Rocky / Solid Ground",
      "Dry Sandy Soil",
      "Wet Clay Soil",
      "Loose Silt / Unstable Soil"
    ],
    climateOptions: [
      "Cold, Windy & Rainy",
      "Hot, Dry & Arid",
      "Extreme Storm Winds",
      "Heavy Monsoons & Flooding",
      "Moderate / Temperate"
    ],
    durationOptions: [
      "Temporary (1 - 3 months)",
      "Semi-permanent (6 - 24 months)",
      "Permanent (More than 2 years)"
    ],
    localMaterialOptions: [
      { id: "panels", label: "Prefabricated Sandwich Panels" },
      { id: "timber", label: "Timber Panels & Frames" },
      { id: "clay", label: "Clay Bricks & Mud" },
      { id: "fibers", label: "Bamboo & Natural Fibers" },
      { id: "steel", label: "Lightweight Steel Frames" },
      { id: "concrete", label: "Concrete, Cement & Sand" },
      { id: "canvas", label: "Heavy Canvas & Tarpaulin" }
    ]
  }
};
