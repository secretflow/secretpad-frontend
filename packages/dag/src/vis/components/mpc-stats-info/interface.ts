export type Hist = number[];

export interface ContinuousField {
  field_name: string;
  field_type: string;
  is_success: boolean;
  message?: string;
  summary: {
    total_count: number;
    valid_count: number;
    null_count: number;
  };
  continuous_report?: {
    mean: number;
    max: number;
    min: number;
    q1: number;
    q2: number;
    q3: number;
    variance: number;
    standard_deviation: number;
    standard_error: number;
    hist: Hist;
  };
}

export enum DataTypeEnum {
  continue = 'continue',
  discrete = 'discrete',
}

export enum ShowTypeEnum {
  data = 'data',
  chart = 'chart',
  table = 'table',
}

export interface DiscreteField {
  field_name: string;
  field_type: string;
  is_success: boolean;
  message?: string;
  summary: {
    total_count: number;
    valid_count: number;
    null_count: number;
  };
  discrete_report?: {
    distinct: string;
  };
}
