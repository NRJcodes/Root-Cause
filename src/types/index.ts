export type ProblemCategory =
  | 'Production/Operations'
  | 'Financial'
  | 'Supply Chain'
  | 'Quality'
  | 'Staffing/HR'
  | 'Other';

export interface UploadedDoc {
  id: string;
  name: string;
  size: number;
  type: string;
  textContent: string;
  uploadedAt: string;
}

export interface ClarifyingQuestion {
  id: string;
  question: string;
  rationale: string;
  focusArea: 'Timing/Onset' | 'Recent Changes' | 'Data/Evidence' | 'Prior Attempts' | 'Scope/Impact';
  answer: string;
}

export type ConfidenceLevel = 'CONFIRMED' | 'LIKELY' | 'SPECULATIVE';

export type RootCauseCategory =
  | 'People'
  | 'Process'
  | 'Equipment'
  | 'Materials'
  | 'Environment'
  | 'Management';

export interface RootCauseNode {
  id: string;
  category: RootCauseCategory;
  title: string;
  description: string;
  confidence: ConfidenceLevel;
  evidence: string; // "One-line reason citing what evidence supports it, or 'no supporting data provided, inference only.'"
  missingData?: string; // what data would resolve the uncertainty
  parentId?: string | null;
  subFactors?: string[];
}

export interface RootCauseBreakdown {
  symptom: string;
  summary: string;
  nodes: RootCauseNode[];
}

export interface SolutionItem {
  id: string;
  rootCauseId: string;
  rootCauseTitle: string;
  rootCauseConfidence: ConfidenceLevel;
  solution: string;
  actionPlan: string;
  estimatedCost: 'Low' | 'Medium' | 'High' | string;
  estimatedTimeframe: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  expectedImpact: 'High' | 'Medium' | 'Low' | string;
  complexity: 'Low' | 'Medium' | 'High';
}

export interface Milestone {
  period: string;
  action: string;
  owner?: string;
}

export interface RecommendationData {
  primaryPath: string;
  rationale: string;
  disclaimer: string;
  immediateMilestones: Milestone[];
  risksToMonitor: string[];
  alternativePathsConsidered?: string[];
}

export interface IntakeData {
  category: ProblemCategory;
  description: string;
  documents: UploadedDoc[];
}

export interface KnowledgeBaseCase {
  id: string;
  category: string;
  summary: string;
  rootCauses: string;
  solutions?: string;
  rating: number;
  similarity?: number;
  createdAt: string;
  sessionId?: string;
}

export interface InvestigationSession {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  currentStage: number; // 1 to 6
  rating?: number;
  feedback?: string;
  savedToKnowledgeBase?: boolean;
  similarCases?: KnowledgeBaseCase[];
  intake: IntakeData;
  clarifying: {
    questions: ClarifyingQuestion[];
    isSubmitted: boolean;
  };
  investigation: {
    symptom: string;
    summary: string;
    nodes: RootCauseNode[];
    generatedAt?: string;
  };
  solutions: {
    items: SolutionItem[];
    generatedAt?: string;
  };
  recommendation: {
    data: RecommendationData | null;
    generatedAt?: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
}
