export interface SimParameter {
  id: string;
  label: string;
  symbol: string;
  unit: string;
  type: 'number';
  min: number;
  max: number;
  default: number;
  step: number;
  description?: string;
}

export interface SimObject {
  id: string;
  type: string; // e.g., 'battery', 'resistor', 'wire', etc.
  position?: { x: number; y: number };
  properties?: Record<string, any>;
}

export interface SimFormula {
  id: string;
  target: string; // the parameter this formula calculates
  expression: string; // e.g., "U / R"
  dependencies: string[]; // e.g., ["U", "R"]
}

export interface SimConstraint {
  id: string;
  expression: string; // e.g., "R > 0"
  errorMessage: string;
}

export interface SimChart {
  id: string;
  title: string;
  xAxis: string; // parameter id
  yAxis: string; // parameter id
  type: 'line' | 'scatter';
}

export interface SimQuestion {
  id: string;
  text: string;
  type: 'multiple_choice' | 'short_answer';
  options?: string[];
  correctAnswer: string;
}

export interface SimulationSpecification {
  id: string;
  type: string; // e.g., 'OhmsLawSimulation', 'FreeFallSimulation'
  version: string;
  title: string;
  description: string;
  subject: string;
  grade: number;
  
  parameters: SimParameter[];
  objects: SimObject[];
  formulas: SimFormula[];
  constraints: SimConstraint[];
  charts: SimChart[];
  questions: SimQuestion[];
}

export interface SimulationState {
  status: 'READY' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'ERROR';
  time: number;
  parameters: Record<string, number>;
  measurements: Record<string, number>[];
  errors: string[];
}
