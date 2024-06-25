export type GroupByConfig = {
  column_queries: {
    function: AggregationFunction;
    column_name: string;
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
