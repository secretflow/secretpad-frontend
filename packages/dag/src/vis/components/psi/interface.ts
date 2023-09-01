export interface Bin {
  base_ratio: string;
  psi: string;
  label: string;
  test_ratio: number;
}

export interface PSIResults {
  bins: string;
  feature_name: string;
  psi: string;
}

export interface PSIData extends Omit<PSIResults, 'bins'> {
  bins: Bin;
}
