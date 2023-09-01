export interface DataItem {
  interval: string;
  avg_prediction: number;
  avg_label: number;
  bias: number;
}

export interface ChartDataItem {
  label: string;
  value: number;
  type: string;
}
