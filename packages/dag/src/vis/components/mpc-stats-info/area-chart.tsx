import { Chart } from '@antv/g2';
import React, { useEffect, useRef } from 'react';

import type { Hist } from './interface';

export const AreaChart: React.FunctionComponent<IAreaChartProps> = (props) => {
  let chart: Chart;
  const chartRef = useRef(null);
  const { height, data, className } = props;

  const initChart = () => {
    if (!chartRef.current) return;
    chart = new Chart({
      height,
      container: chartRef.current || '',
      autoFit: true,
      padding: [0, 24, 0, 24],
    });

    const chartData = data.map((value, i) => ({
      x: i,
      y: value,
    }));

    chart.scale('x', { ticks: [0, chartData.length - 1] });
    chart.tooltip(false);
    chart.axis(false);
    chart.area().position('x*y');
    chart.line().position('x*y');
    chart.data(chartData);
    chart.render();
  };

  const destroyChart = () => {
    if (chart) {
      chart.destroy();
    }
  };

  useEffect(() => {
    initChart();

    return destroyChart;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div className={className} ref={chartRef} />;
};

interface IAreaChartProps {
  height: number;
  data: Hist;
  className: string;
}
