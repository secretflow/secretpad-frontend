export type GroupByConfig = {
  columnQueries: {
    function: AggregationFunction;
    columnName: string;
  }[];
};

export enum AggregationFunction {
  SUM = 'SUM',
  MEAN = 'MEAN',
  VAR = 'VAR',
  MIN = 'MIN',
  MAX = 'MAX',
  COUNT = 'COUNT',
}
