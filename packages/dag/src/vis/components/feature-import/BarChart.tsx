import { Chart } from '@antv/g2';
import React, { useEffect } from 'react';

export interface BarChartProps {
  data: DataType[];
}

interface DataType {
  key: string;
  feature_name: string;
  feature_importance: number;
}

export const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const chartRef = React.useRef(null);

  useEffect(() => {
    const chartRefDom = chartRef.current;

    if (chartRefDom === null) return;

    const height = data.length * 25;

    const chart = new Chart({
      height,
      container: chartRefDom,
      autoFit: true,
    });

    chart.scale('feature_importance', {
      alias: '特征重要性',
    });

    chart.tooltip({
      shared: true,
      showMarkers: false,
      title: (_, datum) => datum['feature_name'],
    });

    chart.axis('label', {
      title: null,
      tickLine: null,
      line: null,
    });

    chart.axis('feature_importance', {
      label: null,
      grid: null,
      title: null,
    });
    chart.legend(false);
    chart.coordinate().transpose();
    chart.interval().position('label*feature_importance').color('#7d9ff3');

    chart.interaction('element-active');

    chart.data(data);

    chart.render();

    const destroyChart = () => {
      if (chart) {
        chart.destroy();
      }
    };

    return destroyChart;
  }, [data]);

  return <div ref={chartRef} />;
};
