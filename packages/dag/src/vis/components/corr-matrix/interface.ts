export enum CoefficientChartTypeEnum {
  matrix = 'matrix',
  axis = 'axis',
  table = 'table',
}

export interface DataField {
  source_feature_name: string;
  target_feature_name: string;
  value: number;
}

export interface ResultDataField {
  s: string;
  t: string;
  v: number;
}
