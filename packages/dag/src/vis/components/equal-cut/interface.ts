export interface BinType {
  label: string;
  positive_count: string;
  total_count: string;
  iv: number;
  total: number;
  woe?: number;
}

export interface FeatureEqualCutInfo {
  bin_count: number;
  feature: string;
  type: string;
  bins: BinType[];
}

export interface ResultEqualCutInfo extends Omit<FeatureEqualCutInfo, 'bins'> {
  bins: string;
}
