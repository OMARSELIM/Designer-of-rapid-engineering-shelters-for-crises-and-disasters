import express from "express";
import path from "path";
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

// API endpoint for shelter generation
app.post("/api/shelter/generate", async (req, res) => {
  try {
    const input = req.body;
    if (!input) {
       res.status(400).json({ error: "بيانات الإدخال مفقودة" });
       return;
    }

    if (!process.env.GEMINI_API_KEY || !ai) {
       res.status(500).json({
        error: "مفتاح API الخاص بـ Gemini غير متوفر. يرجى تهيئة مفتاح GEMINI_API_KEY في لوحة Secrets.",
        isConfigError: true
      });
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
6. Capital Cost Estimation (Budget): Balanced financial breakdown of material, assembly, freight, and 10% contingency.`
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
6. الميزانية التقديرية (Budget): تحليل للتكاليف يتناسب منطقياً مع جدول المواد والأيدي العاملة والنقل ومصاريف الطوارئ.`;

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
            }
          },
          required: [
            "generalAnalysis", "suggestedModel", "blueprints", 
            "billOfMaterials", "timeline", "budget"
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
  } catch (error: any) {
    console.error("Error generating shelter plan:", error);
    res.status(500).json({ 
      error: error.message || "حدث خطأ غير متوقع أثناء معالجة البيانات وتصميم الملجأ.",
      details: error.toString()
    });
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
