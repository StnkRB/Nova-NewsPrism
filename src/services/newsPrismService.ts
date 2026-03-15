export interface AgentPerspective {
  name: string;
  role: string;
  narrative: string;
  keyPoints: string[];
}

export interface AnalysisResult {
  perspectives: AgentPerspective[];
  convergence: string;
  divergence: string;
  polarizationScore: number;
  evaluatorSummary: string;
}

export const AGENTS = [
  {
    id: "left",
    name: "Elias Thorne",
    role: "Progressive / Far Left",
    voice: "Kore",
    color: "text-blue-700",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elias",
    personality: "Focuses on systemic inequality, social justice, and collective responsibility. Critical of corporate influence."
  },
  {
    id: "right",
    name: "Marcus Sterling",
    role: "Conservative / Far Right",
    voice: "Fenrir",
    color: "text-red-700",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
    personality: "Prioritizes individual liberty, traditional values, and national sovereignty. Skeptical of government overreach."
  },
  {
    id: "center",
    name: "Sarah Jenkins",
    role: "Moderate / Central",
    voice: "Zephyr",
    color: "text-emerald-700",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    personality: "Pragmatic and evidence-based. Seeks compromise and incremental progress. Focuses on practical outcomes."
  }
];
