import { Chart } from '@antv/g2';
import React, { useEffect, useRef } from 'react';

import type { DataField } from './interface';

export const AxisChart: React.FC<IAxisChartProps> = (props) => {
  const chartRef = useRef(null);
  const { source = [], columns = [] } = props;
  useEffect(() => {
    const baseSize = columns.length ? 320 / columns.length : 20;
    const chartRefDom = chartRef.current;
    if (chartRefDom === null) return;
    const chart = new Chart({
      height: 500,
      container: chartRefDom,
      autoFit: true,
      padding: 'auto',
    });

    chart.scale({
      source_feature_name: {
        type: 'cat',
        alias: 'x轴变量',
        values: columns,
      },
      target_feature_name: {
        type: 'cat',
        alias: 'y轴变量',
        values: columns,
      },
      value: {
        alias: '相关系数',
      },
    });
    chart
      .point()
      .position('source_feature_name*target_feature_name')
      .shape('square')
      .tooltip('source_feature_name*target_feature_name*value')
      .color('value', (val) => {
        if (val < 0) {
          return `rgba(255,0,0,${Math.abs(val)})`;
        }
        if (val === 0) {
          return '#fff';
        }
        return `rgba(0,128,0,${val})`;
      })
      .size(
        'value*source_feature_name*target_feature_name',
        (val, source_feature_name, target_feature_name) => {
          if (source_feature_name === target_feature_name) {
            return 0;
          }
          if (val < 0) {
            return Math.abs(val) * baseSize;
          }
          return val * baseSize;
        },
      );

    chart
      .axis('source_feature_name', {
        label: {
          style: {
            fontSize: 12,
            fill: '#555',
          },
          autoRotate: true,
        },
      })
      .axis('target_feature_name', {
        line: {
          style: {
            stroke: '#eee',
            lineWidth: 1,
          },
        },
        tickLine: {
          length: -10,
        },
      });

    chart.tooltip({ crosshairs: { type: 'y' } });
    chart.data(source);
    chart.render();

    const destroyChart = () => {
      if (chart) {
        chart.destroy();
      }
    };

    return destroyChart;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns]);

  return <div ref={chartRef}></div>;
};

interface IAxisChartProps {
  source: DataField[];
  columns: string[];
  height?: number;
}
