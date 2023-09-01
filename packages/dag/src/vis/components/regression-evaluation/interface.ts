export enum ChartType {
  INDICATOR = 'indicator',
  DISTRIBUTION = 'distribution',
}

export interface RegressionEvaluationData {
  mean_absolute_error: number;
  mean_absolute_percentage_error: number;
  mean_squared_error: number;
  r2_score: number;
  root_mean_squared_error: number;
  sample_count: number;
  sum_squared_error: number;
  y_pred_mean: number;
  y_true_mean: number;
  residual_distribution: { bins: Bin[] };
}

export interface Bin {
  name: string;
  count: number;
}
