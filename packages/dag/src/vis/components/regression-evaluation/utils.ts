import type { ResultData } from '../typing';
import { safeJson } from '../utils';

import type { RegressionEvaluationData } from './interface';

export const IndicatorMap = {
  sample_count: '总行数',
  y_true_mean: 'yMean 原始变量的均值',
  y_pred_mean: 'predictionMean 预测结果的均值',
  r2_score: 'R^2',
  mean_absolute_error: 'MAE',
  mean_absolute_percentage_error: 'MAPE',
  sum_squared_error: 'SSE',
  mean_squared_error: 'MSE',
  root_mean_squared_error: 'RMSE',
};

export const handleResultData = (data: ResultData) => {
  const tableData: RegressionEvaluationData = safeJson(data?.detail as string);
  const { residual_distribution, ...indicatorInfo } = tableData;

  return {
    indicatorInfo: Object.entries(indicatorInfo).map(([indicator, value]) => ({
      indicator,
      value,
    })),
    distributionInfo: residual_distribution,
  };
};

export const renderIndicatorText = (key: keyof typeof IndicatorMap) =>
  IndicatorMap[key];
