import { AGENTS } from './newsPrismService';

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

export interface LiveSessionCallbacks {
  onOpen: () => void;
  onMessage: (text: string, audioData?: string, interrupted?: boolean) => void;
  onError: (error: string) => void;
  onClose: () => void;
}

export interface AIService {
  analyzeUrl(url: string): Promise<AnalysisResult>;
  connectLive(url: string, analysis: AnalysisResult, callbacks: LiveSessionCallbacks): Promise<any>;
  sendAudio(data: string): void;
  sendText(text: string): void;
  close(): void;
}
