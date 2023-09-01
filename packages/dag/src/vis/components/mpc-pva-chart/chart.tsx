import { Chart as G2Chart } from '@antv/g2';
import React, { useEffect, useRef } from 'react';

import type { ChartDataItem } from './interface';

export interface PVAChartProps {
  data: ChartDataItem[];
}

export const Chart: React.FunctionComponent<PVAChartProps> = ({ data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    let chart: G2Chart;
    const chartRefDom = chartRef.current;

    if (chartRefDom === null) return;
    if (data.length) {
      chart = new G2Chart({
        container: chartRefDom,
        autoFit: true,
        height: 500,
        padding: 'auto',
      });

      chart.scale({
        label: {
          maxTickCount: 20,
          nice: true,
          tickCount: 20,
        },
        value: {
          tickInterval: 0.1,
          nice: true,
        },
      });
      chart
        .line()
        .position('label*value')
        .size(3)
        .color('type', ['#1890FF', '#2FC25B', '#FACC14']);

      chart.tooltip({
        showCrosshairs: true, // 展示 Tooltip 辅助线
        shared: true,
      });

      chart.data(data);
      chart.render();
      setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
    }

    const destroyChart = () => {
      if (chart) {
        chart.destroy();
      }
    };

    return destroyChart;
  }, [data]);

  return <div ref={chartRef} />;
};
