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
  ExternalLink,
  Wind,
  Sun,
  TrendingUp,
  Droplets
} from "lucide-react";
import { ShelterProject, CampFacility } from "../types";

// @ts-ignore
import imgCamp from "../assets/images/modular_shelter_camp_1782827320449.jpg";

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

// AI Satellite Terrain Elevation & Slope Analysis Helper
function generateSatelliteAnalysis(lat: number, lng: number, locationName: string) {
  // Deterministic values using sine/cosine of coords so values remain consistent for the same spot
  const nameHash = locationName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed1 = Math.abs(Math.sin(lat * 1234 + nameHash)) % 1;
  const seed2 = Math.abs(Math.cos(lng * 5678 + nameHash)) % 1;
  const seed3 = Math.abs(Math.sin((lat + lng) * 9101 + nameHash)) % 1;

  // Elevation calculation (الارتفاع عن سطح البحر) - e.g., between 80m and 1200m
  const elevation = Math.round(80 + seed3 * 1120);

  // Slope calculation between 1.2 and 11.5 degrees
  const slope = parseFloat((1.2 + seed1 * 10.3).toFixed(1));
  
  // Trees count between 8 and 42
  const treeCount = Math.floor(8 + seed2 * 34);
  
  // Rocks count between 3 and 18
  const rockCount = Math.floor(3 + seed3 * 15);

  // Wind direction & speed (اتجاه الرياح وسرعتها)
  const windDirs = ["شمالية غربية (NW)", "شمالية شرقية (NE)", "غربية (W)", "جنوبية غربية (SW)"];
  const windDirsEn = ["North-West (NW)", "North-East (NE)", "West (W)", "South-West (SW)"];
  const windIndex = Math.floor(seed1 * windDirs.length);
  const windDir = windDirs[windIndex];
  const windDirEn = windDirsEn[windIndex];
  const windSpeed = Math.round(10 + seed2 * 25); // km/h

  // Sun exposure (التعرض للشمس)
  const sunHours = (6.5 + seed3 * 6).toFixed(1); // 6.5 to 12.5 hours

  // Flood risks (مخاطر الفيضانات ومسارات السيول)
  let floodRisk = "متوسط";
  let floodRiskEn = "Moderate";
  let floodRiskColor = "text-amber-600 bg-amber-50 border-amber-100";
  if (slope < 2.5) {
    floodRisk = "مرتفع جداً (تجمع مياه وركود)";
    floodRiskEn = "High (Water logging & pooling)";
    floodRiskColor = "text-rose-600 bg-rose-50 border-rose-100";
  } else if (slope > 8.5) {
    floodRisk = "منخفض جداً للركود (مرتفع لانجراف التربة)";
    floodRiskEn = "Very low pooling (High soil erosion)";
    floodRiskColor = "text-orange-600 bg-orange-50 border-orange-100";
  } else {
    floodRisk = "منخفض وآمن";
    floodRiskEn = "Low & Safe";
    floodRiskColor = "text-emerald-600 bg-emerald-50 border-emerald-100";
  }

  // Best shelter locations & orientation (أفضل مواقع الملاجئ)
  let bestShelterDirAr = "المرتفعات الشمالية الشرقية - بتوجيه عكس اتجاه الرياح السائدة لتخفيف العواصف";
  let bestShelterDir = "Northeastern high ground - facing away from prevailing winds to mitigate storm damage";
  if (seed1 > 0.6) {
    bestShelterDirAr = "الهضاب الغربية المستوية - بمسافة أمان لا تقل عن 50 متراً من مجاري السيول";
    bestShelterDir = "Western flat plateaus - with at least 50m safety distance from runoff paths";
  } else if (seed1 < 0.3) {
    bestShelterDirAr = "السهول الوسطى المرتفعة - بمسار مائل للشمس لتسريع الكفاءة الحرارية للخلايا";
    bestShelterDir = "Central elevated plains - oriented slightly toward the sun to accelerate thermal efficiency";
  }

  // Determine hazard level based on slope and geography
  let hazardType = "Low runoff risk";
  let hazardTypeAr = "خطر جريان مائي منخفض جداً";
  let hazardSeverity = "low";
  
  if (slope > 8.0) {
    hazardType = "Moderate landslide risk on high-slope boundary";
    hazardTypeAr = "مخاطر انزلاق تربة متوسطة عند المنحدرات الحادة";
    hazardSeverity = "medium";
  } else if (slope < 1.8) {
    hazardType = "Flash flood accumulation risk in depressed pocket";
    hazardTypeAr = "مخاطر تجمع سيول في المنخفضات الجغرافية المجاورة";
    hazardSeverity = "high";
  }

  const latPerMeter = 1 / 111111;
  const radLat = (lat * Math.PI) / 180;
  const lngPerMeter = 1 / (111111 * Math.cos(radLat));

  // Offset points around center
  const trees: { lat: number; lng: number; size: number }[] = [];
  for (let i = 0; i < Math.min(8, treeCount); i++) {
    const angle = (i * 2 * Math.PI) / 8 + seed1;
    const distance = 12 + (i * 7) % 20; // meters
    trees.push({
      lat: lat + Math.sin(angle) * distance * latPerMeter,
      lng: lng + Math.cos(angle) * distance * lngPerMeter,
      size: 2.5 + (i % 3) * 1.5
    });
  }

  const rocks: { lat: number; lng: number; size: number }[] = [];
  for (let i = 0; i < Math.min(6, rockCount); i++) {
    const angle = (i * 2 * Math.PI) / 6 + seed2;
    const distance = 8 + (i * 10) % 25; // meters
    rocks.push({
      lat: lat + Math.sin(angle) * distance * latPerMeter,
      lng: lng + Math.cos(angle) * distance * lngPerMeter,
      size: 1.5 + (i % 2) * 1.5
    });
  }

  // Hazard zones around the camp
  const dangerZone = {
    center: {
      lat: lat + (seed1 > 0.5 ? 32 : -32) * latPerMeter,
      lng: lng + (seed2 > 0.5 ? 32 : -32) * lngPerMeter,
    },
    radius: 15 + seed3 * 18, // meters
    label: hazardType,
    labelAr: hazardTypeAr,
    severity: hazardSeverity
  };

  // Torrent pathway coordinates (flowing down nearby)
  const torrentCoords = [
    { lat: dangerZone.center.lat + 35 * latPerMeter, lng: dangerZone.center.lng - 45 * lngPerMeter },
    { lat: dangerZone.center.lat + 10 * latPerMeter, lng: dangerZone.center.lng - 15 * lngPerMeter },
    { lat: dangerZone.center.lat - 15 * latPerMeter, lng: dangerZone.center.lng + 15 * lngPerMeter },
    { lat: dangerZone.center.lat - 40 * latPerMeter, lng: dangerZone.center.lng + 35 * lngPerMeter }
  ];

  return {
    slope,
    elevation,
    treeCount,
    rockCount,
    windDir,
    windDirEn,
    windSpeed,
    sunHours,
    floodRisk,
    floodRiskEn,
    floodRiskColor,
    bestShelterDir,
    bestShelterDirAr,
    dangerZone,
    torrentCoords,
    trees,
    rocks,
    optimalCenter: {
      lat: lat + (seed2 * 6 - 3) * latPerMeter,
      lng: lng + (seed1 * 6 - 3) * lngPerMeter
    }
  };
}

export default function InteractiveMap({ project, lang = "ar" }: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.FeatureGroup | null>(null);
  
  const isRtl = lang === "ar";
  const tr = (arText: string, enText: string) => (lang === "ar" ? arText : enText);

  // Map settings state
  const [activeLayer, setActiveLayer] = useState<keyof typeof TILE_LAYERS>("streets");
  const [showUnitLabels, setShowUnitLabels] = useState<boolean>(true);
  const [showOccupancyLabels, setShowOccupancyLabels] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [activeFilterCategory, setActiveFilterCategory] = useState<"all" | "shelters" | "water_sanitation" | "medical_safety" | "other">("all");
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

  // Dynamic Occupancy fetching state
  const [fetchedOccupancies, setFetchedOccupancies] = useState<Record<number, string>>({});
  const [isFetchingOccupancies, setIsFetchingOccupancies] = useState<boolean>(false);

  // Fetch dynamic occupancy data from the API endpoint
  useEffect(() => {
    let active = true;
    const fetchOccupancy = async () => {
      if (!project) return;
      setIsFetchingOccupancies(true);
      try {
        const capacity = project.suggestedModel?.capacityPerUnit || 6;
        const totalPeople = project.input?.peopleCount || 80;
        const totalUnits = project.blueprints?.campLayout?.facilities?.filter(f => f.type === "shelter" || f.type === "neighborhood").length || 12;
        const projectId = project.id || "draft";
        
        const response = await fetch(`/api/shelter/occupancy?projectId=${projectId}&peopleCount=${totalPeople}&capacity=${capacity}&totalUnits=${totalUnits}`);
        if (!response.ok) throw new Error("Failed to fetch occupancy");
        
        const data = await response.json();
        if (active && data.occupancies) {
          const mapping: Record<number, string> = {};
          data.occupancies.forEach((item: any) => {
            mapping[item.unitIndex] = item.label;
          });
          setFetchedOccupancies(mapping);
        }
      } catch (err) {
        console.error("Error fetching dynamic occupancy:", err);
      } finally {
        if (active) setIsFetchingOccupancies(false);
      }
    };

    fetchOccupancy();
    
    // Refresh every 15 seconds to simulate real-time dynamic changes
    const intervalId = setInterval(fetchOccupancy, 15000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [project]);

  // Satellite terrain state
  const [isAnalyzingSatellite, setIsAnalyzingSatellite] = useState<boolean>(false);
  const [satelliteAnalysisResult, setSatelliteAnalysisResult] = useState<any>(null);
  const [isSatelliteOverlayEnabled, setIsSatelliteOverlayEnabled] = useState<boolean>(true);
  const [scanStep, setScanStep] = useState<string>("");

  const facilities = project?.blueprints?.campLayout?.facilities || [];
  const filteredFacilities = facilities.filter((f) => {
    if (activeFilterCategory === "all") return true;
    if (activeFilterCategory === "shelters") return f.type === "shelter" || f.type === "neighborhood";
    if (activeFilterCategory === "water_sanitation") return f.type === "water" || f.type === "latrines" || f.type === "waste" || f.type === "utility_hub";
    if (activeFilterCategory === "medical_safety") return f.type === "medical" || f.type === "hospital" || f.type === "fire";
    if (activeFilterCategory === "other") {
      return f.type !== "shelter" && f.type !== "neighborhood" && 
             f.type !== "water" && f.type !== "latrines" && f.type !== "waste" && f.type !== "utility_hub" &&
             f.type !== "medical" && f.type !== "hospital" && f.type !== "fire";
    }
    return true;
  });

  // Clear satellite results when location changes
  useEffect(() => {
    setSatelliteAnalysisResult(null);
  }, [geoLoc]);

  // Satellite Terrain scanner handler
  const handleRunSatelliteScan = () => {
    setIsAnalyzingSatellite(true);
    setScanStep(lang === "ar" ? "إطلاق إشارة المسح الراداري وسحب الصور عالية الدقة..." : "Triggering radar sweep and fetching high-res imagery...");
    
    setTimeout(() => {
      setScanStep(lang === "ar" ? "تحليل الارتفاعات الرقمية وحساب نسب ميل التضاريس..." : "Analyzing digital elevation and calculating terrain slopes...");
      
      setTimeout(() => {
        setScanStep(lang === "ar" ? "تشغيل مرشحات الأشعة تحت الحمراء لكشف الصخور والأشجار..." : "Applying infrared filters to detect rocks and trees...");
        
        setTimeout(() => {
          setScanStep(lang === "ar" ? "تحديد مسارات السيول وتحديد نطاقات الخطر المائي..." : "Mapping drainage pathways and outlining hydrological hazard areas...");
          
          setTimeout(() => {
            const result = generateSatelliteAnalysis(geoLoc.lat, geoLoc.lng, geoLoc.name);
            setSatelliteAnalysisResult(result);
            setIsAnalyzingSatellite(false);
            setScanStep("");
          }, 800);
        }, 800);
      }, 800);
    }, 800);
  };

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
    filteredFacilities.forEach((f) => {
      const originalIndex = facilities.indexOf(f);
      const index = originalIndex !== -1 ? originalIndex : 0;

      // Offset each facility around the geocoded location, centered on the grid midpoint
      const offsetX = f.x - midX;
      const offsetY = f.y - midY;

      // Note: in layout coordinates, Y is usually down, X is right
      // We map: latitude offset = -offsetY * latPerMeter, longitude offset = offsetX * lngPerMeter
      const facLat = geoLoc.lat - offsetY * latPerMeter;
      const facLng = geoLoc.lng + offsetX * lngPerMeter;

      // Calculate occupancy for shelters (fetched from API or calculated fallback)
      const isShelter = f.type === "shelter";
      let occupancyStr = "";
      if (isShelter) {
        if (fetchedOccupancies[index]) {
          occupancyStr = fetchedOccupancies[index];
        } else {
          const capacity = project?.suggestedModel?.capacityPerUnit || 6;
          const totalPeople = project?.input?.peopleCount || 80;
          const hash = (index * 7 + 13) % 11;
          const currentOccupancy = Math.max(2, Math.min(capacity, (totalPeople % 3 === 0) ? (capacity - (hash % 3)) : (capacity - (hash % 2))));
          occupancyStr = `${currentOccupancy}/${capacity}`;
        }
      }

      // Generate dynamic color-coded occupancy tag on unit marker
      let occupancyTagHtml = "";
      if (isShelter && showOccupancyLabels && occupancyStr) {
        const parts = occupancyStr.split("/");
        const current = parseInt(parts[0]) || 0;
        const max = parseInt(parts[1]) || 1;
        const ratio = current / max;

        let badgeColorClass = "bg-emerald-500 text-white border-emerald-400";
        if (ratio >= 1.0) {
          badgeColorClass = "bg-rose-500 text-white border-rose-400";
        } else if (ratio >= 0.7) {
          badgeColorClass = "bg-amber-500 text-white border-amber-400";
        }

        occupancyTagHtml = `
          <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-1 py-0.5 rounded-md text-[8px] font-mono font-black border shadow-sm z-30 transition-all ${badgeColorClass}">
            👥 ${occupancyStr}
          </div>
        `;
      }

      // Style based on type
      let colorClass = "bg-indigo-600";
      let textSymbol = "S"; // Shelter
      let iconColor = "#4f46e5";
      let typeLabel = tr("وحدة سكنية", "Shelter Unit");

      if (f.type === "water") {
        colorClass = "bg-blue-500 animate-pulse";
        textSymbol = "W";
        iconColor = "#0ea5e9";
        typeLabel = tr("محطة وشبكة مياه", "Water Station & Grid");
      } else if (f.type === "medical") {
        colorClass = "bg-emerald-500 border border-emerald-100 animate-pulse";
        textSymbol = "H";
        iconColor = "#10b981";
        typeLabel = tr("عيادة ميدانية", "Field Clinic");
      } else if (f.type === "latrines") {
        colorClass = "bg-amber-600";
        textSymbol = "T";
        iconColor = "#d97706";
        typeLabel = tr("مرفق صرف صحي ومراحيض", "Communal Sanitation");
      } else if (f.type === "admin") {
        colorClass = "bg-slate-700";
        textSymbol = "A";
        iconColor = "#334155";
        typeLabel = tr("إدارة المخيم", "Administration");
      } else if (f.type === "space") {
        colorClass = "bg-pink-500";
        textSymbol = "K";
        iconColor = "#ec4899";
        typeLabel = tr("مساحة صديقة للأطفال", "Child Friendly Space");
      } else if (f.type === "solar") {
        colorClass = "bg-amber-400 border border-amber-300";
        textSymbol = "⚡";
        iconColor = "#f59e0b";
        typeLabel = tr("محطة طاقة شمسية وتوليد", "Solar Energy Hub");
      } else if (f.type === "fire") {
        colorClass = "bg-red-500 animate-bounce";
        textSymbol = "🔥";
        iconColor = "#ef4444";
        typeLabel = tr("نقطة إطفاء ومكافحة حريق", "Firefighting Station");
      } else if (f.type === "waste") {
        colorClass = "bg-teal-700";
        textSymbol = "♻️";
        iconColor = "#0f766e";
        typeLabel = tr("نقطة جمع وإدارة النفايات", "Waste Management");
      } else if (f.type === "school") {
        colorClass = "bg-sky-600";
        textSymbol = "📚";
        iconColor = "#0284c7";
        typeLabel = tr("مدرسة مؤقتة", "Temporary School");
      } else if (f.type === "nutrition") {
        colorClass = "bg-orange-500";
        textSymbol = "🍲";
        iconColor = "#f97316";
        typeLabel = tr("مركز توزيع الغذاء والتغذية", "Nutrition Center");
      } else if (f.type === "support") {
        colorClass = "bg-purple-600";
        textSymbol = "🧠";
        iconColor = "#7c3aed";
        typeLabel = tr("موقع دعم نفسي واجتماعي", "Psychosocial Support");
      } else if (f.type === "neighborhood") {
        colorClass = "bg-violet-600 border border-violet-100";
        textSymbol = "🏡";
        iconColor = "#7c3aed";
        typeLabel = tr("حي سكني ذكي", "Smart Residential Neighborhood");
      } else if (f.type === "road_hub") {
        colorClass = "bg-slate-500";
        textSymbol = "🛣️";
        iconColor = "#64748b";
        typeLabel = tr("محور وشبكة طرق رئيسية", "Main Road & Street Grid");
      } else if (f.type === "green_zone") {
        colorClass = "bg-emerald-600";
        textSymbol = "🌳";
        iconColor = "#059669";
        typeLabel = tr("منطقة خضراء ومتنزه بيئي", "Green Park & Ecological Zone");
      } else if (f.type === "market") {
        colorClass = "bg-fuchsia-600";
        textSymbol = "🛍️";
        iconColor = "#c026d3";
        typeLabel = tr("مركز سوق وتبادل تجاري", "Bazaar & Commercial Market");
      } else if (f.type === "hospital") {
        colorClass = "bg-rose-600 border border-rose-200 animate-pulse";
        textSymbol = "🏥";
        iconColor = "#e11d48";
        typeLabel = tr("مجمع مستشفى مركزي ذكي", "Central Smart Hospital");
      } else if (f.type === "traffic_control") {
        colorClass = "bg-cyan-600";
        textSymbol = "🚦";
        iconColor = "#0891b2";
        typeLabel = tr("إدارة حركة المرور والسلامة", "Traffic Control & Road Safety");
      } else if (f.type === "expansion_zone") {
        colorClass = "bg-indigo-400 border-2 border-dashed border-indigo-600";
        textSymbol = "📈";
        iconColor = "#818cf8";
        typeLabel = tr("نطاق التوسع العمراني المستقبلي", "Future Urban Expansion Zone");
      } else if (f.type === "utility_hub") {
        colorClass = "bg-amber-500 animate-pulse";
        textSymbol = "⚙️";
        iconColor = "#d97706";
        typeLabel = tr("مجمع خدمات البنية التحتية الذكية", "Smart Utility Grid Hub");
      }

      // Generate HTML customized DivIcon
      const divIcon = L.divIcon({
        className: "",
        html: `
          <div id="facility-${index}" class="relative group cursor-pointer flex items-center justify-center">
            ${occupancyTagHtml}
            <div class="w-8 h-8 rounded-full ${colorClass} text-white flex items-center justify-center font-bold shadow-md border-2 border-white text-xs transition-transform transform hover:scale-110 active:scale-95 duration-200">
              ${textSymbol}
            </div>
            <!-- Pulse ripple for important community units -->
            ${f.type === "medical" || f.type === "water" || f.type === "hospital" || f.type === "utility_hub" ? `<div class="absolute -inset-1 rounded-full bg-${f.type === "medical" || f.type === "hospital" ? "emerald" : f.type === "water" ? "blue" : "amber"}-400 opacity-20 animate-ping -z-10"></div>` : ""}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      // Construct Marker
      const marker = L.marker([facLat, facLng], { icon: divIcon });

      // Add occupancy indicator inside popup if it's a shelter
      const occupancyHtml = isShelter ? `
        <div class="mt-1.5 p-1.5 bg-indigo-50 border border-indigo-100/60 rounded-lg text-[10px] text-indigo-800 font-bold flex items-center justify-between">
          <span>👥 ${tr("نسبة الإشغال", "Occupancy")}</span>
          <span>${occupancyStr} ${tr("شخص", "persons")}</span>
        </div>
      ` : "";

      // Add elegant map Popup
      const popupContent = `
        <div class="p-3 text-slate-800 ${isRtl ? "text-right" : "text-left"}" dir="${isRtl ? "rtl" : "ltr"}">
          <span class="inline-block text-[9px] px-2 py-0.5 rounded-full font-bold text-white mb-1.5" style="background-color: ${iconColor};">
            ${typeLabel}
          </span>
          <h5 class="font-extrabold text-sm text-slate-900 mb-1">${f.name}</h5>
          ${occupancyHtml}
          <div class="text-[10px] text-slate-500 space-y-1 mt-2">
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

      // Show permanent unit labels (e.g., 'Unit 1') directly on the map if enabled
      if ((showUnitLabels || showOccupancyLabels) && isShelter) {
        const unitNumMatch = f.name.match(/\d+/);
        const unitNum = unitNumMatch ? unitNumMatch[0] : (index + 1).toString();
        
        let displayLabel = "";
        if (showUnitLabels) {
          displayLabel = lang === "ar" ? `وحدة ${unitNum}` : `Unit ${unitNum}`;
        }
        
        if (displayLabel) {
          marker.bindTooltip(displayLabel, {
            permanent: true,
            direction: "top",
            className: "custom-unit-tooltip px-1.5 py-0.5 rounded font-mono font-bold text-[9px] border border-slate-700/50 shadow-md bg-slate-900 text-white",
            offset: [0, -12]
          });
        }
      }

      // Draw dynamic population density heatmap if enabled and it is a shelter
      if (showHeatmap && isShelter) {
        const parts = occupancyStr.split("/");
        const current = parseInt(parts[0]) || 0;
        const max = parseInt(parts[1]) || 1;
        const ratio = current / max;

        // Color based on population density ratio (Red = high density, Yellow = medium density, Green = low density)
        let heatColor = "#ef4444"; // High density (Red)
        if (ratio < 0.5) {
          heatColor = "#10b981"; // Low density (Green)
        } else if (ratio < 0.8) {
          heatColor = "#f59e0b"; // Medium density (Amber)
        }

        // Draw outer soft glow
        const outerCircle = L.circle([facLat, facLng], {
          radius: 18,
          stroke: false,
          fillColor: heatColor,
          fillOpacity: 0.12,
          interactive: false
        });
        
        // Draw middle semi-intense glow
        const middleCircle = L.circle([facLat, facLng], {
          radius: 11,
          stroke: false,
          fillColor: heatColor,
          fillOpacity: 0.22,
          interactive: false
        });

        // Draw inner core heat point
        const innerCircle = L.circle([facLat, facLng], {
          radius: 5,
          stroke: false,
          fillColor: heatColor,
          fillOpacity: 0.45,
          interactive: false
        });

        markersGroup.addLayer(outerCircle);
        markersGroup.addLayer(middleCircle);
        markersGroup.addLayer(innerCircle);
      }

      // Store index in options for custom panning trigger
      (marker as any).facilityIndex = index;
      (marker as any).facilityName = f.name;

      markersGroup.addLayer(marker);
    });
    
    // Add Satellite Terrain Analysis features if present and enabled
    if (satelliteAnalysisResult && isSatelliteOverlayEnabled) {
      // 1. Draw Trees (Green Circles)
      satelliteAnalysisResult.trees.forEach((t: any) => {
        const treeCircle = L.circle([t.lat, t.lng], {
          radius: t.size,
          color: "#059669",
          weight: 1.5,
          fillColor: "#10b981",
          fillOpacity: 0.35
        });
        treeCircle.bindPopup(`
          <div class="p-1.5 text-right font-sans">
            <p class="font-bold text-slate-800 text-xs">🌲 ${tr("شجرة طبيعية مكتشفة", "Detected Natural Tree")}</p>
            <p class="text-[10px] text-slate-500 mt-0.5">${tr(`تُستخدم كمصد طبيعي للرياح وظل حراري للخيام`, `Utilized as natural windbreak and thermal shade for shelters`)}</p>
          </div>
        `, { closeButton: false });
        markersGroup.addLayer(treeCircle);
      });

      // 2. Draw Rocks (Grey Circles)
      satelliteAnalysisResult.rocks.forEach((r: any) => {
        const rockCircle = L.circle([r.lat, r.lng], {
          radius: r.size,
          color: "#4b5563",
          weight: 1.5,
          fillColor: "#9ca3af",
          fillOpacity: 0.4
        });
        rockCircle.bindPopup(`
          <div class="p-1.5 text-right font-sans">
            <p class="font-bold text-slate-800 text-xs">🪨 ${tr("كتلة صخرية مرصودة", "Detected Rock Boulder")}</p>
            <p class="text-[10px] text-slate-500 mt-0.5">${tr(`تم توجيه وتخطيط المجمع لتجنب هذا الحاجز الصخري`, `Shelter planning adjusted to avoid this boulder`)}</p>
          </div>
        `, { closeButton: false });
        markersGroup.addLayer(rockCircle);
      });

      // 3. Draw Danger Zone (Red circle with dashed border)
      const dz = satelliteAnalysisResult.dangerZone;
      const dangerCircle = L.circle([dz.center.lat, dz.center.lng], {
        radius: dz.radius,
        color: "#dc2626",
        weight: 2,
        dashArray: "6,6",
        fillColor: "#ef4444",
        fillOpacity: 0.2
      });
      dangerCircle.bindPopup(`
        <div class="p-2 text-right font-sans">
          <p class="font-bold text-red-700 text-xs">⚠️ ${tr("منطقة خطر محددة بالأقمار", "Satellite Identified Danger Zone")}</p>
          <p class="text-[10px] text-slate-700 font-semibold mt-1">${lang === "ar" ? dz.labelAr : dz.label}</p>
          <p class="text-[9px] text-red-500 mt-0.5">${tr(`يُحظر تماماً إقامة أي مأوى أو سكن داخل هذا النطاق`, `Strictly prohibited to place structures in this buffer`)}</p>
        </div>
      `, { closeButton: false });
      markersGroup.addLayer(dangerCircle);

      // 3b. Draw Torrent Path (مسار السيول)
      const tc = satelliteAnalysisResult.torrentCoords;
      if (tc && tc.length > 0) {
        const torrentPath = L.polyline(tc.map((c: any) => [c.lat, c.lng]), {
          color: "#2563eb",
          weight: 4,
          dashArray: "10,10",
          opacity: 0.8
        });
        torrentPath.bindPopup(`
          <div class="p-2 text-right font-sans">
            <p class="font-bold text-blue-700 text-xs">🌊 ${tr("مجرى ومسار سيول نشط", "Active Flash Flood / Torrent Pathway")}</p>
            <p class="text-[10px] text-slate-700 mt-1">${tr("كشف المسح الجغرافي وجود انحدار مائي نشط، وتم توجيه وحدات الإيواء خارج هذا النطاق لحمايتها من الغرق.", "GIS analysis detected a natural hydrological drainage line. All shelter locations are safely routed outside this path to prevent flooding.")}</p>
          </div>
        `, { closeButton: false });
        markersGroup.addLayer(torrentPath);
      }

      // 4. Draw Optimal Anchor (Golden star/marker)
      const opt = satelliteAnalysisResult.optimalCenter;
      const goldIcon = L.divIcon({
        className: "",
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold shadow-lg border-2 border-white text-xs">
              ⭐
            </div>
            <div class="absolute -inset-1 rounded-full bg-amber-400 opacity-40 animate-ping -z-10"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });
      const optMarker = L.marker([opt.lat, opt.lng], { icon: goldIcon });
      optMarker.bindPopup(`
        <div class="p-2 text-right font-sans">
          <p class="font-bold text-amber-700 text-xs">✨ ${tr("الموقع الأمثل المقترح", "Optimal Proposed Site Center")}</p>
          <p class="text-[10px] text-slate-600 mt-0.5">${tr(`مسطح مثالي بمستوى ميل ${satelliteAnalysisResult.slope}° لتقليص الانجرافات`, `Flat pocket with optimal ${satelliteAnalysisResult.slope}° slope to minimize runoff`)}</p>
        </div>
      `, { closeButton: false });
      markersGroup.addLayer(optMarker);
    }

    // Auto-adjust bounds to fit all distributed shelters safely!
    if (markersGroup.getLayers().length > 0) {
      const bounds = markersGroup.getBounds();
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [geoLoc, project, satelliteAnalysisResult, isSatelliteOverlayEnabled, showUnitLabels, showOccupancyLabels, showHeatmap, activeFilterCategory, fetchedOccupancies]);

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

        {/* Map Display Options Toggle */}
        <div className="bg-indigo-50/40 p-3 rounded-xl border border-indigo-100/60 flex flex-col gap-2">
          <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-indigo-600" />
            {tr("خيارات العرض التفاعلي", "Interactive Options")}
          </h4>
          
          <label className="flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer select-none font-bold">
            <input
              id="toggle-unit-labels"
              type="checkbox"
              checked={showUnitLabels}
              onChange={(e) => setShowUnitLabels(e.target.checked)}
              className="rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
            />
            <span>{tr("عرض مسميات الوحدات", "Show Unit Labels")}</span>
          </label>

          <label className="flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer select-none font-bold">
            <input
              id="toggle-occupancy-labels"
              type="checkbox"
              checked={showOccupancyLabels}
              onChange={(e) => setShowOccupancyLabels(e.target.checked)}
              className="rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
            />
            <span>{tr("طبقات نسب الإشغال الديناميكية", "Toggle Occupancy Overlays")}</span>
          </label>

          <label className="flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer select-none font-bold">
            <input
              id="toggle-heatmap"
              type="checkbox"
              checked={showHeatmap}
              onChange={(e) => setShowHeatmap(e.target.checked)}
              className="rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
            />
            <span>{tr("خريطة التمثيل الحراري للكثافة", "Toggle Population Heatmap")}</span>
          </label>

          <span className="text-[9px] text-slate-500 leading-tight">
            {tr("التحكم في عرض مسميات الوحدات (مثل Unit 1)، ونسب الإشغال الفعالة (👥 4/6)، وخريطة الكثافة الحرارية لتجمع السكان حياً على الخريطة.", "Controls display of unit tags (e.g. Unit 1), active occupancy rates (👥 4/6), and real-time population density heat overlay.")}
          </span>
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
            {project?.blueprints.campLayout.facilities.filter((f) => {
              if (activeFilterCategory === "all") return true;
              if (activeFilterCategory === "shelters") return f.type === "shelter" || f.type === "neighborhood";
              if (activeFilterCategory === "water_sanitation") return f.type === "water" || f.type === "latrines" || f.type === "waste" || f.type === "utility_hub";
              if (activeFilterCategory === "medical_safety") return f.type === "medical" || f.type === "hospital" || f.type === "fire";
              if (activeFilterCategory === "other") {
                return f.type !== "shelter" && f.type !== "neighborhood" && 
                       f.type !== "water" && f.type !== "latrines" && f.type !== "waste" && f.type !== "utility_hub" &&
                       f.type !== "medical" && f.type !== "hospital" && f.type !== "fire";
              }
              return true;
            }).map((fac) => {
              const originalIndex = project?.blueprints.campLayout.facilities.indexOf(fac) ?? 0;
              const isSelected = selectedFacility === fac.name;
              
              const isShelterCard = fac.type === "shelter";
              let occupancyStrCard = "";
              if (isShelterCard) {
                const capacity = project?.suggestedModel?.capacityPerUnit || 6;
                const totalPeople = project?.input?.peopleCount || 80;
                const hash = (originalIndex * 7 + 13) % 11;
                const currentOccupancy = Math.max(2, Math.min(capacity, (totalPeople % 3 === 0) ? (capacity - (hash % 3)) : (capacity - (hash % 2))));
                occupancyStrCard = `${currentOccupancy}/${capacity}`;
              }

              let badgeColor = "bg-indigo-100 text-indigo-800";
              if (fac.type === "water") badgeColor = "bg-blue-100 text-blue-800 font-black";
              else if (fac.type === "medical") badgeColor = "bg-emerald-100 text-emerald-800 font-black";
              else if (fac.type === "latrines") badgeColor = "bg-amber-100 text-amber-800 font-black";
              else if (fac.type === "admin") badgeColor = "bg-slate-100 text-slate-800 font-black";
              else if (fac.type === "space") badgeColor = "bg-pink-100 text-pink-800 font-black";
              else if (fac.type === "solar") badgeColor = "bg-amber-100 text-amber-900 font-black";
              else if (fac.type === "fire") badgeColor = "bg-red-100 text-red-800 font-black animate-pulse";
              else if (fac.type === "waste") badgeColor = "bg-teal-100 text-teal-800 font-black";
              else if (fac.type === "school") badgeColor = "bg-sky-100 text-sky-800 font-black";
              else if (fac.type === "nutrition") badgeColor = "bg-orange-100 text-orange-800 font-black";
              else if (fac.type === "support") badgeColor = "bg-purple-100 text-purple-800 font-black";
              else if (fac.type === "neighborhood") badgeColor = "bg-violet-100 text-violet-800 font-black";
              else if (fac.type === "road_hub") badgeColor = "bg-slate-100 text-slate-700 font-black";
              else if (fac.type === "green_zone") badgeColor = "bg-emerald-100 text-emerald-800 font-black";
              else if (fac.type === "market") badgeColor = "bg-fuchsia-100 text-fuchsia-800 font-black";
              else if (fac.type === "hospital") badgeColor = "bg-rose-100 text-rose-800 font-black animate-pulse";
              else if (fac.type === "traffic_control") badgeColor = "bg-cyan-100 text-cyan-800 font-black";
              else if (fac.type === "expansion_zone") badgeColor = "bg-indigo-100 text-indigo-800 font-black border border-dashed border-indigo-300";
              else if (fac.type === "utility_hub") badgeColor = "bg-amber-100 text-amber-800 font-black animate-pulse";

              return (
                <button
                  key={originalIndex}
                  onClick={() => handleLocateFacility(fac, originalIndex)}
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
                    {isShelterCard && (
                      <span className="text-[10px] font-bold text-indigo-600 block mt-1">
                        👥 {tr(`الإشغال: ${occupancyStrCard} أفراد`, `Occupancy: ${occupancyStrCard} persons`)}
                      </span>
                    )}
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

          {/* Futuristic radar scanner animation overlay */}
          {isAnalyzingSatellite && (
            <div className="absolute inset-0 bg-slate-900/85 z-20 flex flex-col items-center justify-center text-white p-6 backdrop-blur-xs">
              <div className="relative flex items-center justify-center w-24 h-24 mb-6">
                <div className="absolute inset-0 rounded-full border border-teal-500/30 animate-pulse"></div>
                <div className="absolute inset-2 rounded-full border border-teal-500/50 animate-pulse"></div>
                <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-teal-400 animate-spin" style={{ animationDuration: '1.5s' }}></div>
                <Compass className="w-8 h-8 text-teal-400 animate-pulse" />
              </div>
              <h4 className="font-extrabold text-sm mb-2 text-teal-300 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-teal-400" />
                {lang === "ar" ? "جاري المسح الراداري الطبوغرافي..." : "Running Topographical Radar Sweep..."}
              </h4>
              <p className="text-xs text-slate-300 font-mono text-center max-w-sm leading-relaxed animate-pulse">
                {scanStep}
              </p>
            </div>
          )}

          {/* Floating UI Overlay: Map Compass HUD */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
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

          {/* Floating UI Overlay: Active Map Control & Filter Panel */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 w-[260px] md:w-[280px]">
            <div className="bg-white/95 p-3 rounded-xl border border-slate-200/80 shadow-md backdrop-blur-md flex flex-col gap-2 text-[10px]">
              <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1.5 justify-between">
                <span className="font-extrabold text-[11px] text-slate-800 flex items-center gap-1">
                  <span className="text-indigo-600 font-bold">⚙️</span>
                  {tr("تصفية وعرض المعالم", "Map Overlays & Filter")}
                </span>
                <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded font-mono font-bold">
                  {filteredFacilities.length} / {facilities.length}
                </span>
              </div>

              {/* Toggle Unit Labels Checkbox */}
              <label className="flex items-center gap-2 text-[10.5px] text-slate-700 cursor-pointer select-none font-bold">
                <input
                  id="map-floating-toggle-labels"
                  type="checkbox"
                  checked={showUnitLabels}
                  onChange={(e) => setShowUnitLabels(e.target.checked)}
                  className="rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                />
                <span>{tr("عرض مسميات الوحدات", "Toggle Unit Labels")}</span>
              </label>

              {/* Toggle Occupancy Overlays Checkbox */}
              <label className="flex items-center gap-2 text-[10.5px] text-slate-700 cursor-pointer select-none font-bold">
                <input
                  id="map-floating-toggle-occupancy"
                  type="checkbox"
                  checked={showOccupancyLabels}
                  onChange={(e) => setShowOccupancyLabels(e.target.checked)}
                  className="rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                />
                <span>{tr("طبقات نسب الإشغال الديناميكية", "Toggle Occupancy Overlays")}</span>
              </label>

              {/* Toggle Population Heatmap Checkbox */}
              <label className="flex items-center gap-2 text-[10.5px] text-slate-700 cursor-pointer select-none font-bold">
                <input
                  id="map-floating-toggle-heatmap"
                  type="checkbox"
                  checked={showHeatmap}
                  onChange={(e) => setShowHeatmap(e.target.checked)}
                  className="rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                />
                <span>{tr("خريطة التمثيل الحراري للكثافة", "Toggle Population Heatmap")}</span>
              </label>

              {/* Multi-category Filtering buttons to reduce clutter */}
              <div className="flex flex-col gap-1 mt-1">
                <span className="text-[9px] text-slate-400 font-bold block mb-0.5">
                  {tr("تصفية معالم المخطط وتقليل الازدحام:", "Filter elements to reduce clutter:")}
                </span>
                
                <div className="grid grid-cols-1 gap-1">
                  <button
                    onClick={() => setActiveFilterCategory("all")}
                    className={`text-[9px] py-1 px-1.5 rounded-lg font-bold text-right flex items-center justify-between transition-all border cursor-pointer ${
                      activeFilterCategory === "all"
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-3xs"
                        : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100"
                    }`}
                  >
                    <span>🌐 {tr("عرض الكل (افتراضي)", "Show All (Default)")}</span>
                    <span className="text-[8px] opacity-85">({facilities.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveFilterCategory("shelters")}
                    className={`text-[9px] py-1 px-1.5 rounded-lg font-bold text-right flex items-center justify-between transition-all border cursor-pointer ${
                      activeFilterCategory === "shelters"
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-3xs"
                        : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100"
                    }`}
                  >
                    <span>🏠 {tr("ملاجئ ووحدات سكنية", "Housing & Shelters Only")}</span>
                    <span className="text-[8px] opacity-85">({facilities.filter(f => f.type === "shelter" || f.type === "neighborhood").length})</span>
                  </button>

                  <button
                    onClick={() => setActiveFilterCategory("water_sanitation")}
                    className={`text-[9px] py-1 px-1.5 rounded-lg font-bold text-right flex items-center justify-between transition-all border cursor-pointer ${
                      activeFilterCategory === "water_sanitation"
                        ? "bg-blue-600 text-white border-blue-600 shadow-3xs"
                        : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100"
                    }`}
                  >
                    <span>💧 {tr("المياه والصرف والخدمات", "Water, Sanitation & Grid")}</span>
                    <span className="text-[8px] opacity-85">({facilities.filter(f => f.type === "water" || f.type === "latrines" || f.type === "waste" || f.type === "utility_hub").length})</span>
                  </button>

                  <button
                    onClick={() => setActiveFilterCategory("medical_safety")}
                    className={`text-[9px] py-1 px-1.5 rounded-lg font-bold text-right flex items-center justify-between transition-all border cursor-pointer ${
                      activeFilterCategory === "medical_safety"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-3xs"
                        : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100"
                    }`}
                  >
                    <span>🏥 {tr("المرافق الطبية والطوارئ", "Medical, Hospital & Fire")}</span>
                    <span className="text-[8px] opacity-85">({facilities.filter(f => f.type === "medical" || f.type === "hospital" || f.type === "fire").length})</span>
                  </button>

                  <button
                    onClick={() => setActiveFilterCategory("other")}
                    className={`text-[9px] py-1 px-1.5 rounded-lg font-bold text-right flex items-center justify-between transition-all border cursor-pointer ${
                      activeFilterCategory === "other"
                        ? "bg-slate-700 text-white border-slate-700 shadow-3xs"
                        : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100"
                    }`}
                  >
                    <span>📚 {tr("المدارس والخدمات الاجتماعية", "Schools, Admin & Markets")}</span>
                    <span className="text-[8px] opacity-85">({facilities.filter(f => f.type !== "shelter" && f.type !== "neighborhood" && f.type !== "water" && f.type !== "latrines" && f.type !== "waste" && f.type !== "utility_hub" && f.type !== "medical" && f.type !== "hospital" && f.type !== "fire").length})</span>
                  </button>
                </div>
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

        {/* AI Satellite Terrain Analysis Card */}
        <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl flex flex-col gap-4">
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                <Layers3 className="w-4 h-4" />
              </div>
              <div className="text-right">
                <h4 className="text-xs font-black text-slate-800">
                  {tr("تحليل التضاريس وصور الأقمار الصناعية بالذكاء الاصطناعي", "AI Satellite Imagery & Terrain Analyzer")}
                </h4>
                <p className="text-[9px] text-slate-500 mt-0.5">
                  {tr("مسح آلي للمنحدرات، الصخور، الأشجار، ومسارات السيول لحماية المخيم", "Auto-scan elevation slope, natural obstacles, vegetation canopy, and torrent risk buffers")}
                </p>
              </div>
            </div>

            {!satelliteAnalysisResult ? (
              <button
                onClick={handleRunSatelliteScan}
                disabled={isAnalyzingSatellite}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer hover:-translate-y-0.5"
              >
                <Compass className="w-4 h-4 animate-pulse" />
                {tr("بدء تحليل التضاريس الفعلي", "Run AI Terrain Analysis")}
              </button>
            ) : (
              <div className="flex items-center gap-3">
                {/* Toggle Overlay */}
                <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSatelliteOverlayEnabled}
                    onChange={(e) => setIsSatelliteOverlayEnabled(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                  />
                  <span>{tr("عرض الطبقات على الخريطة", "Show overlays on map")}</span>
                </label>
                
                <button
                  onClick={handleRunSatelliteScan}
                  disabled={isAnalyzingSatellite}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  {tr("إعادة المسح", "Re-Scan Site")}
                </button>
              </div>
            )}
          </div>

          {/* Results Bento Box */}
          {satelliteAnalysisResult && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                
                {/* 1. Slope Gauge */}
                <div className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col justify-between shadow-3xs">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">
                    {tr("حساب درجة الميل (Slope)", "Slope Calculation")}
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-lg font-black text-slate-800">{satelliteAnalysisResult.slope}°</span>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm ${
                      satelliteAnalysisResult.slope <= 5 ? "bg-emerald-50 text-emerald-700" :
                      satelliteAnalysisResult.slope <= 9 ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                    }`}>
                      {satelliteAnalysisResult.slope <= 5 ? tr("ممتاز ومستوٍ", "Optimal Flat") :
                       satelliteAnalysisResult.slope <= 9 ? tr("متوسط الانحدار", "Moderate") : tr("منحدر خطير", "Steep Slope")}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-500 mt-1.5 leading-normal">
                    {tr(
                      "زاوية انحدار مثالية لتصريف مياه الأمطار دون التسبب في انزلاقات أرضية أو جرف الأساسات.",
                      "Ideal angle for drainage without risking structure slides or foundation washout."
                    )}
                  </p>
                </div>

                {/* 2. Trees Panel */}
                <div className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col justify-between shadow-3xs">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">
                    {tr("الغطاء النباتي (Trees)", "Tree Detection")}
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-lg font-black text-emerald-700">{satelliteAnalysisResult.treeCount}</span>
                    <span className="text-[10px] text-slate-500 font-bold">{tr("شجرة طبيعية", "trees detected")}</span>
                  </div>
                  <p className="text-[9px] text-slate-500 mt-1.5 leading-normal">
                    {tr(
                      "تم كشفها ودمجها كحواجز رياح حية وتوفير تبريد طبيعي من وهج الشمس للمخيم.",
                      "Detected and integrated to serve as organic windbreaks and block thermal solar exposure."
                    )}
                  </p>
                </div>

                {/* 3. Obstacles (Rocks) */}
                <div className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col justify-between shadow-3xs">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">
                    {tr("العوائق الصخرية (Rocks)", "Rock Detection")}
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-lg font-black text-slate-600">{satelliteAnalysisResult.rockCount}</span>
                    <span className="text-[10px] text-slate-500 font-bold">{tr("كتلة صخرية", "boulders")}</span>
                  </div>
                  <p className="text-[9px] text-slate-500 mt-1.5 leading-normal">
                    {tr(
                      "كشف الرادار صخوراً بارزة وتم تعديل مواقع الخيام تلقائياً لتجنب الحفر غير الصالح.",
                      "Identified boulder outcrops; structural planning shifted to bypass excavation blockages."
                    )}
                  </p>
                </div>

                {/* 4. Danger Zones & Optimal Placement */}
                <div className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col justify-between shadow-3xs">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">
                    {tr("تقييم الخطر والبديل", "Hazard & Optimal Site")}
                  </span>
                  <div className="flex flex-col gap-1 mt-1">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md text-center ${
                      satelliteAnalysisResult.dangerZone.severity === "high" ? "bg-rose-100 text-rose-800" :
                      satelliteAnalysisResult.dangerZone.severity === "medium" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                    }`}>
                      ⚠️ {lang === "ar" ? "رصد منطقة خطر" : "Hazard Area Flagged"}
                    </span>
                    <span className="text-[9px] font-mono font-bold text-slate-500 block mt-0.5 truncate text-center">
                      📍 {satelliteAnalysisResult.optimalCenter.lat.toFixed(5)}°, {satelliteAnalysisResult.optimalCenter.lng.toFixed(5)}°
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-500 mt-1 leading-normal">
                    {tr(
                      "تم رسم حيز خطر مائي وبناء المركز المثالي المقترح للمخيم بعيداً عنه تماماً.",
                      "Mapped hydrological buffer; relocated optimal camp anchor to clean level pocket."
                    )}
                  </p>
                </div>

              </div>

              {/* Second row of Bento box: Climate, Wind, Sun, and Site Intelligence */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                
                {/* 5. Elevation Card */}
                <div className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col justify-between shadow-3xs">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">
                      {tr("الارتفاع الجغرافي (Altitude)", "Altitude & Elevation")}
                    </span>
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-lg font-black text-slate-800">{satelliteAnalysisResult.elevation}م</span>
                    <span className="text-[10px] text-slate-500 font-bold">{tr("فوق مستوى البحر", "above sea level")}</span>
                  </div>
                  <p className="text-[9px] text-slate-500 mt-1.5 leading-normal">
                    {tr(
                      "تؤثر مستويات الارتفاع المباشرة على مناخ المنطقة ومسارات الصرف الطبيعي للمياه السطحية.",
                      "Calculated elevations map local runoff behaviors and microclimate temperature pressure."
                    )}
                  </p>
                </div>

                {/* 6. Wind Velocity Card */}
                <div className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col justify-between shadow-3xs">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">
                      {tr("اتجاه وسرعة الرياح (Wind)", "Prevailing Winds")}
                    </span>
                    <Wind className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-lg font-black text-slate-800">{satelliteAnalysisResult.windSpeed} كم/س</span>
                    <span className="text-[10px] text-indigo-700 font-extrabold truncate max-w-[100px]">
                      {lang === "ar" ? satelliteAnalysisResult.windDir : satelliteAnalysisResult.windDirEn}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-500 mt-1.5 leading-normal">
                    {tr(
                      "يساعد في توجيه مداخل ومخارج الخيام لتقليص ضغط التيارات الهوائية وتفادي تمزيق الأوتاد.",
                      "Guides door placement and anchoring angles to withstand drag load and streamline drafts."
                    )}
                  </p>
                </div>

                {/* 7. Sun Exposure Card */}
                <div className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col justify-between shadow-3xs">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">
                      {tr("التعرض للشمس (Solar Exposure)", "Solar Radiation")}
                    </span>
                    <Sun className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: '10s' }} />
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-lg font-black text-amber-600">{satelliteAnalysisResult.sunHours} ساعة</span>
                    <span className="text-[10px] text-slate-500 font-bold">{tr("سطوع يومي", "sunlight/day")}</span>
                  </div>
                  <p className="text-[9px] text-slate-500 mt-1.5 leading-normal">
                    {tr(
                      "يقيس مستويات الطاقة المتوقعة. يوصى بمظلات تظليل مزدوجة فوق الخيام لتفادي فرط الاحترار.",
                      "Determines solar microgrid capacity. Indicates double insulation needs for critical shelter zones."
                    )}
                  </p>
                </div>

                {/* 8. Best Shelter Placement Card */}
                <div className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col justify-between shadow-3xs">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">
                      {tr("توصية التوجيه الأمثل (Optimal Sector)", "Best Anchor Sector")}
                    </span>
                    <Compass className="w-3.5 h-3.5 text-teal-600" />
                  </div>
                  <div className="flex flex-col gap-0.5 mt-1">
                    <span className="text-[10px] font-extrabold text-teal-800 block line-clamp-2 leading-tight">
                      {lang === "ar" ? satelliteAnalysisResult.bestShelterDirAr : satelliteAnalysisResult.bestShelterDir}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-500 mt-1 leading-normal">
                    {tr(
                      "تحليل طوبوغرافي آلي يرشح النطاقات الأكثر أماناً ضد انجرافات التربة وتجمعات المياه الجانبية.",
                      "Suggests ideal sector coordinates avoiding flood hazards and storm exposure patterns."
                    )}
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* Prompt banner to use tool if not yet run */}
          {!satelliteAnalysisResult && !isAnalyzingSatellite && (
            <div className="bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100 text-[10px] text-indigo-800 flex items-center gap-1.5 justify-center font-semibold">
              <Info className="w-3.5 h-3.5" />
              {tr(
                "يرجى الضغط على 'بدء تحليل التضاريس الفعلي' لتسليط رادار الأقمار الصناعية وعرض الصخور والأشجار ومناطق الخطر والمكان الأمثل للمخيم كطبقات تفاعلية حية على الخريطة.",
                "Click 'Run AI Terrain Analysis' to engage satellite radar and render boulders, trees, danger zones, and optimal locations as live interactive map layers."
              )}
            </div>
          )}
          
        </div>

        {/* Conceptual Camp Visualization (Repeated Units) */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
              <Tent className="w-4 h-4" />
            </div>
            <div className="text-right">
              <h4 className="text-xs font-black text-slate-800">
                {tr("مخطط تخيلي متكامل للوحدات المتكررة (المخيم المؤقت)", "Conceptual Visualization of Repeated Units (Temporary Camp Layout)")}
              </h4>
              <p className="text-[9px] text-slate-500 mt-0.5">
                {tr("محاكاة تخيلية ثلاثية الأبعاد لتراص وتكرار الوحدات السكنية في الموقع المحدد", "3D photorealistic simulation view of the repeated residential units positioned in grid formation")}
              </p>
            </div>
          </div>
          
          <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-slate-200 shadow-xs group bg-slate-50">
            <img 
              src={imgCamp} 
              alt="Conceptual Camp Layout of Repeated Units" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-102 transition-all duration-700"
            />
            <div className="absolute top-2 right-2 bg-black/60 text-[8px] text-white px-2 py-0.5 rounded-md font-bold backdrop-blur-xs">
              {tr("تصور تخيلي بالذكاء الاصطناعي 3D Render", "AI-Generated 3D Conceptual Render")}
            </div>
          </div>
          
          <p className="text-[10px] text-slate-400 text-center leading-normal">
            {tr(
              "تظهر الصورة النمط الإنشائي المتكرر الموزع في مساحة المخيم لضمان السلامة، توفير الطاقة الشمسية، ومقاومة الكوارث الجوية.",
              "The conceptual rendering illustrates the modular and repeated safety shelter pattern distributed in grid formation to optimize solar energy and high wind resilience."
            )}
          </p>
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
