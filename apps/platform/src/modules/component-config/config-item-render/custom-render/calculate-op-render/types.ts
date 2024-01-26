export enum OP {
  STANDARDIZE = 'STANDARDIZE',
  NORMALIZATION = 'NORMALIZATION',
  RANGE_LIMIT = 'RANGE_LIMIT',
  UNARY = 'UNARY',
  ROUND = 'ROUND',
  LOG_ROUND = 'LOG_ROUND',
  SQRT = 'SQRT',
  LOG = 'LOG',
  EXP = 'EXP',
  LENGTH = 'LENGTH',
  SUBSTR = 'SUBSTR',
  RECIPROCAL = 'RECIPROCAL',
}

export type OpCalculateRule = {
  op: OP;
  operands?: string | number[];
  newColNames?: string;
};
