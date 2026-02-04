export interface WorldStat {
  label: string;
  value: string;
  category: 'population' | 'government_economics' | 'society_media' | 'environment' | 'food' | 'water' | 'energy' | 'health';
}

export enum AppState {
  DASHBOARD = 'DASHBOARD',
  GENERATOR = 'GENERATOR',
  EXPLANATION = 'EXPLANATION'
}

export interface GeneratedScript {
  code: string;
  explanation: string;
  libraries: string[];
}