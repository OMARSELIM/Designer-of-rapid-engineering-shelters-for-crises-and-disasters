import { useState, useEffect } from "react";
import { AlertTriangle, X, ShieldAlert, Wrench, Info, ListChecks, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ShelterProject } from "../types";

interface RiskAlertBannerProps {
  project: ShelterProject | null;
  lang: "ar" | "en";
}

export function RiskAlertBanner({ project, lang }: RiskAlertBannerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastProjectId, setLastProjectId] = useState<string | null>(null);

  const isAr = lang === "ar";

  // Translate helper
  const tr = (arText: string, enText: string) => (isAr ? arText : enText);

  if (!project || !project.siteRiskAssessment) {
    return null;
  }

  const assessment = project.siteRiskAssessment;

  // Extract all high risk factors
  const riskKeys = [
    { key: "windDirection", label: tr("اتجاه الرياح والعواصف", "Wind Direction & Storms"), icon: "💨" },
    { key: "floodProbability", label: tr("احتمالية الفيضانات", "Flood Probability"), icon: "🌊" },
    { key: "landslideRisk", label: tr("مخاطر الانهيارات الأرضية", "Landslide Risk"), icon: "⛰️" },
    { key: "earthquakeIntensity", label: tr("شدة الزلازل المتوقعة", "Expected Earthquake Intensity"), icon: "🌋" },
    { key: "seasonalTemperature", label: tr("درجة الحرارة الموسمية", "Seasonal Temperature"), icon: "🌡️" },
    { key: "groundwaterLevel", label: tr("مستوى المياه الجوفية", "Groundwater Level"), icon: "💧" },
    { key: "torrentProximity", label: tr("قرب الموقع من مجاري السيول", "Torrent Proximity"), icon: "🌧️" },
  ];

  const highRisks = riskKeys
    .map(({ key, label, icon }) => {
      const factor = (assessment as any)[key];
      return { key, label, icon, factor };
    })
    .filter((item) => item.factor && item.factor.riskLevel === "high");

  const hasHighRisks = highRisks.length > 0;

  // Automate modal opening when a high-risk project loads
  useEffect(() => {
    if (project.id !== lastProjectId) {
      setLastProjectId(project.id);
      if (hasHighRisks) {
        // Auto open modal when a new project with high risk is generated or loaded
        setIsModalOpen(true);
      } else {
        setIsModalOpen(false);
      }
    }
  }, [project.id, lastProjectId, hasHighRisks]);

  if (!hasHighRisks) {
    return null;
  }

  // Get specific mitigation steps for each hazard
  const getMitigationSteps = (key: string) => {
    switch (key) {
      case "earthquakeIntensity":
        return [
          tr(
            "استخدام أطر هيكلية فولاذية مجلفنة مرنة وخفيفة لامتصاص قوى القص الجانبية وتقليل الحمل الذاتي.",
            "Utilize lightweight, flexible galvanized steel structural framing to absorb lateral shear loads and minimize dead load inertia."
          ),
          tr(
            "تركيب وسادات عزل زلزالي مطاطية أو دعامات مرنة أسفل القواعد الخرسانية مسبقة الصنع لتخفيف الهزات.",
            "Install elastomeric rubber seismic isolation pads or flexible dampers beneath prefabricated concrete foundation footings."
          ),
          tr(
            "تطبيق أحزمة شد قطرية (X-Bracing) على كافة الجدران والأسقف لتأمين ثبات الهيكل ضد الالتواء والانهيار.",
            "Apply diagonal shear tie-straps (X-bracing) on all wall and roof planes to secure the structure against twisting and drift."
          ),
          tr(
            "تأمين وتثبيت الخزائن والأثاث الثقيل داخلياً بجدران المأوى لمنع سقوطها أثناء الهزات الارتدادية.",
            "Secure and anchor heavy interior storage cabinets and lockers to the shelter frame to prevent tipping during aftershocks."
          ),
        ];
      case "floodProbability":
        return [
          tr(
            "رفع مستوى أرضية المأوى بمقدار 0.8 متر على الأقل فوق مستوى سطح الأرض باستخدام قوائم تلسكوبية أو أوتاد فولاذية.",
            "Elevate shelter floor framing at least 0.8 meters above ground level using telescopic steel screw-piles or elevated plinths."
          ),
          tr(
            "تطبيق عوازل مائية ورطوبة كاملة (Bitumen/HDPE membrane) أسفل وبجانب أرضية الوحدات السكنية لحمايتها من الرطوبة المتصاعدة.",
            "Apply heavy-duty waterproof tanking membranes (Bitumen/HDPE sheet) under and around floor decks to combat rising damp."
          ),
          tr(
            "توجيه مخرجات الصرف الصحي لشبكة تصريف مرتفعة آمنة ومحمية من الضغط العكسي لمياه الأمطار.",
            "Route sewer and sanitation outlets to elevated conduits protected from heavy rainwater hydraulic backflow."
          ),
          tr(
            "إنشاء قنوات تصريف ومصارف فرنسية محيطية للتوجيه الفوري لمياه الأمطار بعيداً عن كتل السكن المباشرة.",
            "Excavate micro bioswales and French drains around residential clusters to guide standing water away instantly."
          ),
        ];
      case "landslideRisk":
        return [
          tr(
            "غرس أوتاد التثبيت والأساسات لعمق يزيد عن 1.5 متر للوصول للطبقات الصخرية الأكثر ثباتاً وتماسكاً.",
            "Drive helical foundation anchors deeper than 1.5 meters to clamp directly onto stable bedrock strata."
          ),
          tr(
            "بناء جدران جابيون (أقفاص حجرية مدمجة) في الجهة العليا للمنحدرات لصد الكتل الطينية وتأمين الموقع.",
            "Construct rock gabion retaining walls on up-gradient slopes to intercept soil creep and shield living sectors."
          ),
          tr(
            "استخدام شبكات تثبيت التربة الجيولوجية (Geotextiles) والمساحات الخضراء السريعة لامتصاص وتماسك التربة السائبة.",
            "Lay geotextile stabilization mats combined with deep-root hydro-seeding to bind and secure loose surface soil."
          ),
          tr(
            "تجنب بناء كتل سكنية تحت الميول الحادة المباشرة غير المدعومة، وترك مسافة أمان لا تقل عن 20 متراً.",
            "Enforce a 20-meter absolute buffer zone from steep, un-retained cut slopes when placing shelters."
          ),
        ];
      case "windDirection":
        return [
          tr(
            "توجيه فتحات الأبواب والنوافذ لتكون موازية أو معاكسة تماماً لاتجاه الرياح السائد لتجنب الضغط الهيدروليكي السلبي.",
            "Orient principal doors and windows parallel or opposite to dominant gale directions to avoid high positive pressure."
          ),
          tr(
            "تركيب أحزمة شد فولاذية علوية (Storm/Hurricane Straps) تربط السقف بالجدران والأساسات لضمان عدم الاقتلاع.",
            "Install heavy galvanized steel hurricane straps securely fastening roof trusses to wall studs and foundation anchors."
          ),
          tr(
            "اعتماد تصميم سطح مائل انسيابي قبيبي لتقليل مقاومة الرياح ومنع تشكل تيارات هوائية ترفع السقف.",
            "Maintain aerodynamic low-profile sloped or curved roof geometry to reduce wind drag and aerodynamic uplift."
          ),
          tr(
            "بناء سواتر رياح شجرية أو مصدات خشبية مثقبة في الجهة الشمالية الغربية لتهدئة سرعة تيار الهواء العاصف.",
            "Erect robust vegetative windbreaks or slatted perimeter fences on the leeward front to mitigate gale velocity."
          ),
        ];
      case "seasonalTemperature":
        return [
          tr(
            "استخدام ألواح ساندوتش بانل بولي يوريثان عالية الكثافة R-15+ بسماكة لا تقل عن 50-75 مم مع حشو ممتد.",
            "Deploy dense polyurethane foam core sandwich panels (R-value R-15+, 50-75mm thickness) for thermal envelopes."
          ),
          tr(
            "تثبيت رقائق الألمنيوم العاكسة للإشعاع الشمسي المباشر أسفل ألواح التغطية لمنع انتقال الحرارة بالسرعة.",
            "Laminate reflective radiant barrier foils underneath outer roof coverings to reject solar heat transfer."
          ),
          tr(
            "تركيب نوافذ ألمنيوم مزدوجة الزجاج (Double Glazing) وحواجز مطاطية لإغلاق منافذ دخول الصقيع والحر الشديد.",
            "Install thermal-break double-glazed window frames with neoprene edge weatherstrips to stop cold air drafts."
          ),
          tr(
            "إنشاء رواق مدخل مغلق ومزدوج (Thermal Vestibule) لتقليل حجم تيار الهواء البارد/الحار المباشر أثناء الحركة.",
            "Establish an insulated double-door entry vestibule to limit ambient air exchanges during exit and entry."
          ),
        ];
      case "groundwaterLevel":
        return [
          tr(
            "تطبيق دهان عزل مائي إيبوكسي سميك على القواعد الخرسانية لمنع الخاصية الشعرية وصعود الرطوبة للوحدات.",
            "Coat concrete footings with heavy epoxy waterproof barriers to arrest capillary rise and lock out dampness."
          ),
          tr(
            "رفع شبكة إمدادات مياه الشرب وتوصيلات الصرف الصحي بشكل كامل فوق مستوى سطح الأرض لمنع تلوثها بالرشح الجوفي.",
            "Install potable supply pipes and sanitary loops completely above-grade to safeguard against ground contamination."
          ),
          tr(
            "حفر غرف تصريف وتجميع للمياه مجهزة بمضخات طرد تعمل بالطاقة الشمسية لخفض منسوب الرطوبة السطحية في المخيم.",
            "Excavate sump basins fitted with automated solar drainage pumps to drawdown localized shallow water table surges."
          ),
          tr(
            "وضع فرش من البحص أو الحصى الخشن بسماكة 15 سم أسفل أساسات المأوى لكسر صعود المياه الرطبة.",
            "Spread a compacted 15cm coarse gravel base course beneath foundation footings to act as a capillary break."
          ),
        ];
      case "torrentProximity":
        return [
          tr(
            "بناء قناة تصريف خرسانية رئيسية بعرض 2 متر لتحويل مسار السيل والفيضان الجبلي بشكل آمن خارج المخيم.",
            "Excavate a dedicated 2-meter wide trapezoidal bypass channel to route potential torrent surges safely around camp bounds."
          ),
          tr(
            "وضع حواجز خرسانية مسبقة الصنع (Jersey Barriers) في الجهة المواجهة للمنحدر لامتصاص قوة اندفاع الركام والمياه.",
            "Settle precast concrete crash barriers (Jersey barriers) up-gradient of housing lanes to dissipate kinetic energy."
          ),
          tr(
            "منع إسكان أي عائلات أو إنشاء مآوي في نطاق 100 متر من خط المجرى الطبيعي للسيول.",
            "Enforce a strict 100-meter non-occupancy buffer zone extending from the centerline of active torrent washes."
          ),
          tr(
            "تجهيز صفارات إنذار مبكر ونظام كشف التدفق المرتبط بمنصة رصد الأحوال الجوية لتمكين الإخلاء السريع.",
            "Establish early warning sirens coupled with float-level switches telemetry connected to weather dispatch grids."
          ),
        ];
      default:
        return [
          tr(
            "تدعيم زوايا المأوى بقواعد ممتدة وتصريف مياه السيول.",
            "Reinforce shelter corners with deep structural anchors and implement clear rainwater runoff channels."
          ),
        ];
    }
  };

  return (
    <>
      {/* 🚨 Pulse Warning Alert Banner Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mb-6"
      >
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm relative overflow-hidden">
          {/* Subtle animated light effect */}
          <div className="absolute inset-y-0 left-0 w-1.5 bg-rose-500 animate-pulse" />

          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-rose-100 text-rose-600 rounded-xl border border-rose-200 animate-pulse flex-shrink-0">
              <ShieldAlert className="w-5.5 h-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-rose-500 text-white font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider animate-bounce">
                  {tr("تنبيه أمان حرج", "Critical Risk Alert")}
                </span>
                <span className="font-bold text-rose-800 text-xs sm:text-sm">
                  {tr("تم رصد مخاطر بيئية عالية المستوى في الموقع", "High-Level Environmental Risks Detected on Site")}
                </span>
              </div>
              <p className="text-[11px] text-rose-600/90 mt-1 max-w-3xl leading-relaxed">
                {tr(
                  `يحتوي الموقع الحالي على عدد (${highRisks.length}) من العوامل ذات التهديد الإنشائي العالي. يتطلب ذلك تطبيق مخططات السلامة الهندسية وتدابير الحماية الميدانية فوراً لضمان حماية الأرواح المأوية.`,
                  `The current site has (${highRisks.length}) environmental vectors evaluated at high hazard levels. Immediate application of structural mitigation steps is required to safeguard lives.`
                )}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl border border-rose-500 transition-all shadow-sm w-full md:w-auto justify-center cursor-pointer"
          >
            <Wrench className="w-4 h-4" />
            <span>{tr("عرض خطة التدابير الوقائية", "View Mitigation & Safety Plan")}</span>
          </button>
        </div>
      </motion.div>

      {/* 🛡️ Automated Modal with Detailed Mitigation Steps */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col"
              dir={isAr ? "rtl" : "ltr"}
            >
              {/* Header */}
              <div className="bg-slate-900 text-white p-5 flex justify-between items-center relative">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base tracking-tight flex items-center gap-2">
                      {tr("خطة هندسة السلامة الميدانية وتخفيف التهديدات", "Engineering Safety & Hazard Mitigation Plan")}
                    </h3>
                    <p className="text-[10px] text-slate-300 mt-0.5">
                      {tr("دليل تدابير الوقاية التلقائي للهندسة الميدانية", "Automated field engineering preventative handbook")}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto flex flex-col gap-6">
                {/* Intro warning info banner */}
                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 flex gap-3">
                  <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-[11px] text-slate-600 leading-relaxed">
                    <span className="font-extrabold text-amber-800 block mb-0.5">
                      {tr("إشعار السلامة المهنية والميدانية", "Safety & Professional Engineering Standard Note")}
                    </span>
                    {tr(
                      "يقوم النظام تلقائياً بتحليل المعايير الهيدرولوجية والتكتونية والطبوغرافية للموقع الحالي ومقارنتها بقيم الأمان الهندسية المعتمدة. يجب تضمين التدابير المذكورة أدناه في عقود التأسيس وجدول التخطيط التشغيلي للمخيم لدرء الكوارث.",
                      "The system automatically processes hydrological, tectonic, and topographic matrices, benchmarking them against safe structural engineering baselines. Include these mitigations in contracts and work breakdown schedules."
                    )}
                  </div>
                </div>

                {/* List of High-Risk Hazards & their specific steps */}
                <div className="flex flex-col gap-5">
                  <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <ListChecks className="w-4 h-4 text-indigo-500" />
                    {tr("التهديدات عالية الخطورة المكتشفة وتدابير تخفيفها:", "Detected High Hazards & Required Mitigations:")}
                  </h4>

                  {highRisks.map(({ key, label, icon, factor }, index) => {
                    const steps = getMitigationSteps(key);
                    return (
                      <div
                        key={key}
                        className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-3.5 hover:border-rose-100 hover:shadow-2xs transition-all"
                      >
                        {/* Hazard Title Header */}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{icon}</span>
                            <span className="font-black text-slate-800 text-xs sm:text-sm">{label}</span>
                          </div>
                          <span className="text-[10px] font-black text-white bg-rose-500 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            {tr("خطر حرج", "CRITICAL RISK")}
                          </span>
                        </div>

                        {/* Hazard Description */}
                        <p className="text-[11px] text-slate-500 leading-relaxed border-l-2 border-rose-300 pl-2.5 rtl:border-l-0 rtl:border-r-2 rtl:pr-2.5">
                          <span className="font-bold text-slate-700 block mb-0.5">
                            {tr("التشخيص الميداني للتهديد:", "Field Diagnosis of Threat:")}
                          </span>
                          {factor.description || tr("لا يتوفر تفصيل إضافي.", "No supplementary detail available.")}
                        </p>

                        {/* Mitigation Steps */}
                        <div className="flex flex-col gap-2">
                          <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                            <Wrench className="w-3 h-3" />
                            {tr("خطوات التدريب والتخفيف الهندسي الموصى بها:", "Recommended Engineering Mitigation Steps:")}
                          </span>
                          <ul className="space-y-2.5 mt-1">
                            {steps.map((step, stepIdx) => (
                              <li
                                key={stepIdx}
                                className="bg-white border border-slate-100 rounded-xl p-3 flex gap-2.5 items-start text-xs text-slate-700 leading-relaxed shadow-3xs hover:border-indigo-100/50 transition-all"
                              >
                                <span className="bg-emerald-50 text-emerald-600 rounded-full w-5 h-5 text-[10px] font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-100">
                                  <Check className="w-3 h-3" />
                                </span>
                                <span className="font-semibold text-slate-700">{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end gap-3.5">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl transition-all hover:shadow-xs active:scale-[0.98] cursor-pointer"
                >
                  {tr("تطبيق التدابير وإغلاق المخطط", "Acknowledge & Close Plan")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
