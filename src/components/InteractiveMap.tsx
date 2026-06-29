import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { 
  MapPin, 
  Compass, 
  Navigation, 
  Info, 
  Layers, 
  RefreshCw, 
  Search, 
  Tent, 
  Droplet, 
  Activity, 
  UserCheck, 
  TreePine, 
  Map as MapIcon, 
  Layers3,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { ShelterProject, CampFacility } from "../types";

interface InteractiveMapProps {
  project: ShelterProject | null;
  lang?: "ar" | "en";
}

interface GeocodedLocation {
  name: string;
  lat: number;
  lng: number;
  source: "nominatim" | "preset" | "fallback";
}

// Preset locations for popular crisis response and humanitarian focus regions
const PRESET_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Arabic names
  "جبل الزاوية، إدلب - سوريا": { lat: 35.7922, lng: 36.5658 },
  "منطقة حلب الشرقية، سوريا": { lat: 36.2021, lng: 37.1343 },
  "غزة، فلسطين": { lat: 31.5016, lng: 34.4668 },
  "رفح، غزة": { lat: 31.2847, lng: 34.2533 },
  "الخرطوم، السودان": { lat: 15.5007, lng: 32.5599 },
  "صنعاء، اليمن": { lat: 15.3694, lng: 44.1910 },
  "هاتاي، تركيا": { lat: 36.4018, lng: 36.3498 },
  "كاتماندو، نيبال": { lat: 27.7172, lng: 85.3240 },
  "بورت أو برانس، هايتي": { lat: 18.5944, lng: -72.3074 },
  "دير البلح، غزة": { lat: 31.4178, lng: 34.3503 },
  "إدلب، سوريا": { lat: 35.9304, lng: 36.6339 },
  
  // English names
  "Jabal Al-Zawiya, Idlib - Syria": { lat: 35.7922, lng: 36.5658 },
  "East Aleppo, Syria": { lat: 36.2021, lng: 37.1343 },
  "Gaza, Palestine": { lat: 31.5016, lng: 34.4668 },
  "Rafah, Gaza": { lat: 31.2847, lng: 34.2533 },
  "Khartoum, Sudan": { lat: 15.5007, lng: 32.5599 },
  "Sanaa, Yemen": { lat: 15.3694, lng: 44.1910 },
  "Hatay, Turkey": { lat: 36.4018, lng: 36.3498 },
  "Kathmandu, Nepal": { lat: 27.7172, lng: 85.3240 },
  "Port-au-Prince, Haiti": { lat: 18.5944, lng: -72.3074 },
  "Deir al-Balah, Gaza": { lat: 31.4178, lng: 34.3503 },
  "Idlib, Syria": { lat: 35.9304, lng: 36.6339 }
};

// Map style layers
const TILE_LAYERS = {
  streets: {
    name: "OpenStreetMap (شوارع)",
    nameEn: "OpenStreetMap (Streets)",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  minimal: {
    name: "CartoDB (بسيط)",
    nameEn: "CartoDB (Positron)",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/attributions">CartoDB</a>'
  },
  satellite: {
    name: "Esri (قمر صناعي)",
    nameEn: "Esri (Satellite)",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  }
};

export default function InteractiveMap({ project, lang = "ar" }: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.FeatureGroup | null>(null);
  
  const isRtl = lang === "ar";
  const tr = (arText: string, enText: string) => (lang === "ar" ? arText : enText);

  // Map settings state
  const [activeLayer, setActiveLayer] = useState<keyof typeof TILE_LAYERS>("streets");
  const [geoLoc, setGeoLoc] = useState<GeocodedLocation>({
    name: project?.input.locationName || tr("موقع افتراضي", "Default Location"),
    lat: 34.0,
    lng: 36.0,
    source: "fallback"
  });
  
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [customSearchQuery, setCustomSearchQuery] = useState<string>("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);

  // Geocode location helper
  const geocodeLocation = async (locationName: string) => {
    setIsGeocoding(true);
    setSearchError(null);

    // 1. Check presets first
    const cleanName = locationName.trim();
    for (const [key, coords] of Object.entries(PRESET_COORDINATES)) {
      if (cleanName.includes(key) || key.includes(cleanName)) {
        setGeoLoc({
          name: key,
          lat: coords.lat,
          lng: coords.lng,
          source: "preset"
        });
        setIsGeocoding(false);
        return coords;
      }
    }

    // 2. Try Nominatim Geocoding API (Real integration!)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`,
        {
          headers: {
            "Accept-Language": lang === "ar" ? "ar" : "en",
            "User-Agent": "rapid-shelter-designer-leaflet-agent"
          }
        }
      );
      if (!response.ok) {
        throw new Error("Nominatim request failed");
      }
      const data = await response.json();
      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        const fetchedLoc: GeocodedLocation = {
          name: result.display_name,
          lat,
          lng,
          source: "nominatim"
        };
        setGeoLoc(fetchedLoc);
        setIsGeocoding(false);
        return { lat, lng };
      }
    } catch (e) {
      console.warn("Geocoding service error:", e);
    }

    // 3. Fallback to a randomized, reasonable coordinate to make it visually alive and responsive
    // Based on text matching
    let baseLat = 34.8021;
    let baseLng = 38.9968; // Syria desert default
    
    if (locationName.includes("غزة") || locationName.toLowerCase().includes("gaza") || locationName.includes("فلسطين")) {
      baseLat = 31.4;
      baseLng = 34.4;
    } else if (locationName.includes("السودان") || locationName.toLowerCase().includes("sudan")) {
      baseLat = 15.5;
      baseLng = 32.5;
    } else if (locationName.includes("اليمن") || locationName.toLowerCase().includes("yemen")) {
      baseLat = 15.3;
      baseLng = 44.2;
    } else if (locationName.includes("تركيا") || locationName.toLowerCase().includes("turkey") || locationName.toLowerCase().includes("hatay")) {
      baseLat = 36.4;
      baseLng = 36.3;
    }

    // Introduce a tiny random jitter so multiple fallback clicks look dynamic
    const jitterLat = (Math.random() - 0.5) * 0.15;
    const jitterLng = (Math.random() - 0.5) * 0.15;
    
    const finalLat = baseLat + jitterLat;
    const finalLng = baseLng + jitterLng;

    setGeoLoc({
      name: locationName,
      lat: finalLat,
      lng: finalLng,
      source: "fallback"
    });
    setIsGeocoding(false);
    return { lat: finalLat, lng: finalLng };
  };

  // Run geocoding when the project changes
  useEffect(() => {
    if (project?.input.locationName) {
      setCustomSearchQuery(project.input.locationName);
      geocodeLocation(project.input.locationName);
    }
  }, [project]);

  // Handle Map Initialization & Layer Changes
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Remove old map instance if it exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize map
    const map = L.map(mapContainerRef.current, {
      center: [geoLoc.lat, geoLoc.lng],
      zoom: 17,
      zoomControl: false, // will add custom positioned controls
      attributionControl: false
    });
    
    mapInstanceRef.current = map;

    // Add Attribution Control at bottom right
    L.control.attribution({ position: "bottomright" }).addTo(map);

    // Create a feature group to hold all markers and handle auto-fitting
    const markersGroup = L.featureGroup();
    markersGroupRef.current = markersGroup;
    markersGroup.addTo(map);

    // Clean up on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeLayer]); // Recreate if active tile layer structure changes

  // Update Tile Layer and Center map on geoLoc change or layer switch
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove previous tile layers if any
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    // Add selected Tile Layer
    const layerCfg = TILE_LAYERS[activeLayer];
    L.tileLayer(layerCfg.url, {
      attribution: layerCfg.attribution,
      maxZoom: 20
    }).addTo(map);

    // Recenter
    map.setView([geoLoc.lat, geoLoc.lng], 17);
    map.invalidateSize();
  }, [geoLoc, activeLayer]);

  // Render Camp Facilities on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup || !project) return;

    // Clear previous markers
    markersGroup.clearLayers();

    const facilities = project.blueprints.campLayout.facilities || [];
    
    // GPS calculation formulas:
    // Earth's radius is roughly 6,378,137m
    // One meter represents approximately:
    // Latitude: 1 / 111,111 degrees
    // Longitude: 1 / (111,111 * cos(latitude)) degrees
    const latPerMeter = 1 / 111111;
    const radLat = (geoLoc.lat * Math.PI) / 180;
    const lngPerMeter = 1 / (111111 * Math.cos(radLat));

    // Calculate layout limits for centering the group
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    facilities.forEach((f) => {
      if (f.x < minX) minX = f.x;
      if (f.x > maxX) maxX = f.x;
      if (f.y < minY) minY = f.y;
      if (f.y > maxY) maxY = f.y;
    });

    const midX = minX !== Infinity ? (minX + maxX) / 2 : 0;
    const midY = minY !== Infinity ? (minY + maxY) / 2 : 0;

    // Create shelter and facility markers
    facilities.forEach((f, index) => {
      // Offset each facility around the geocoded location, centered on the grid midpoint
      const offsetX = f.x - midX;
      const offsetY = f.y - midY;

      // Note: in layout coordinates, Y is usually down, X is right
      // We map: latitude offset = -offsetY * latPerMeter, longitude offset = offsetX * lngPerMeter
      const facLat = geoLoc.lat - offsetY * latPerMeter;
      const facLng = geoLoc.lng + offsetX * lngPerMeter;

      // Style based on type
      let colorClass = "bg-indigo-600";
      let textSymbol = "S"; // Shelter
      let iconColor = "#4f46e5";
      let typeLabel = tr("وحدة سكنية", "Shelter Unit");

      if (f.type === "water") {
        colorClass = "bg-blue-500 animate-pulse";
        textSymbol = "W";
        iconColor = "#0ea5e9";
        typeLabel = tr("محطة مياه", "Water Station");
      } else if (f.type === "medical") {
        colorClass = "bg-emerald-500 border border-emerald-100";
        textSymbol = "H";
        iconColor = "#10b981";
        typeLabel = tr("مركز طبي", "Medical Hub");
      } else if (f.type === "latrines") {
        colorClass = "bg-amber-600";
        textSymbol = "T";
        iconColor = "#d97706";
        typeLabel = tr("دورة مياه مشترك", "Communal Toilet");
      } else if (f.type === "admin") {
        colorClass = "bg-slate-700";
        textSymbol = "A";
        iconColor = "#334155";
        typeLabel = tr("إدارة المخيم", "Administration");
      } else if (f.type === "space") {
        colorClass = "bg-purple-500";
        textSymbol = "P";
        iconColor = "#a855f7";
        typeLabel = tr("مساحة آمنة / لعب", "Safe Space");
      }

      // Generate HTML customized DivIcon
      const divIcon = L.divIcon({
        className: "",
        html: `
          <div id="facility-${index}" class="relative group cursor-pointer flex items-center justify-center">
            <div class="w-8 h-8 rounded-full ${colorClass} text-white flex items-center justify-center font-bold shadow-md border-2 border-white text-xs transition-transform transform hover:scale-110 active:scale-95 duration-200">
              ${textSymbol}
            </div>
            <!-- Pulse ripple for important community units -->
            ${f.type === "medical" || f.type === "water" ? `<div class="absolute -inset-1 rounded-full bg-${f.type === "medical" ? "emerald" : "blue"}-400 opacity-20 animate-ping -z-10"></div>` : ""}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      // Construct Marker
      const marker = L.marker([facLat, facLng], { icon: divIcon });

      // Add elegant map Popup
      const popupContent = `
        <div class="p-3 text-slate-800 ${isRtl ? "text-right" : "text-left"}" dir="${isRtl ? "rtl" : "ltr"}">
          <span class="inline-block text-[9px] px-2 py-0.5 rounded-full font-bold text-white mb-1.5" style="background-color: ${iconColor};">
            ${typeLabel}
          </span>
          <h5 class="font-extrabold text-sm text-slate-900 mb-1">${f.name}</h5>
          <div class="text-[10px] text-slate-500 space-y-1">
            <p>📐 ${tr("الأبعاد", "Footprint")}: ${f.w}m x ${f.h}m (${f.w * f.h} م²)</p>
            <p>📍 ${tr("إحداثيات المخطط", "Layout Coord")}: X: ${f.x}m, Y: ${f.y}m</p>
            <p>🌐 ${tr("الموقع الجغرافي", "GPS Location")}: ${facLat.toFixed(6)}, ${facLng.toFixed(6)}</p>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: false,
        className: "custom-leaflet-popup"
      });

      // Store index in options for custom panning trigger
      (marker as any).facilityIndex = index;
      (marker as any).facilityName = f.name;

      markersGroup.addLayer(marker);
    });

    // Auto-adjust bounds to fit all distributed shelters!
    if (facilities.length > 0) {
      const bounds = markersGroup.getBounds();
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [geoLoc, project]);

  // Locate and center specific facility from list
  const handleLocateFacility = (facility: CampFacility, index: number) => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup || !project) return;

    setSelectedFacility(facility.name);

    // Calculate facility coordinate
    const facilities = project.blueprints.campLayout.facilities || [];
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    facilities.forEach((f) => {
      if (f.x < minX) minX = f.x;
      if (f.x > maxX) maxX = f.x;
      if (f.y < minY) minY = f.y;
      if (f.y > maxY) maxY = f.y;
    });

    const midX = minX !== Infinity ? (minX + maxX) / 2 : 0;
    const midY = minY !== Infinity ? (minY + maxY) / 2 : 0;

    const latPerMeter = 1 / 111111;
    const radLat = (geoLoc.lat * Math.PI) / 180;
    const lngPerMeter = 1 / (111111 * Math.cos(radLat));

    const offsetX = facility.x - midX;
    const offsetY = facility.y - midY;

    const facLat = geoLoc.lat - offsetY * latPerMeter;
    const facLng = geoLoc.lng + offsetX * lngPerMeter;

    // Pan map smoothly to the selected facility
    map.setView([facLat, facLng], 19, { animate: true, duration: 0.8 });

    // Find and open popup of the associated marker
    markersGroup.eachLayer((layer) => {
      if (layer instanceof L.Marker && (layer as any).facilityIndex === index) {
        layer.openPopup();
      }
    });
  };

  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSearchQuery.trim()) {
      geocodeLocation(customSearchQuery);
    }
  };

  const handleResetMapCenter = () => {
    if (project?.input.locationName) {
      geocodeLocation(project.input.locationName);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-5" dir={isRtl ? "rtl" : "ltr"}>
      
      {/* Control Side-Panel (1/4 Width on Large Screens) */}
      <div className="lg:col-span-1 flex flex-col gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        
        {/* Geocoding Lookup Box */}
        <div>
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
            <Compass className="w-4 h-4 text-indigo-600" />
            {tr("البحث الجغرافي والتحقق", "Geographic Check")}
          </h4>
          
          <form onSubmit={handleCustomSearch} className="relative flex gap-1.5">
            <input
              type="text"
              value={customSearchQuery}
              onChange={(e) => setCustomSearchQuery(e.target.value)}
              placeholder={tr("ابحث عن إقليم، مدينة، أو إحداثي...", "Search country, city, or coordinates...")}
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-700"
            />
            <button
              type="submit"
              disabled={isGeocoding}
              className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center cursor-pointer disabled:opacity-50"
              title={tr("بحث وتحديد الموقع", "Search Location")}
            >
              {isGeocoding ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            </button>
          </form>

          {/* Current Geocode Info */}
          <div className="mt-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] space-y-1 text-slate-600">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-semibold text-slate-500">{tr("طريقة التحديد:", "Method:")}</span>
              <span className={`px-1.5 py-0.5 rounded-sm font-bold ${
                geoLoc.source === "nominatim" ? "bg-emerald-50 text-emerald-700" :
                geoLoc.source === "preset" ? "bg-indigo-50 text-indigo-700" : "bg-amber-50 text-amber-700"
              }`}>
                {geoLoc.source === "nominatim" ? tr("خريطة حية OSM", "Live OSM Map") :
                 geoLoc.source === "preset" ? tr("قاعدة بيانات حيوية", "Regional DB") : tr("موقع تقريبي محاكى", "Simulated Approx")}
              </span>
            </div>
            <p className="font-semibold text-slate-800 line-clamp-2 mt-1">
              📍 {geoLoc.name}
            </p>
            <p className="font-mono text-slate-500 text-[10px]">
              {geoLoc.lat.toFixed(5)}°, {geoLoc.lng.toFixed(5)}°
            </p>
          </div>
        </div>

        {/* Map style selection */}
        <div>
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
            <Layers3 className="w-4 h-4 text-indigo-600" />
            {tr("نمط الخريطة (الطبقات)", "Map Layer Theme")}
          </h4>
          <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100">
            {(Object.keys(TILE_LAYERS) as Array<keyof typeof TILE_LAYERS>).map((layerKey) => (
              <button
                key={layerKey}
                onClick={() => setActiveLayer(layerKey)}
                className={`text-[10px] py-1 px-1.5 rounded-md font-bold transition-all cursor-pointer ${
                  activeLayer === layerKey
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                {tr(TILE_LAYERS[layerKey].name.split(" ")[1], layerKey.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {/* Facilities Interactive Directory */}
        <div className="flex-1 flex flex-col min-h-[220px]">
          <h4 className="text-xs font-bold text-slate-800 flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5">
              <Tent className="w-4 h-4 text-emerald-600" />
              {tr("دليل توزيع الملاجئ والخدمات", "Shelter & Facility Directory")}
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-bold">
              {project?.blueprints.campLayout.facilities.length || 0}
            </span>
          </h4>

          <div className="flex-1 overflow-y-auto max-h-[280px] space-y-1.5 pr-0.5 scrollbar-thin">
            {project?.blueprints.campLayout.facilities.map((fac, i) => {
              const isSelected = selectedFacility === fac.name;
              
              let badgeColor = "bg-indigo-100 text-indigo-800";
              if (fac.type === "water") badgeColor = "bg-blue-100 text-blue-800";
              else if (fac.type === "medical") badgeColor = "bg-emerald-100 text-emerald-800";
              else if (fac.type === "latrines") badgeColor = "bg-amber-100 text-amber-800";
              else if (fac.type === "admin") badgeColor = "bg-slate-100 text-slate-800";
              else if (fac.type === "space") badgeColor = "bg-purple-100 text-purple-800";

              return (
                <button
                  key={i}
                  onClick={() => handleLocateFacility(fac, i)}
                  className={`w-full text-right flex items-center justify-between p-2 rounded-xl border text-[11px] transition-all cursor-pointer hover:border-indigo-300 ${
                    isSelected 
                      ? "bg-indigo-50/70 border-indigo-500 shadow-2xs font-bold" 
                      : "bg-slate-50/50 border-slate-100 hover:bg-white"
                  }`}
                >
                  <div className="flex flex-col gap-0.5 text-right overflow-hidden">
                    <span className="font-extrabold text-slate-800 truncate block">
                      {fac.name}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      📐 {fac.w}m x {fac.h}m ({fac.w * fac.h}م²)
                    </span>
                  </div>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-extrabold ${badgeColor} shrink-0`}>
                    {fac.type.toUpperCase()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reset & Quick Recenter Button */}
        <button
          onClick={handleResetMapCenter}
          className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {tr("إعادة موازنة المخيم وتوسيط الخريطة", "Recenter Camp & Recalculate")}
        </button>

      </div>

      {/* Main Map Stage (3/4 Width on Large Screens) */}
      <div className="lg:col-span-3 flex flex-col gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
        
        {/* Interactive Floating Leaflet Canvas Container */}
        <div className="relative flex-1 min-h-[460px] rounded-xl overflow-hidden border border-slate-100 bg-slate-50 shadow-inner">
          
          {/* Leaflet map container mount point */}
          <div ref={mapContainerRef} className="absolute inset-0 z-0" />

          {/* Floating UI Overlay: Map Compass HUD */}
          <div className={`absolute top-3 ${isRtl ? "right-3" : "left-3"} z-10 flex flex-col gap-2`}>
            <div className="bg-white/95 p-2.5 rounded-xl border border-slate-200/80 shadow-md backdrop-blur-md flex items-center gap-2 max-w-[280px]">
              <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <MapPin className="w-3.5 h-3.5 animate-bounce" />
              </div>
              <div className="text-right">
                <h5 className="font-extrabold text-[11px] text-slate-800 leading-tight">
                  {tr("خريطة المجمع الجغرافي الفعالة", "Active Geographic Camp Map")}
                </h5>
                <p className="text-[9px] text-slate-500 mt-0.5 line-clamp-1">
                  {geoLoc.name}
                </p>
              </div>
            </div>
          </div>

          {/* Floating UI Overlay: Legend */}
          <div className={`absolute bottom-3 ${isRtl ? "left-3" : "right-3"} z-10 bg-white/95 p-3 rounded-xl border border-slate-200/80 shadow-md backdrop-blur-md text-[10px] text-slate-600 max-w-[200px]`}>
            <span className="font-extrabold block mb-1.5 text-slate-800 text-[11px]">
              {tr("دليل الرموز التفاعلية", "Interactive Legend")}
            </span>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 border border-white shadow-xs"></span>
                <span>{tr("مأوى (S)", "Shelter (S)")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-white shadow-xs"></span>
                <span>{tr("مياه (W)", "Water (W)")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white shadow-xs"></span>
                <span>{tr("طبي (H)", "Medical (H)")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600 border border-white shadow-xs"></span>
                <span>{tr("حمام (T)", "Toilet (T)")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700 border border-white shadow-xs"></span>
                <span>{tr("إدارة (A)", "Admin (A)")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 border border-white shadow-xs"></span>
                <span>{tr("لعب (P)", "Space (P)")}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Map Explanatory Caption */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/60 gap-2">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-600 leading-relaxed text-justify">
              {tr(
                "تقوم هذه الخريطة الحية بتحويل التوزيع الشبكي للمخيم (الذي تم حسابه هندسياً لمقاومة الكوارث وعزل الحرائق وتوفير المساحات) إلى إحداثيات GPS فعلية مسقطة على جغرافية منطقة الإيواء لتسهيل العمل الميداني.",
                "This dynamic mapping translates the camp's architectural layout grid (optimized for fire safety, spacing, and utility distribution) into physical GPS coordinates overlaid directly onto the disaster response area for immediate ground coordination."
              )}
            </p>
          </div>
          <a
            href={`https://www.openstreetmap.org/#map=18/${geoLoc.lat}/${geoLoc.lng}`}
            target="_blank"
            rel="noreferrer"
            className="text-[10px] font-extrabold text-indigo-700 hover:text-indigo-800 flex items-center gap-1 shrink-0 whitespace-nowrap cursor-pointer hover:underline"
          >
            {tr("افتح في OpenStreetMap حراً", "Open in OSM Web")}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

      </div>

    </div>
  );
}
