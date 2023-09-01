import { Chart } from '@antv/g2';
import React, { useEffect, useRef } from 'react';

export const DistributionChart: React.FC<IDistributionChartProps> = (props) => {
  const chartRef = useRef(null);
  useEffect(() => {
    const { data } = props;
    const chartRefDom = chartRef.current;
    if (chartRefDom === null) return;
    const chart = new Chart({
      height: 300,
      container: chartRefDom,
      autoFit: true,
      padding: [24, 0, 10, 50],
    });
    chart.data(data?.bins || []);

    chart.axis('name', {
      label: null,
    });

    chart.axis('count', {});

    chart.tooltip({
      crosshairs: {
        type: 'xy',
      },
    });

    chart.interval().position('name*count');
    chart.render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <div ref={chartRef}></div>;
};
interface IDistributionChartProps {
  data?: any;
}
