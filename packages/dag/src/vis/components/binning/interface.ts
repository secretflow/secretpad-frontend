export interface BinType {
  label: string;
  positive_count: string;
  total_count: string;
  iv: number;
  total?: number;
  woe: number;
  positive_rate: string;
  total_rate: string;
}

export interface FeatureBinInfo {
  bin_count: number;
  feature_x_field_name: string;
  iv: number;
  bins: BinType[];
  feature_name?: string;
}

export interface ResultBinInfo extends Omit<FeatureBinInfo, 'bins'> {
  bins: string;
}
