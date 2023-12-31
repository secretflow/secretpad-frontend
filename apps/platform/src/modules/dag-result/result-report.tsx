import { Tag, Tabs } from 'antd';

import styles from './index.less';
import type { Tab } from './result-report-types';
import type { ResultComponentProps } from './types';
import { formatTimestamp } from './utils';
import { CorrMatrix } from './vis/corr-matrix';
import { PVAChart } from './vis/mpc-pva-chart';
import { OutputTable } from './vis/output-table';
import { transformCorrMatrixData } from './vis/utils';

export const getTabsName = (name: string | undefined, index: number) => {
  if (!name) return `输出表${index + 1}`;
  const reportMapZh: {
    [key: string]: string;
  } = {
    SummaryReport: '总评估表',
    eq_frequent_bin_report: '等频',
    eq_range_bin_report: '等宽',
    head_report: '头表',
  };
  return reportMapZh[name] || name;
};

export const ResultReportComponent = (props: ResultComponentProps<'report'>) => {
  const { data, id, codeName } = props;
  const { gmtCreate, tabs = [] } = data;
  return (
    <>
      <div className={styles.report}>
        <div className={styles.item}>
          <span className={styles.name}>{id}</span>
          <Tag color="rgba(0,104,250,0.08)">报告</Tag>
        </div>

        <div className={styles.time}>
          <span className={styles.timeLabel}>生成时间：</span>
          <span>{formatTimestamp(gmtCreate || '')}</span>
        </div>
      </div>
      <Tabs
        className={styles.tabsTable}
        defaultActiveKey="0"
        items={(tabs || []).map((item, index) => {
          return {
            label: getTabsName(item.name, index),
            key: `${index}`,
            children: <div key={index}>{getVisComponents(codeName, item, id)}</div>,
          };
        })}
      />
    </>
  );
};

export const getVisComponents = (
  key: string,
  data: Tab,
  id: string,
  showFullscreen?: boolean,
) => {
  const ComponentVisMap: Record<string, any> = {
    // pva
    'ml.eval/prediction_bias_eval': <PVAChart data={data} />,
    // 相关系数矩阵
    'stats/ss_pearsonr': (
      <CorrMatrix
        data={transformCorrMatrixData(data)}
        showFullscreen={showFullscreen}
      />
    ),
    // 全表统计
    // "stats/table_statistics": div,
  };

  if (ComponentVisMap[key]) {
    return ComponentVisMap[key];
  }

  return <OutputTable tableInfo={data} name={id} showFullscreen={showFullscreen} />;
};
