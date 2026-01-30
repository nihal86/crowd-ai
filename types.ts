
export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface Stats {
  people_count: number;
  risk_level: RiskLevel;
  timestamp: string;
}

export interface AnalysisReport {
  summary: string;
  recommendations: string[];
}
