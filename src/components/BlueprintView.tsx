import { useState } from "react";
import { BlueprintsData } from "../types";
import { Compass, Grid, Home, Layout, Maximize2, Shield, Hammer } from "lucide-react";

interface BlueprintViewProps {
  blueprints: BlueprintsData;
  unitDimensions: {
    width: number;
    length: number;
    height: number;
  };
  foundationType: string;
  floorPlanDescription: string;
  lang: "ar" | "en";
}

export default function BlueprintView({ blueprints, unitDimensions, foundationType, floorPlanDescription, lang }: BlueprintViewProps) {
  const [activeTab, setActiveTab] = useState<'floor' | 'elevation' | 'foundation' | 'camp'>('floor');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  const { floorPlan, elevation, campLayout } = blueprints;
  const unitW = unitDimensions.width || 4;
  const unitL = unitDimensions.length || 6;
  const unitH = unitDimensions.height || 2.8;

  const isRtl = lang === "ar";

  // Translate helper
  const tr = (arText: string, enText: string) => (lang === "ar" ? arText : enText);

  // Render SVG for Floor Plan
  const renderFloorPlan = () => {
    const scale = 50; // pixels per meter
    const pad = 40;
    const drawW = floorPlan.dimensions.w * scale;
    const drawH = floorPlan.dimensions.h * scale;
    const viewW = drawW + pad * 2;
    const viewH = drawH + pad * 2;

    return (
      <div className={`flex flex-col md:flex-row gap-6 ${isRtl ? "text-right" : "text-left"}`}>
        <div className="flex-1 bg-slate-900 rounded-xl p-4 border border-slate-800 flex justify-center items-center overflow-auto">
          <svg
            id="floor-plan-svg"
            width={viewW}
            height={viewH}
            viewBox={`0 0 ${viewW} ${viewH}`}
            className="font-mono text-slate-300"
          >
            {/* Grid Pattern */}
            <defs>
              <pattern id="blueprint-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width={viewW} height={viewH} fill="url(#blueprint-grid)" rx="8" />

            {/* Drawing Area border */}
            <rect
              x={pad}
              y={pad}
              width={drawW}
              height={drawH}
              fill="rgba(30, 41, 59, 0.5)"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* Outer walls */}
            <rect
              x={pad}
              y={pad}
              width={drawW}
              height={drawH}
              fill="none"
              stroke="#60a5fa"
              strokeWidth="10"
              strokeLinejoin="miter"
            />

            {/* Rooms and Elements */}
            {floorPlan.rooms.map((room, idx) => {
              const rx = pad + room.x * scale;
              const ry = pad + room.y * scale;
              const rw = room.w * scale;
              const rh = room.h * scale;

              const isSelected = selectedElement === `room-${idx}`;

              return (
                <g 
                  key={idx} 
                  className="cursor-pointer" 
                  onClick={() => setSelectedElement(`room-${idx}`)}
                >
                  {/* Room Area */}
                  {room.type === 'room' || room.type === 'living' ? (
                    <rect
                      x={rx}
                      y={ry}
                      width={rw}
                      height={rh}
                      fill={isSelected ? "rgba(96, 165, 250, 0.15)" : "rgba(255, 255, 255, 0.02)"}
                      stroke="#38bdf8"
                      strokeWidth="3"
                    />
                  ) : room.type === 'toilet' ? (
                    <rect
                      x={rx}
                      y={ry}
                      width={rw}
                      height={rh}
                      fill={isSelected ? "rgba(244, 63, 94, 0.15)" : "rgba(244, 63, 94, 0.05)"}
                      stroke="#f43f5e"
                      strokeWidth="3"
                    />
                  ) : room.type === 'kitchen' ? (
                    <rect
                      x={rx}
                      y={ry}
                      width={rw}
                      height={rh}
                      fill={isSelected ? "rgba(234, 179, 8, 0.15)" : "rgba(234, 179, 8, 0.05)"}
                      stroke="#eab308"
                      strokeWidth="3"
                    />
                  ) : null}

                  {/* Bed drawing representation */}
                  {room.type === 'bed' && (
                    <g>
                      <rect
                        x={rx + 2}
                        y={ry + 2}
                        width={rw - 4}
                        height={rh - 4}
                        fill="rgba(16, 185, 129, 0.2)"
                        stroke="#10b981"
                        strokeWidth="1.5"
                        rx="2"
                      />
                      {/* Pillow */}
                      <rect
                        x={rx + 5}
                        y={ry + 5}
                        width={rw - 10}
                        height={rh * 0.25}
                        fill="rgba(255, 255, 255, 0.2)"
                        stroke="#10b981"
                        strokeWidth="1"
                        rx="1"
                      />
                    </g>
                  )}

                  {/* Door drawing representation */}
                  {room.type === 'door' && (
                    <g>
                      <path
                        d={`M ${rx} ${ry} A ${rw} ${rw} 0 0 1 ${rx + rw} ${ry + rw}`}
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="2"
                      />
                    </g>
                  )}

                  {/* Room name label */}
                  {(room.type === 'room' || room.type === 'living' || room.type === 'toilet' || room.type === 'kitchen') && (
                    <g>
                      <text
                        x={rx + rw / 2}
                        y={ry + rh / 2 - 2}
                        textAnchor="middle"
                        className="text-[11px] font-bold fill-white"
                      >
                        {room.name}
                      </text>
                      <text
                        x={rx + rw / 2}
                        y={ry + rh / 2 + 10}
                        textAnchor="middle"
                        className="text-[9px] fill-slate-400"
                      >
                        {`${room.w.toFixed(1)}m × ${room.h.toFixed(1)}m`}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Dimension Lines (Width) */}
            <g>
              <line x1={pad} y1={pad - 15} x2={pad + drawW} y2={pad - 15} stroke="#a7f3d0" strokeWidth="1.5" />
              <line x1={pad} y1={pad - 20} x2={pad} y2={pad - 10} stroke="#a7f3d0" strokeWidth="1.5" />
              <line x1={pad + drawW} y1={pad - 20} x2={pad + drawW} y2={pad - 10} stroke="#a7f3d0" strokeWidth="1.5" />
              <text
                x={pad + drawW / 2}
                y={pad - 22}
                textAnchor="middle"
                className="text-[10px] font-bold fill-emerald-400"
              >
                {`${floorPlan.dimensions.w} ${tr("متر (العرض الكلي)", "m (Total Width)")}`}
              </text>
            </g>

            {/* Dimension Lines (Length) */}
            <g>
              <line x1={pad + drawW + 15} y1={pad} x2={pad + drawW + 15} y2={pad + drawH} stroke="#a7f3d0" strokeWidth="1.5" />
              <line x1={pad + drawW + 10} y1={pad} x2={pad + drawW + 20} y2={pad} stroke="#a7f3d0" strokeWidth="1.5" />
              <line x1={pad + drawW + 10} y1={pad + drawH} x2={pad + drawW + 20} y2={pad + drawH} stroke="#a7f3d0" strokeWidth="1.5" />
              <text
                x={pad + drawW + 22}
                y={pad + drawH / 2}
                textAnchor="start"
                alignmentBaseline="middle"
                className="text-[10px] font-bold fill-emerald-400"
                style={{ transform: `rotate(90deg) translate(${pad + drawH/2}px, -${pad + drawW + 35}px)` }}
              >
                {`${floorPlan.dimensions.h} ${tr("متر (الطول الكلي)", "m (Total Length)")}`}
              </text>
            </g>

            {/* Compass rose */}
            <g transform={`translate(${pad + 35}, ${pad + 35})`} className="opacity-40">
              <circle cx="0" cy="0" r="20" fill="none" stroke="white" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="0" y1="-25" x2="0" y2="25" stroke="white" strokeWidth="1" />
              <line x1="-25" y1="0" x2="25" y2="0" stroke="white" strokeWidth="1" />
              <polygon points="0,-25 -4,-5 0,0" fill="#ef4444" />
              <polygon points="0,25 4,5 0,0" fill="white" />
              <text x="0" y="-28" textAnchor="middle" className="text-[9px] font-bold fill-white">N</text>
            </g>

            {/* Scale indicator */}
            <g transform={`translate(${pad}, ${pad + drawH + 20})`}>
              <rect width="50" height="4" fill="white" />
              <rect x="50" width="50" height="4" fill="#60a5fa" />
              <text x="0" y="15" className="text-[9px] fill-slate-400">0</text>
              <text x="50" y="15" className="text-[9px] fill-slate-400">1m</text>
              <text x="100" y="15" className="text-[9px] fill-slate-400">{`2m ${tr("(مقياس الرسم)", "(Scale)")}`}</text>
            </g>
          </svg>
        </div>

        {/* Floor Plan Description Card */}
        <div className="w-full md:w-80 flex flex-col gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase tracking-wider text-indigo-600 font-bold block mb-1">
              {tr("تفاصيل المخطط الأفقي", "Floor Plan Details")}
            </span>
            <h5 className="font-bold text-slate-800 text-sm mb-2">
              {floorPlan.rooms.filter(r => r.type === 'room' || r.type === 'living').length} {tr("غرف + مطبخ وحمام", "Rooms + Kitchen & Toilet")}
            </h5>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">{floorPlanDescription}</p>
            <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
              <span className="text-xs font-semibold text-slate-700 block">{tr("العناصر المعمارية في المخطط:", "Architectural Elements:")}</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-3 h-3 bg-sky-500/10 border border-sky-400 rounded-sm block"></span>
                  <span>{tr("غرف معيشة/نوم", "Living/Bedrooms")}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-3 h-3 bg-rose-500/10 border border-rose-400 rounded-sm block"></span>
                  <span>{tr("المرفق الصحي (حمام)", "Sanitary (Toilet)")}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-3 h-3 bg-yellow-500/10 border border-yellow-400 rounded-sm block"></span>
                  <span>{tr("مطبخ تحضيري", "Prep Kitchen")}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-3 h-3 bg-emerald-500/20 border border-emerald-500 rounded-sm block"></span>
                  <span>{tr("أسِرّة للنوم", "Beds / Sleeping")}</span>
                </div>
              </div>
            </div>
          </div>

          {selectedElement && (
            <div className="bg-indigo-50 p-3.5 rounded-xl border border-indigo-100 text-xs text-indigo-900 animate-fade-in">
              <h6 className="font-bold mb-1">{tr("العنصر المحدد:", "Selected Element:")}</h6>
              {(() => {
                const idx = parseInt(selectedElement.split('-')[1]);
                const item = floorPlan.rooms[idx];
                return (
                  <div>
                    <span className="font-medium text-indigo-700 block">{item.name}</span>
                    <span className="text-slate-500 block mt-0.5">{tr("المساحة:", "Area:")} {item.w}m × {item.h}m = {(item.w * item.h).toFixed(1)}m²</span>
                    <span className="text-slate-500 block">{tr("الإحداثيات:", "Coordinates:")} x: {item.x}m, y: {item.y}m</span>
                  </div>
                );
              })()}
              <button 
                onClick={() => setSelectedElement(null)}
                className="text-indigo-600 font-semibold hover:underline mt-2 block cursor-pointer"
              >
                {tr("إلغاء التحديد", "Deselect")}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render SVG for Elevations (Façade)
  const renderElevation = () => {
    const scale = 50;
    const pad = 40;
    const widthMeters = floorPlan.dimensions.w;
    const drawW = widthMeters * scale;
    const wallH = elevation.wallHeight * scale;
    const roofH = elevation.roofHeight * scale;
    const viewW = drawW + pad * 2;
    const viewH = wallH + roofH + pad * 2;

    const roofY = pad + roofH;
    const groundY = roofY + wallH;

    return (
      <div className={`flex flex-col md:flex-row gap-6 ${isRtl ? "text-right" : "text-left"}`}>
        <div className="flex-1 bg-slate-900 rounded-xl p-4 border border-slate-800 flex justify-center items-center overflow-auto">
          <svg
            id="elevation-svg"
            width={viewW}
            height={viewH}
            viewBox={`0 0 ${viewW} ${viewH}`}
            className="font-mono text-slate-300"
          >
            {/* Grid background */}
            <rect width={viewW} height={viewH} fill="url(#blueprint-grid)" rx="8" />

            {/* Ground Line */}
            <line x1={0} y1={groundY} x2={viewW} y2={groundY} stroke="#475569" strokeWidth="6" />
            <rect x="0" y={groundY + 3} width={viewW} height={viewH - groundY - 3} fill="rgba(71, 85, 105, 0.15)" />

            {/* Wall Frame */}
            <rect
              x={pad}
              y={roofY}
              width={drawW}
              height={wallH}
              fill="rgba(241, 245, 249, 0.05)"
              stroke="#60a5fa"
              strokeWidth="4"
            />

            {/* Wall cladding texture lines */}
            {Array.from({ length: Math.floor(elevation.wallHeight * 5) }).map((_, i) => (
              <line
                key={i}
                x1={pad}
                y1={roofY + (i + 1) * (wallH / (elevation.wallHeight * 5))}
                x2={pad + drawW}
                y2={roofY + (i + 1) * (wallH / (elevation.wallHeight * 5))}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
            ))}

            {/* Roof rendering based on type */}
            {elevation.roofType === 'sloped' ? (
              <g>
                <polygon
                  points={`${pad},${roofY} ${pad + drawW / 2},${pad} ${pad + drawW},${roofY}`}
                  fill="rgba(239, 68, 68, 0.1)"
                  stroke="#ef4444"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
                <line x1={pad} y1={roofY} x2={pad + drawW / 2} y2={pad} stroke="rgba(239, 68, 68, 0.4)" strokeWidth="2" />
                <line x1={pad + drawW} y1={roofY} x2={pad + drawW / 2} y2={pad} stroke="rgba(239, 68, 68, 0.4)" strokeWidth="2" />
              </g>
            ) : elevation.roofType === 'dome' ? (
              <path
                d={`M ${pad} ${roofY} A ${drawW/2} ${roofH} 0 0 1 ${pad + drawW} ${roofY}`}
                fill="rgba(239, 68, 68, 0.1)"
                stroke="#ef4444"
                strokeWidth="4"
              />
            ) : (
              <rect
                x={pad - 5}
                y={roofY - 10}
                width={drawW + 10}
                height="10"
                fill="rgba(239, 68, 68, 0.2)"
                stroke="#ef4444"
                strokeWidth="3"
                rx="1"
              />
            )}

            {/* Main Entrance Door on elevation */}
            <rect
              x={pad + drawW / 2 - 20}
              y={groundY - 80}
              width="40"
              height="80"
              fill="rgba(15, 23, 42, 0.8)"
              stroke="#f97316"
              strokeWidth="2.5"
            />
            <circle cx={pad + drawW / 2 - 12} cy={groundY - 40} r="2.5" fill="#f97316" />

            {/* Windows on elevation */}
            <rect
              x={pad + 30}
              y={roofY + 30}
              width="50"
              height="40"
              fill="rgba(56, 189, 248, 0.2)"
              stroke="#38bdf8"
              strokeWidth="2"
            />
            <line x1={pad + 55} y1={roofY + 30} x2={pad + 55} y2={roofY + 70} stroke="#38bdf8" strokeWidth="1" />
            <line x1={pad + 30} y1={roofY + 50} x2={pad + 80} y2={roofY + 50} stroke="#38bdf8" strokeWidth="1" />

            <rect
              x={pad + drawW - 80}
              y={roofY + 30}
              width="50"
              height="40"
              fill="rgba(56, 189, 248, 0.2)"
              stroke="#38bdf8"
              strokeWidth="2"
            />
            <line x1={pad + drawW - 55} y1={roofY + 30} x2={pad + drawW - 55} y2={roofY + 70} stroke="#38bdf8" strokeWidth="1" />
            <line x1={pad + drawW - 80} y1={roofY + 50} x2={pad + drawW - 30} y2={roofY + 50} stroke="#38bdf8" strokeWidth="1" />

            {/* Height Dimensions Labels */}
            <g>
              <line x1={pad - 15} y1={pad} x2={pad - 15} y2={groundY} stroke="#34d399" strokeWidth="1" />
              <line x1={pad - 20} y1={pad} x2={pad - 10} y2={pad} stroke="#34d399" strokeWidth="1" />
              <line x1={pad - 20} y1={groundY} x2={pad - 10} y2={groundY} stroke="#34d399" strokeWidth="1" />
              <text
                x={pad - 22}
                y={(pad + groundY) / 2}
                textAnchor="end"
                alignmentBaseline="middle"
                className="text-[9px] fill-emerald-400"
              >
                {`${tr("الارتفاع الكلي: ", "Total Height: ")}${(elevation.wallHeight + elevation.roofHeight).toFixed(1)}m`}
              </text>

              <line x1={pad - 2} y1={roofY} x2={pad - 2} y2={groundY} stroke="#38bdf8" strokeWidth="1" />
              <text
                x={pad + 5}
                y={roofY + wallH / 2}
                textAnchor="start"
                className="text-[9px] fill-sky-400 font-bold"
              >
                {`${tr("الجدار: ", "Wall: ")}${elevation.wallHeight}m`}
              </text>
            </g>
          </svg>
        </div>

        <div className="w-full md:w-80 bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-3">
          <span className="text-[10px] uppercase tracking-wider text-indigo-600 font-bold block mb-1">
            {tr("بيانات الواجهة المعمارية", "Elevation & Facade Data")}
          </span>
          <div>
            <span className="text-xs text-slate-400 block">{tr("وصف الواجهة", "Facade Description")}</span>
            <p className="text-xs font-semibold text-slate-800 leading-relaxed">{elevation.facadeType}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">{tr("شكل وتصميم السقف", "Roof Design & Shape")}</span>
            <p className="text-xs font-semibold text-slate-800">
              {elevation.roofType === 'sloped' ? tr("سقف جملوني مائل (منحدر لتدفق المياه والثلوج)", "Gabled sloped roof (sheds water and snow)") :
               elevation.roofType === 'dome' ? tr("سقف قبيّ (مقاوم للرياح العاتية والهزات)", "Domed roof (wind and seismic resistant)") : tr("سقف مستوٍ معزز", "Reinforced flat roof")}
            </p>
          </div>
          <div className="border-t border-slate-100 pt-3">
            <span className="text-xs font-semibold text-slate-700 block mb-2">{tr("المواد الإنشائية المستهدفة:", "Target Building Materials:")}</span>
            <ul className="flex flex-col gap-1.5">
              {elevation.materials.map((mat, i) => (
                <li key={i} className="text-xs text-slate-600 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                  {mat}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // Render SVG for Foundations
  const renderFoundation = () => {
    const scale = 50;
    const pad = 40;
    const drawW = floorPlan.dimensions.w * scale;
    const drawH = floorPlan.dimensions.h * scale;
    const viewW = drawW + pad * 2;
    const viewH = drawH + pad * 2;

    return (
      <div className={`flex flex-col md:flex-row gap-6 ${isRtl ? "text-right" : "text-left"}`}>
        <div className="flex-1 bg-slate-900 rounded-xl p-4 border border-slate-800 flex justify-center items-center overflow-auto">
          <svg
            id="foundation-svg"
            width={viewW}
            height={viewH}
            viewBox={`0 0 ${viewW} ${viewH}`}
            className="font-mono text-slate-300"
          >
            <rect width={viewW} height={viewH} fill="url(#blueprint-grid)" rx="8" />

            {/* Base Slab Area */}
            <rect
              x={pad}
              y={pad}
              width={drawW}
              height={drawH}
              fill="rgba(148, 163, 184, 0.12)"
              stroke="#cbd5e1"
              strokeWidth="5"
            />

            {/* Rebar Mesh Mockup */}
            {Array.from({ length: Math.floor(floorPlan.dimensions.w) }).map((_, i) => (
              <line
                key={`v-${i}`}
                x1={pad + (i + 1) * (drawW / Math.floor(floorPlan.dimensions.w))}
                y1={pad}
                x2={pad + (i + 1) * (drawW / Math.floor(floorPlan.dimensions.w))}
                y2={pad + drawH}
                stroke="rgba(239, 68, 68, 0.25)"
                strokeWidth="1.5"
              />
            ))}
            {Array.from({ length: Math.floor(floorPlan.dimensions.h) }).map((_, i) => (
              <line
                key={`h-${i}`}
                x1={pad}
                y1={pad + (i + 1) * (drawH / Math.floor(floorPlan.dimensions.h))}
                x2={pad + drawW}
                y2={pad + (i + 1) * (drawH / Math.floor(floorPlan.dimensions.h))}
                stroke="rgba(239, 68, 68, 0.25)"
                strokeWidth="1.5"
              />
            ))}

            {/* Anchor Points / Piles at corners */}
            <g fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5">
              <circle cx={pad} cy={pad} r="7" />
              <circle cx={pad + drawW} cy={pad} r="7" />
              <circle cx={pad + drawW} cy={pad + drawH} r="7" />
              <circle cx={pad} cy={pad + drawH} r="7" />

              <circle cx={pad + drawW / 2} cy={pad} r="5" />
              <circle cx={pad + drawW / 2} cy={pad + drawH} r="5" />
              <circle cx={pad} cy={pad + drawH / 2} r="5" />
              <circle cx={pad + drawW} cy={pad + drawH / 2} r="5" />
            </g>

            {/* Ground insulation water membrane overlay lines */}
            <path
              d={`M ${pad + 20} ${pad + 20} L ${pad + drawW - 20} ${pad + 20} L ${pad + drawW - 20} ${pad + drawH - 20} L ${pad + 20} ${pad + drawH - 20} Z`}
              fill="none"
              stroke="#10b981"
              strokeWidth="1.5"
              strokeDasharray="5 3"
            />

            {/* Legends */}
            <g transform={`translate(${pad + 15}, ${pad + drawH - 50})`} className="text-[9px]">
              <rect width="130" height="40" fill="rgba(15,23,42,0.9)" stroke="rgba(255,255,255,0.1)" rx="4" />
              <circle cx="15" cy="12" r="4" fill="#f59e0b" />
              <text x="25" y="15" className="fill-white font-bold">{tr("ركائز تثبيت / أوتاد مقاومة", "Foundation Piles/Anchors")}</text>
              <line x1="10" y1="28" x2="20" y2="28" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 2" />
              <text x="25" y="31" className="fill-slate-300">{tr("غشاء عزل رطوبة ومياه", "Moisture/waterproof seal")}</text>
            </g>
          </svg>
        </div>

        <div className="w-full md:w-80 bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-3">
          <span className="text-[10px] uppercase tracking-wider text-indigo-600 font-bold block mb-1">
            {tr("الأساسات والتدعيم الأرضي", "Foundation & Groundwork")}
          </span>
          <div>
            <span className="text-xs text-slate-400 block font-semibold">{tr("نوع الأساسات المقترح", "Suggested Foundation Type")}</span>
            <p className="text-xs font-bold text-slate-800 mt-1">{foundationType}</p>
          </div>
          <div className="border-t border-slate-100 pt-3">
            <span className="text-xs font-semibold text-slate-700 block mb-2 flex items-center gap-1.5">
              <Hammer className="w-3.5 h-3.5 text-indigo-600" />
              {tr("تعليمات التأسيس والمقاومة:", "Anchoring & Civil Guidelines:")}
            </span>
            <ul className="flex flex-col gap-2 text-xs text-slate-600">
              <li className="flex gap-2">
                <span className="text-indigo-600 font-bold">1.</span>
                <span>{tr("تسوية التربة وتدميكها جيداً قبل وضع أي حشوة عازلة.", "Grade and compact soil thoroughly before insulation placement.")}</span>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-600 font-bold">2.</span>
                <span>{tr("زرع الركائز والأوتاد الأرضية بعمق لا يقل عن 50-80 سم لمقاومة الرياح والهزات.", "Drive foundation piles 50-80cm deep for wind and seismic uplift resistance.")}</span>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-600 font-bold">3.</span>
                <span>{tr("تطبيق عازل مائي بلاستيكي (Membrane) سميك لمنع صعود رطوبة التربة للملجأ.", "Apply a thick polymer moisture barrier to prevent soil dampness rising.")}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // Render SVG for Camp Layout
  const renderCampLayout = () => {
    const scale = 2.5; 
    const pad = 45;
    const viewW = 550;
    const viewH = 360;

    return (
      <div className={`flex flex-col md:flex-row gap-6 ${isRtl ? "text-right" : "text-left"}`}>
        <div className="flex-1 bg-slate-900 rounded-xl p-4 border border-slate-800 flex justify-center items-center overflow-auto">
          <svg
            id="camp-layout-svg"
            width={viewW}
            height={viewH}
            viewBox={`0 0 ${viewW} ${viewH}`}
            className="font-mono text-slate-300"
          >
            <rect width={viewW} height={viewH} fill="url(#blueprint-grid)" rx="8" />

            <rect
              x={pad}
              y={pad}
              width={viewW - pad * 2}
              height={viewH - pad * 2}
              fill="rgba(15, 23, 42, 0.4)"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="2"
              strokeDasharray="5 5"
            />

            {/* Render camp facilities */}
            {campLayout.facilities.map((fac, idx) => {
              const fx = pad + fac.x * scale;
              const fy = pad + fac.y * scale;
              const fw = fac.w * scale;
              const fh = fac.h * scale;

              let color = "#38bdf8"; 
              let fill = "rgba(56, 189, 248, 0.15)";

              if (fac.type === "water") {
                color = "#3b82f6"; 
                fill = "rgba(59, 130, 246, 0.3)";
              } else if (fac.type === "medical") {
                color = "#ef4444"; 
                fill = "rgba(239, 68, 68, 0.3)";
              } else if (fac.type === "admin") {
                color = "#f59e0b"; 
                fill = "rgba(245, 158, 11, 0.3)";
              } else if (fac.type === "latrines") {
                color = "#a855f7"; 
                fill = "rgba(168, 85, 247, 0.3)";
              } else if (fac.type === "space") {
                color = "#10b981"; 
                fill = "rgba(16, 185, 129, 0.15)";
              } else if (fac.type === "neighborhood") {
                color = "#8b5cf6"; 
                fill = "rgba(139, 92, 246, 0.2)";
              } else if (fac.type === "road_hub") {
                color = "#94a3b8"; 
                fill = "rgba(148, 163, 184, 0.25)";
              } else if (fac.type === "green_zone") {
                color = "#10b981"; 
                fill = "rgba(16, 185, 129, 0.25)";
              } else if (fac.type === "market") {
                color = "#d946ef"; 
                fill = "rgba(217, 70, 239, 0.2)";
              } else if (fac.type === "hospital") {
                color = "#f43f5e"; 
                fill = "rgba(244, 63, 94, 0.3)";
              } else if (fac.type === "traffic_control") {
                color = "#06b6d4"; 
                fill = "rgba(6, 182, 212, 0.2)";
              } else if (fac.type === "expansion_zone") {
                color = "#6366f1"; 
                fill = "rgba(99, 102, 241, 0.1)";
              } else if (fac.type === "utility_hub") {
                color = "#f59e0b"; 
                fill = "rgba(245, 158, 11, 0.3)";
              }

              const isSelected = selectedElement === `camp-${idx}`;

              return (
                <g 
                  key={idx} 
                  className="cursor-pointer"
                  onClick={() => setSelectedElement(`camp-${idx}`)}
                >
                  <rect
                    x={fx}
                    y={fy}
                    width={fw}
                    height={fh}
                    fill={isSelected ? "rgba(255, 255, 255, 0.3)" : fill}
                    stroke={color}
                    strokeWidth={isSelected ? "3" : "1.5"}
                    rx={fac.type === "water" ? "8" : "2"}
                  />
                  {fac.type === "medical" && (
                    <path
                      d={`M ${fx + fw/2} ${fy + fh/2 - 6} L ${fx + fw/2} ${fy + fh/2 + 6} M ${fx + fw/2 - 6} ${fy + fh/2} L ${fx + fw/2 + 6} ${fy + fh/2}`}
                      stroke="#ef4444"
                      strokeWidth="2.5"
                    />
                  )}
                  {fw > 20 && (
                    <text
                      x={fx + fw / 2}
                      y={fy + fh - 4}
                      textAnchor="middle"
                      className="text-[8px] fill-slate-300 font-bold"
                    >
                      {fac.name}
                    </text>
                  )}
                </g>
              );
            })}

            <g transform={`translate(${viewW - 55}, ${viewH - 55})`} className="opacity-50">
              <circle cx="0" cy="0" r="15" fill="none" stroke="white" strokeWidth="1" />
              <line x1="0" y1="-20" x2="0" y2="20" stroke="white" strokeWidth="1" />
              <line x1="-20" y1="0" x2="20" y2="0" stroke="white" strokeWidth="1" />
              <text x="0" y="-22" textAnchor="middle" className="text-[8px] fill-white">N</text>
              <text x="22" y="3" textAnchor="start" className="text-[8px] fill-white">E</text>
            </g>

            <line x1={0} y1={pad + 15} x2={pad} y2={pad + 15} stroke="#64748b" strokeWidth="10" strokeDasharray="3 3" />
            <text x="5" y={pad + 8} className="text-[7px] fill-slate-400">{tr("طريق الخدمة الرئيسي", "Main Service Road")}</text>
          </svg>
        </div>

        <div className="w-full md:w-80 bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-3">
          <span className="text-[10px] uppercase tracking-wider text-indigo-600 font-bold block mb-1">
            {tr("تنظيم وتوزيع المخيم", "Camp Layout Planning")}
          </span>
          <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-100 text-xs">
            <span className="text-slate-500">{tr("صفوف × أعمدة الملاجئ:", "Grid Rows × Cols:")}</span>
            <span className="font-bold text-indigo-700">{campLayout.gridRows} × {campLayout.gridCols}</span>
          </div>
          <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-100 text-xs">
            <span className="text-slate-500">{tr("المسافة الآمنة الموصى بها:", "Recommended Safe Spacing:")}</span>
            <span className="font-bold text-indigo-700">{campLayout.spacing} {tr("أمتار", "meters")}</span>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <span className="text-xs font-semibold text-slate-700 block mb-2 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              {tr("مرافق المخيم الخدمية:", "Camp Infrastructure & Zoning:")}
            </span>
            <div className="flex flex-col gap-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-sky-500/20 border border-sky-400 rounded-sm"></span>
                  <span>{tr("الوحدات السكنية لإيواء الأسر", "Family Housing Shelters")}</span>
                </div>
                <span className="font-semibold text-slate-700">x{campLayout.facilities.filter(f => f.type === 'shelter').length}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-blue-500/30 border border-blue-500 rounded-sm"></span>
                  <span>{tr("نقطة مياه وخزان مشترك", "Shared Water Stations")}</span>
                </div>
                <span className="font-semibold text-slate-700">x{campLayout.facilities.filter(f => f.type === 'water').length}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-red-500/30 border border-red-500 rounded-sm"></span>
                  <span>{tr("العيادة والنقطة الطبية", "Medical & First-Aid Center")}</span>
                </div>
                <span className="font-semibold text-slate-700">x{campLayout.facilities.filter(f => f.type === 'medical').length}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-amber-500/30 border border-amber-500 rounded-sm"></span>
                  <span>{tr("مقر الإدارة والتنسيق الميداني", "Command & Admin HQ")}</span>
                </div>
                <span className="font-semibold text-slate-700">x{campLayout.facilities.filter(f => f.type === 'admin').length}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-purple-500/30 border border-purple-500 rounded-sm"></span>
                  <span>{tr("مرافق صحية عامة (حمامات)", "Sanitation & Public Latrines")}</span>
                </div>
                <span className="font-semibold text-slate-700">x{campLayout.facilities.filter(f => f.type === 'latrines').length}</span>
              </div>
            </div>
          </div>

          {selectedElement && selectedElement.startsWith("camp") && (
            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 text-xs text-emerald-900 mt-2">
              <span className="font-bold block mb-0.5">{tr("تفاصيل المرفق:", "Facility Details:")}</span>
              {(() => {
                const idx = parseInt(selectedElement.split('-')[1]);
                const f = campLayout.facilities[idx];
                return (
                  <div>
                    <span className="font-medium text-emerald-800 block">{f.name}</span>
                    <span className="text-slate-500 block mt-0.5">{tr("المقاس:", "Size:")} {f.w}m × {f.h}m = {(f.w * f.h).toFixed(1)}m²</span>
                    <span className="text-slate-500 block">{tr("الموضع بالمخيم:", "Camp position:")} X: {f.x}m, Y: {f.y}m</span>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100" dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Layout className="w-5 h-5 text-indigo-600" />
            {tr("المخططات والخرائط الهندسية الأولية", "Architectural & Engineering Blueprints")}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {tr("مخططات ناقلة للمساحات والأبعاد وتوزيع المرافق بدقة هندسية.", "Precise scale drawing of space layouts, elevation features, and camp planning.")}
          </p>
        </div>
        <div className={`flex gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-100 self-stretch sm:self-auto overflow-x-auto ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
          <button
            id="tab-floor-btn"
            onClick={() => { setActiveTab('floor'); setSelectedElement(null); }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'floor' ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-800"
            }`}
          >
            {tr("المسقط الأفقي (Floor Plan)", "Floor Plan")}
          </button>
          <button
            id="tab-elevation-btn"
            onClick={() => { setActiveTab('elevation'); setSelectedElement(null); }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'elevation' ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-800"
            }`}
          >
            {tr("الواجهات (Elevations)", "Elevations")}
          </button>
          <button
            id="tab-foundation-btn"
            onClick={() => { setActiveTab('foundation'); setSelectedElement(null); }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'foundation' ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-800"
            }`}
          >
            {tr("الأساسات (Foundations)", "Foundations")}
          </button>
          <button
            id="tab-camp-btn"
            onClick={() => { setActiveTab('camp'); setSelectedElement(null); }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'camp' ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-800"
            }`}
          >
            {tr("مخطط المخيم (Camp Layout)", "Camp Layout")}
          </button>
        </div>
      </div>

      <div className="mt-4">
        {activeTab === 'floor' && renderFloorPlan()}
        {activeTab === 'elevation' && renderElevation()}
        {activeTab === 'foundation' && renderFoundation()}
        {activeTab === 'camp' && renderCampLayout()}
      </div>
    </div>
  );
}
