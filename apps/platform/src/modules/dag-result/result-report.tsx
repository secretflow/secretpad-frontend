import { Tag, Tabs } from 'antd';

import styles from './index.less';
import type { Tab } from './result-report-types';
import type { ResultComponentProps } from './types';
import { formatTimestamp } from './utils';
import { CorrMatrix } from './vis/corr-matrix';
import { GroupPivotTable } from './vis/groupby-pivot-table';
import { PVAChart } from './vis/mpc-pva-chart';
import { OutputTable } from './vis/output-table';
import { RegressionTable } from './vis/regression-table';
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

export const ResultReportComponent = (
  props: ResultComponentProps<'report'> & { visible: boolean },
) => {
  const { data, id, codeName, visible } = props;
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
      {visible && <>{getVisTabsContent(codeName, tabs, id)}</>}
    </>
  );
};

export const getVisComponents = (
  key: string,
  data: Tab,
  id: string,
  showFullscreen?: boolean,
  tabs?: Tab[],
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
    // 'stats/groupby_statistics': <PivotTable data={data} />,
    // 全表统计
    // "stats/table_statistics": div,
  };

  if (ComponentVisMap[key]) {
    return ComponentVisMap[key];
  }

  return (
    <OutputTable
      tableInfo={data}
      name={id}
      showFullscreen={showFullscreen}
      componentName={key}
      allTableInfo={tabs}
    />
  );
};

export const getVisTabsContent = (codeName: string, tabs: Tab[], id: string) => {
  const ComponentVisMap: Record<string, any> = {
    //  分组统计
    'stats/groupby_statistics': <GroupPivotTable data={tabs} id={id} />,
    // 回归模型评估
    'ml.eval/regression_eval': <RegressionTable data={tabs} id={id} />,
  };

  if (ComponentVisMap[codeName]) {
    return ComponentVisMap[codeName];
  }

  return (
    <div id="reportTabsContent">
      <Tabs
        getPopupContainer={() =>
          document.getElementById('reportTabsContent') as HTMLDivElement
        }
        className={styles.tabsTable}
        defaultActiveKey="0"
        items={(tabs || []).map((item, index) => {
          return {
            label: getTabsName(item.name, index),
            key: `${index}`,
            children: (
              <div key={index}>
                {getVisComponents(codeName, item, id, undefined, tabs)}
              </div>
            ),
          };
        })}
      />
    </div>
  );
};
