export enum SourceTypeEnum {
  'Latest',
  'Upstream',
}

export type Bin = {
  key: string;
  label: string;
  markForMerge: boolean;
  totalCount: number;
  woe?: number;
  order?: number;
};

export type ParametersData = {
  modelHash: string;
  variableParametersData: {
    table: ParametersDatum[];
    bias: number;
  };
};

export type ParametersDatum = {
  feature: string;
  node: string;
  weight: number;
};

export enum CurrOperationEnum {
  'Reset',
  'Undo',
  'Upload',
  'EditBias',
  'Redo',
}
