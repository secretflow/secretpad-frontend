import { Chart, registerShape } from '@antv/g2';
import { Tabs } from 'antd';
import { useEffect, useRef } from 'react';

import { getTabsName } from '../../result-report';
import type { Value } from '../../result-report-types';
import { TypeMap } from '../../result-report-types';
import { OutputTable } from '../output-table';
import type { ResultOriginData } from '../typing';

import styles from './index.less';

/**
 * 通过自定义shape来将图表最小高度设为1
 * 优化图表toolTip难hover问题
 */
registerShape('interval', 'triangle', {
  getPoints(cfg) {
    const x = cfg.x as number;
    const y = cfg.y as number;
    const y0 = cfg.y0 as number;
    const width = cfg.size!;
    return [
      { x: x - width / 2, y: y0 },
      { x: x - width / 2, y: y },
      { x: x + width / 2, y: y },
      { x: x + width / 2, y: y0 },
    ];
  },
  draw(cfg, group) {
    // @ts-expect-error G2 的类型定义中缺少 parsePoints 方法
    const points = this.parsePoints(cfg.points);
    const reactHeight = points[0].y - points[1].y;
    const minHeight = 1;
    let newPoints1 = points[0].y;
    let newPoints3 = points[3].y;
    if (Math.abs(reactHeight) <= minHeight && Math.abs(reactHeight) > 0) {
      newPoints1 = points[1].y - minHeight;
      newPoints3 = points[2].y - minHeight;
    }
    const newPath = [
      ['M', points[0].x, newPoints1],
      ['L', points[1].x, points[1].y],
      ['L', points[2].x, points[2].y],
      ['L', points[3].x, newPoints3],
    ];
    const polygon = group.addShape('path', {
      attrs: {
        path: newPath,
        ...cfg.defaultStyle,
      },
    });
    return polygon;
  },
});

export const RegressionTable = (prop: { data: ResultOriginData[]; id: string }) => {
  const { data, id } = prop;
  return (
    <Tabs
      className={styles.tabsTable}
      defaultActiveKey="0"
      items={(data || []).map((item: ResultOriginData, index: number) => {
        return {
          label: getTabsName(item.name, index),
          key: `${index}`,
          children: (
            <div key={index}>
              {index === 0 ? (
                <OutputTable tableInfo={item} name={id} />
              ) : (
                <RegressionChart data={item} id={id} />
              )}
            </div>
          ),
        };
      })}
    />
  );
};

export const RegressionChart: React.FC<IDistributionChartProps> = (props: {
  data: ResultOriginData;
  id: string;
}) => {
  const { data, id } = props;
  const table = transformRegressionData(data);
  const chartRef = useRef(null);
  useEffect(() => {
    const chartRefDom = chartRef.current;
    if (chartRefDom === null) return;
    const chart = new Chart({
      height: 300,
      container: chartRefDom,
      autoFit: true,
      padding: [24, 0, 10, 50],
    });
    chart.data(table || []);

    chart.axis('name', {
      label: null,
    });

    chart.axis('count', {});

    chart.tooltip({
      crosshairs: {
        type: 'xy',
      },
    });

    chart.interval().position('name*count').shape('triangle');
    chart.render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => {
      chart.destroy();
    };
  }, [data, id]);
  return <div ref={chartRef}></div>;
};

interface IDistributionChartProps {
  data: ResultOriginData;
  id: string;
}

const transformRegressionData = (resultObj: ResultOriginData) => {
  const result = resultObj.divs[0]?.children[0];
  const arr: { [key]: string }[] = [];
  if (result?.type === 'table') {
    const headers = result.table.headers;
    const nameList = result.table.rows[0].items;
    const countList = result.table.rows[1].items;
    nameList.forEach((item, index, list) => {
      const type = headers[index].type as keyof typeof TypeMap;
      const key = TypeMap[type] as keyof Value;
      const value = item[key];
      if (index > 0) {
        const leftValue = list[index - 1][key];
        const name = `[${leftValue},${value})`;
        const countObj = countList[index - 1];
        arr.push({
          name,
          count: countObj[key],
        });
      }
    });
  }
  return arr;
};
