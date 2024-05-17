export type ParametersData = {
  modelHash: string;
  featureWeights: ParametersDatum[];
  bias: number;
};

export type ParametersDatum = {
  key: string;
  featureName: string;
  party: string;
  featureWeight: number;
};
