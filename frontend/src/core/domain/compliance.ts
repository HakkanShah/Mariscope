export interface ComparisonBaseline {
  routeId: string;
  year: number;
  ghgIntensityGco2ePerMj: number;
}

export interface ComparisonRow {
  routeId: string;
  year: number;
  ghgIntensityGco2ePerMj: number;
  percentDiff: number;
  compliant: boolean;
}

export interface ComparisonResult {
  baseline: ComparisonBaseline;
  targetIntensityGco2ePerMj: number;
  comparisons: ComparisonRow[];
}

export interface ComplianceCBRecord {
  shipId: string;
  year: number;
  cb: number;
  energyInScopeMj: number;
  targetIntensityGco2ePerMj: number;
  actualIntensityGco2ePerMj: number;
}

export interface AdjustedComplianceRecord {
  shipId: string;
  year: number;
  cbBefore: number;
  applied: number;
  adjustedCb: number;
}
