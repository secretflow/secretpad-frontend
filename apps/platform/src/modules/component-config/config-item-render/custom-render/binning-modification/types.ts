export type Bin = {
  key: string;
  label: string;
  markForMerge: boolean;
  totalCount: number;
  woe?: number;
  order?: number;
};

export type BinningData = {
  modelHash: string;
  variableBins: Record[];
};

export type Record = {
  key: string;
  partyName: string;
  feature: string;
  type: string; // 特征类型
  isWoe: boolean;
  binCount: number;
  iv?: number;
  bins: Bin[];
};

export enum TableTypeEnum {
  'WoeBinning',
  'Binning',
}

export enum CurrOperationEnum {
  'Reset',
  'Undo',
  'Merge',
  'Upload',
  'EditDefaultWoe',
  'Redo',
}

export interface SelectedRowMapItem {
  index: number[];
  value: string[];
}

export interface SelectedRowMap {
  [key: string]: SelectedRowMapItem;
}
