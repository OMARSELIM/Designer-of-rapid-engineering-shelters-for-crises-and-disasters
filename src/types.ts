export interface ProjectInput {
  disasterType: string;
  locationName: string;
  peopleCount: number;
  availableArea: number;
  soilType: string;
  climateType: string;
  localMaterials: string[];
  durationOfUse: string;
}

export interface RoomItem {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'room' | 'toilet' | 'kitchen' | 'door' | 'window' | 'bed' | 'living';
}

export interface CampFacility {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'shelter' | 'water' | 'medical' | 'latrines' | 'admin' | 'space';
}

export interface FloorPlanData {
  rooms: RoomItem[];
  dimensions: {
    w: number;
    h: number;
  };
}

export interface ElevationData {
  facadeType: string;
  wallHeight: number;
  roofHeight: number;
  roofType: 'flat' | 'sloped' | 'dome';
  materials: string[];
}

export interface CampLayoutData {
  gridRows: number;
  gridCols: number;
  spacing: number;
  facilities: CampFacility[];
}

export interface BlueprintsData {
  floorPlan: FloorPlanData;
  elevation: ElevationData;
  campLayout: CampLayoutData;
}

export interface BOMItem {
  category: string;
  material: string;
  quantity: number;
  unit: string;
  estimatedUnitPrice: number;
  totalPrice: number;
  localSourcingPossible: boolean;
  sourcingNotes: string;
}

export interface TimelineStep {
  phase: string;
  stepName: string;
  durationHours: number; // or days, let's use hours/days
  durationDays: number;
  dependencyStep?: string;
  workersRequired: number;
  instructions: string;
}

export interface BudgetBreakdown {
  materialsCost: number;
  laborCost: number;
  transportCost: number;
  contingencyCost: number;
  totalCost: number;
}

export interface ShelterProject {
  id: string;
  createdAt: string;
  input: ProjectInput;
  generalAnalysis: string;
  suggestedModel: {
    name: string;
    type: string;
    unitDimensions: {
      width: number;
      length: number;
      height: number;
    };
    roomDistribution: string[];
    totalUnitsNeeded: number;
    capacityPerUnit: number;
    floorPlanDescription: string;
    foundationType: string;
    insulationRating: string;
  };
  blueprints: BlueprintsData;
  billOfMaterials: BOMItem[];
  timeline: TimelineStep[];
  budget: BudgetBreakdown;
}
