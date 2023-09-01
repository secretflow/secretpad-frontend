export interface DatasetSample {
  num_after_sample: number;
  num_before_sample: number;
  observation_type: string;
  quantiles: string;
  sample_rate: string;
  stratified_sample_results: StratifiedSample[];
}

export interface StratifiedSample {
  quantiles?: string;
  num_after_sample: number;
  num_before_sample: number;
  sample_weight: number;
}

export enum ObservationType {
  Continuous = '2',
}
