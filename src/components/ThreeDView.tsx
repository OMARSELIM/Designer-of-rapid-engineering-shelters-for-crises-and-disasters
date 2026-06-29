import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCw, RefreshCw, ZoomIn, ZoomOut, Layers, Eye } from "lucide-react";

interface ThreeDViewProps {
  unitDimensions: {
    width: number;
    length: number;
    height: number;
  };
  roofType?: 'flat' | 'sloped' | 'dome' | string;
  shelterType?: string;
  lang?: "ar" | "en";
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Face {
  indices: number[];
  color: string;
  normal?: Point3D;
  isRoof?: boolean;
}

export default function ThreeDView({ unitDimensions, roofType = "sloped", shelterType = "", lang = "ar" }: ThreeDViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Width, length, height scaled for drawing
  const w = unitDimensions.width || 4;
  const l = unitDimensions.length || 6;
  const h = unitDimensions.height || 2.8;

  const isEarthbag = shelterType.includes("طين") || shelterType.includes("تراب") || shelterType.includes("dome") || shelterType.includes("قبة") || shelterType.toLowerCase().includes("clay") || shelterType.toLowerCase().includes("soil") || shelterType.toLowerCase().includes("earth");
  const isSteel = shelterType.includes("فولاذ") || shelterType.includes("معدن") || shelterType.includes("حديد") || shelterType.toLowerCase().includes("steel") || shelterType.toLowerCase().includes("metal");
  const isTimber = shelterType.includes("خشب") || shelterType.includes("أخشاب") || shelterType.toLowerCase().includes("wood") || shelterType.toLowerCase().includes("timber");

  const [yaw, setYaw] = useState<number>(-45); // degrees
  const [pitch, setPitch] = useState<number>(-25); // degrees
  const [zoom, setZoom] = useState<number>(1.2);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [renderMode, setRenderMode] = useState<'solid' | 'wireframe' | 'xray'>('solid');
  const [showLabels, setShowLabels] = useState<boolean>(true);

  // Handle Dragging / Orbit controls
  const isDragging = useRef<boolean>(false);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const isRtl = lang === "ar";
  const tr = (arText: string, enText: string) => (lang === "ar" ? arText : enText);

  useEffect(() => {
    let animationFrameId: number;

    const tick = () => {
      if (isRotating) {
        setYaw((prev) => (prev + 0.4) % 360);
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    if (isRotating) {
      animationFrameId = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRotating]);

  // Main Draw function
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Responsive Canvas Resizing
    const rect = containerRef.current?.getBoundingClientRect();
    canvas.width = (rect?.width || 500) * window.devicePixelRatio;
    canvas.height = 360 * window.devicePixelRatio;
    canvas.style.width = "100%";
    canvas.style.height = "360px";
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const cx = canvas.width / (2 * window.devicePixelRatio);
    const cy = canvas.height / (2 * window.devicePixelRatio) + 20;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set styling based on shelterType
    let wallColor = "rgba(224, 231, 255, 0.85)"; // slate Indigo
    let roofColor = "rgba(239, 68, 68, 0.9)"; // Red
    let strokeColor = "#312e81"; // Indigo-900

    if (isEarthbag) {
      wallColor = "rgba(217, 119, 6, 0.8)"; // Amber/clay
      roofColor = "rgba(180, 83, 9, 0.9)";
      strokeColor = "#78350f";
    } else if (isSteel) {
      wallColor = "rgba(203, 213, 225, 0.85)"; // Slate/steel
      roofColor = "rgba(59, 130, 246, 0.9)"; // Blue steel
      strokeColor = "#1e293b";
    } else if (isTimber) {
      wallColor = "rgba(180, 83, 9, 0.8)"; // Wood brown
      roofColor = "rgba(120, 53, 4, 0.9)";
      strokeColor = "#451a03";
    }

    // 1. Generate 3D Points
    const scaleFactor = 30 * zoom;

    const vertices: Point3D[] = [];
    // Base 4 points (Z = 0)
    vertices.push({ x: -w/2, y: -l/2, z: 0 }); // 0
    vertices.push({ x: w/2, y: -l/2, z: 0 });  // 1
    vertices.push({ x: w/2, y: l/2, z: 0 });   // 2
    vertices.push({ x: -w/2, y: l/2, z: 0 });  // 3

    // Wall Top 4 points (Z = h)
    vertices.push({ x: -w/2, y: -l/2, z: h }); // 4
    vertices.push({ x: w/2, y: -l/2, z: h });  // 5
    vertices.push({ x: w/2, y: l/2, z: h });   // 6
    vertices.push({ x: -w/2, y: l/2, z: h });  // 7

    // Roof Top Ridge Points
    let roofHeightVal = roofType === "flat" ? 0 : 0.8;
    if (roofType === "sloped") {
      // Gable ridge along the length
      vertices.push({ x: 0, y: -l/2, z: h + roofHeightVal }); // 8 (ridge front)
      vertices.push({ x: 0, y: l/2, z: h + roofHeightVal });  // 9 (ridge back)
    } else if (roofType === "dome") {
      vertices.push({ x: 0, y: 0, z: h + 1.2 }); // 8 (dome apex)
    }

    // 2. Projection Trigonometry (3D to 2D)
    const radYaw = (yaw * Math.PI) / 180;
    const radPitch = (pitch * Math.PI) / 180;

    const cosY = Math.cos(radYaw);
    const sinY = Math.sin(radYaw);
    const cosP = Math.cos(radPitch);
    const sinP = Math.sin(radPitch);

    const projectPoint = (p: Point3D) => {
      // Rotate Z (Yaw)
      const x1 = p.x * cosY - p.y * sinY;
      const y1 = p.x * sinY + p.y * cosY;
      const z1 = p.z;

      // Rotate X (Pitch)
      const x2 = x1;
      const y2 = y1 * cosP - z1 * sinP;
      const z2 = y1 * sinP + z1 * cosP;

      // Project onto 2D screen
      return {
        x: cx + x2 * scaleFactor,
        y: cy + y2 * scaleFactor,
        depth: z2 // for sorting
      };
    };

    // 3. Define faces for drawing
    const faces: Face[] = [];

    // Walls (Solid)
    faces.push({ indices: [0, 1, 5, 4], color: wallColor }); // Front Wall
    faces.push({ indices: [1, 2, 6, 5], color: wallColor }); // Right Wall
    faces.push({ indices: [2, 3, 7, 6], color: wallColor }); // Back Wall
    faces.push({ indices: [3, 0, 4, 7], color: wallColor }); // Left Wall

    // Roof elements based on type
    if (roofType === "sloped") {
      faces.push({ indices: [4, 5, 8], color: wallColor, isRoof: true }); // Front triangle gable
      faces.push({ indices: [7, 6, 9], color: wallColor, isRoof: true }); // Back triangle gable
      faces.push({ indices: [4, 8, 9, 7], color: roofColor, isRoof: true }); // Left slope
      faces.push({ indices: [5, 8, 9, 6], color: roofColor, isRoof: true }); // Right slope
    } else if (roofType === "dome") {
      // Dome faces approximate
      faces.push({ indices: [4, 5, 8], color: roofColor, isRoof: true });
      faces.push({ indices: [5, 6, 8], color: roofColor, isRoof: true });
      faces.push({ indices: [6, 7, 8], color: roofColor, isRoof: true });
      faces.push({ indices: [7, 4, 8], color: roofColor, isRoof: true });
    } else {
      // flat roof
      faces.push({ indices: [4, 5, 6, 7], color: roofColor, isRoof: true });
    }

    // 4. Face depth sorting algorithm to render correctly
    const faceDepths = faces.map((face) => {
      const avgDepth = face.indices.reduce((sum, idx) => sum + projectPoint(vertices[idx]).depth, 0) / face.indices.length;
      return { face, depth: avgDepth };
    });

    faceDepths.sort((a, b) => b.depth - a.depth); // Draw back to front

    // Render loop
    faceDepths.forEach(({ face }) => {
      const projected = face.indices.map((idx) => projectPoint(vertices[idx]));

      ctx.beginPath();
      ctx.moveTo(projected[0].x, projected[0].y);
      for (let i = 1; i < projected.length; i++) {
        ctx.lineTo(projected[i].x, projected[i].y);
      }
      ctx.closePath();

      // Rendering Style mode selection
      if (renderMode === 'solid') {
        ctx.fillStyle = face.color;
        ctx.fill();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (renderMode === 'xray') {
        ctx.fillStyle = face.isRoof ? "rgba(239, 68, 68, 0.25)" : "rgba(99, 102, 241, 0.15)";
        ctx.fill();
        ctx.strokeStyle = "rgba(49, 46, 129, 0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        // Wireframe
        ctx.strokeStyle = face.isRoof ? "#ef4444" : "#4f46e5";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    // 5. Draw Annotations & Labels (Length, Width, Height)
    if (showLabels) {
      ctx.font = "bold 11px Inter, sans-serif";
      ctx.fillStyle = "#1e1b4b";
      ctx.strokeStyle = "white";
      ctx.lineWidth = 3;

      const drawDimensionLine = (pStart: Point3D, pEnd: Point3D, text: string, offset: {x: number, y: number}) => {
        const startProj = projectPoint(pStart);
        const endProj = projectPoint(pEnd);
        
        ctx.beginPath();
        ctx.moveTo(startProj.x, startProj.y);
        ctx.lineTo(endProj.x, endProj.y);
        ctx.strokeStyle = "rgba(31, 41, 55, 0.6)";
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label
        const mx = (startProj.x + endProj.x) / 2 + offset.x;
        const my = (startProj.y + endProj.y) / 2 + offset.y;
        ctx.textAlign = "center";
        ctx.strokeText(text, mx, my);
        ctx.fillText(text, mx, my);
      };

      // Length Label (along L)
      drawDimensionLine(
        { x: w/2 + 0.5, y: -l/2, z: 0 },
        { x: w/2 + 0.5, y: l/2, z: 0 },
        `${tr("الطول", "Length")}: ${l}m`,
        { x: 10, y: 15 }
      );

      // Width Label (along W)
      drawDimensionLine(
        { x: -w/2, y: l/2 + 0.5, z: 0 },
        { x: w/2, y: l/2 + 0.5, z: 0 },
        `${tr("العرض", "Width")}: ${w}m`,
        { x: -15, y: 15 }
      );

      // Height Label (along H)
      drawDimensionLine(
        { x: -w/2 - 0.5, y: -l/2, z: 0 },
        { x: -w/2 - 0.5, y: -l/2, z: h },
        `${tr("الارتفاع", "Height")}: ${h}m`,
        { x: -35, y: 0 }
      );
    }
  }, [yaw, pitch, zoom, renderMode, showLabels, w, l, h, roofType, shelterType, lang]);

  // Orbit navigation event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    setIsRotating(false); // Stop auto rotate on manual drag
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;

    setYaw((prev) => (prev + dx * 0.7) % 360);
    setPitch((prev) => Math.max(-80, Math.min(80, prev - dy * 0.7)));

    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  return (
    <div className={`bg-white p-4 rounded-xl shadow-sm border border-slate-100 ${isRtl ? "text-right" : "text-left"}`} ref={containerRef} dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-600" />
            {tr("منظور هندسي ثلاثي الأبعاد تفاعلي", "Interactive 3D Perspective")}
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            {tr("اسحب بالماوس لتدوير المنظور، أو استخدم أزرار التحكم.", "Click and drag to rotate the view. Use the control panel to inspect.")}
          </p>
        </div>
        <div className={`flex flex-wrap gap-1.5 self-stretch sm:self-auto ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
          <button
            id="toggle-rotate-btn"
            onClick={() => setIsRotating(!isRotating)}
            className={`p-1.5 rounded text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
              isRotating ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            title={tr("دوران تلقائي", "Auto Rotate")}
          >
            {isRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isRotating ? tr("إيقاف الدوران", "Stop Rotation") : tr("دوران تلقائي", "Auto Rotate")}
          </button>
          
          <button
            id="render-solid-btn"
            onClick={() => setRenderMode('solid')}
            className={`p-1.5 rounded text-xs font-medium transition-all cursor-pointer ${
              renderMode === 'solid' ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tr("مجسم ممتلئ", "Solid")}
          </button>
          <button
            id="render-xray-btn"
            onClick={() => setRenderMode('xray')}
            className={`p-1.5 rounded text-xs font-medium transition-all cursor-pointer ${
              renderMode === 'xray' ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tr("شبه شفاف", "X-Ray")}
          </button>
          <button
            id="render-wireframe-btn"
            onClick={() => setRenderMode('wireframe')}
            className={`p-1.5 rounded text-xs font-medium transition-all cursor-pointer ${
              renderMode === 'wireframe' ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tr("هيكل سلكي", "Wireframe")}
          </button>
        </div>
      </div>

      <div 
        className="relative border border-slate-100 rounded-lg bg-slate-50 overflow-hidden cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
      >
        <canvas ref={canvasRef} className="block w-full" />

        {/* Floating Rotation Reset & Zoom Controls */}
        <div className={`absolute bottom-3 flex gap-1 bg-white/95 p-1.5 rounded-lg shadow-sm border border-slate-100 backdrop-blur-sm ${isRtl ? "left-3" : "right-3"}`}>
          <button
            id="zoom-in-btn"
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
            className="p-1 rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
            title={tr("تكبير", "Zoom In")}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            id="zoom-out-btn"
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
            className="p-1 rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
            title={tr("تصغير", "Zoom Out")}
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            id="reset-cam-btn"
            onClick={() => {
              setYaw(-45);
              setPitch(-25);
              setZoom(1.2);
              setIsRotating(false);
            }}
            className="p-1 rounded hover:bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer"
            title={tr("إعادة ضبط الكاميرا", "Reset Camera")}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Display Controls */}
        <div className={`absolute top-3 ${isRtl ? "right-3" : "left-3"} flex gap-2`}>
          <label className="flex items-center gap-1.5 bg-white/95 px-2.5 py-1.5 rounded-lg shadow-sm border border-slate-100 text-xs font-medium text-slate-700 cursor-pointer backdrop-blur-sm">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
            />
            {tr("أبعاد البناء", "Building Dimensions")}
          </label>
        </div>

        {/* Materials Legend */}
        <div className={`absolute bottom-3 bg-white/95 p-2 rounded-lg shadow-sm border border-slate-100 text-[10px] text-slate-600 backdrop-blur-sm max-w-[150px] ${isRtl ? "right-3" : "left-3"}`}>
          <span className={`font-semibold block mb-1 text-slate-700 ${isRtl ? "text-right" : "text-left"}`}>
            {tr("دليل المواد المقترح", "Suggested Material Legend")}
          </span>
          <div className={`flex items-center gap-1.5 ${isRtl ? "justify-end" : "justify-start"}`}>
            <span>{tr("جدران معزولة", "Insulated Walls")}</span>
            <span className={`w-2.5 h-2.5 rounded-sm`} style={{ backgroundColor: isEarthbag ? "rgba(217, 119, 6, 0.8)" : isTimber ? "rgba(180, 83, 9, 0.8)" : "rgba(224, 231, 255, 0.85)" }}></span>
          </div>
          <div className={`flex items-center gap-1.5 mt-1 ${isRtl ? "justify-end" : "justify-start"}`}>
            <span>{tr("سقف مائل مقاوم", "Weatherproof Roof")}</span>
            <span className={`w-2.5 h-2.5 rounded-sm`} style={{ backgroundColor: isEarthbag ? "rgba(180, 83, 9, 0.9)" : isTimber ? "rgba(120, 53, 4, 0.9)" : "rgba(239, 68, 68, 0.9)" }}></span>
          </div>
        </div>
      </div>
    </div>
  );
}
