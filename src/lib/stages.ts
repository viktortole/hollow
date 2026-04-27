export interface FastingStage {
  id: string;
  name: string;
  description: string;
  hoursMin: number;
  hoursMax: number;
  color: string;
  glowColor: string;
  xpMultiplier: number;
}

export const STAGES: FastingStage[] = [
  // Earthy-but-punchy palette. Each stage stays inside an "editorial" register
  // (no neon, no AI-purple) but with enough saturation to read clearly on
  // BOTH cream-paper light mode AND warm-graphite dark mode. Earlier
  // iterations went too desaturated and looked bleached on dark.
  {
    id: "fed",
    name: "Fed",
    description: "Digesting",
    hoursMin: 0,
    hoursMax: 4,
    color: "#88b27e",          // sage — bumped saturation
    glowColor: "#88b27e80",
    xpMultiplier: 1,
  },
  {
    id: "early",
    name: "Early Fast",
    description: "Glycogen depleting",
    hoursMin: 4,
    hoursMax: 12,
    color: "#5a9fd0",          // steel blue — more saturated, holds up on dark
    glowColor: "#5a9fd080",
    xpMultiplier: 1.2,
  },
  {
    id: "fat_burning",
    name: "Fat Burning",
    description: "Ketosis kicking in",
    hoursMin: 12,
    hoursMax: 16,
    color: "#e8825d",          // ember — slightly warmer/brighter
    glowColor: "#e8825d80",
    xpMultiplier: 1.5,
  },
  {
    id: "autophagy",
    name: "Autophagy",
    description: "Cellular cleanup",
    hoursMin: 16,
    hoursMax: 24,
    color: "#3da7a7",          // teal — pulled out of the murky range
    glowColor: "#3da7a780",
    xpMultiplier: 2,
  },
  {
    id: "deep_ketosis",
    name: "Deep Ketosis",
    description: "Hormone surge",
    hoursMin: 24,
    hoursMax: 48,
    color: "#c84d6e",          // rose — sharper crimson, reads "potent"
    glowColor: "#c84d6e80",
    xpMultiplier: 2.5,
  },
  {
    id: "stem_cell",
    name: "Stem Cell",
    description: "Mythic territory",
    hoursMin: 48,
    hoursMax: Infinity,
    color: "#e6bf52",          // gold — richer, less antique
    glowColor: "#e6bf5280",
    xpMultiplier: 3,
  },
];

export function getStageForHours(hours: number): FastingStage {
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (hours >= STAGES[i].hoursMin) {
      return STAGES[i];
    }
  }
  return STAGES[0];
}

export function getStageIndex(hours: number): number {
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (hours >= STAGES[i].hoursMin) {
      return i;
    }
  }
  return 0;
}

export function formatElapsed(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatHoursMinutes(totalSeconds: number): { hours: number; minutes: number } {
  const totalMinutes = Math.floor(totalSeconds / 60);
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  };
}

export interface Protocol {
  id: string;
  name: string;
  hours: number;
  description: string;
}

export const PROTOCOLS: Protocol[] = [
  { id: "16_8", name: "16:8", hours: 16, description: "16h fast, 8h eating window" },
  { id: "18_6", name: "18:6", hours: 18, description: "18h fast, 6h eating window" },
  { id: "20_4", name: "20:4 (Warrior)", hours: 20, description: "20h fast, 4h eating window" },
  { id: "omad", name: "OMAD (23:1)", hours: 23, description: "One meal a day" },
  { id: "24h", name: "24h", hours: 24, description: "Full day fast" },
  { id: "36h", name: "36h", hours: 36, description: "Extended fast" },
  { id: "48h", name: "48h", hours: 48, description: "Two day fast" },
  { id: "custom", name: "Custom", hours: 0, description: "Set your own duration" },
];
