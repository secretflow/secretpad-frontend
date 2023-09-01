import { Tabs } from 'antd';
import React from 'react';

import type { ResultOriginData } from '../typing';
import { modifyDataStructure } from '../utils';

import { DistributionChart } from './distribution-chart';
import './index.less';
import { IndicatorTable } from './indicator-table';
import { ChartType } from './interface';
import { handleResultData } from './utils';

const { TabPane } = Tabs;

export interface RegressionEvaluationProps {
  data: ResultOriginData;
}

export const RegressionEvaluation: React.FC<RegressionEvaluationProps> = (props) => {
  const { data: requestData } = props;
  const data = modifyDataStructure(requestData);
  const { indicatorInfo, distributionInfo } = React.useMemo(
    () => handleResultData(data),
    [data],
  );

  return (
    <div className="dagComponentRegressionEvaluation">
      <Tabs defaultActiveKey={ChartType.INDICATOR}>
        <TabPane tab="指标数据" key={ChartType.INDICATOR}>
          <React.Fragment>
            <IndicatorTable dataSource={indicatorInfo} />
          </React.Fragment>
        </TabPane>
        <TabPane tab="残差分布图" key={ChartType.DISTRIBUTION}>
          <DistributionChart data={distributionInfo} />
        </TabPane>
      </Tabs>
    </div>
  );
};
