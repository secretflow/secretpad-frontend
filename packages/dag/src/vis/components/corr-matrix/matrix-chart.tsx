import { Chart, registerInteraction } from '@antv/g2';
import { isEqual } from 'lodash';
import React, { useEffect, useRef } from 'react';

import type { DataField } from './interface';

let clickElement = {};

export const MatrixChart: React.FC<IMatrixChartProps> = (props) => {
  const chartRef = useRef(null);
  const { source = [], columns = [] } = props;

  useEffect(() => {
    const chartRefDom = chartRef.current;
    if (chartRefDom === null) return;
    const chart = new Chart({
      height: 500,
      container: chartRefDom,
      autoFit: true,
      padding: 'auto',
    });
    chart.forceFit();
    chart.axis('source_feature_name', {
      tickLine: null,
      grid: {
        alignTick: false,
        line: {
          style: {
            lineWidth: 1,
            lineDash: null,
            stroke: '#f0f0f0',
          },
        },
      },
    });
    chart.axis('target_feature_name', {
      title: null,
      grid: {
        alignTick: false,
        line: {
          style: {
            lineWidth: 1,
            lineDash: null,
            stroke: '#f0f0f0',
          },
        },
      },
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
      .polygon()
      .position('source_feature_name*target_feature_name')
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
      .style({
        lineWidth: 1,
        stroke: '#fff',
      })
      .state({
        // 修改选中后外边框的颜色 和 element-single-selected 搭配生效
        selected: {
          style: {
            stroke: '#1890FF',
          },
        },
      });

    // 关闭 tooltip 鼠标事件
    chart.removeInteraction('tooltip');
    chart.data(source);
    chart.render();
    chart.interaction('active-border');
    const destroyChart = () => {
      if (chart) {
        chart.destroy();
      }
    };

    return destroyChart;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns]);

  registerInteraction('active-border', {
    start: [
      { trigger: 'plot:mouseenter', action: 'cursor:pointer' },
      // 添加选中效果
      { trigger: 'element:click', action: 'element-single-selected:toggle' },
      // 添加 tooltip 点击事件
      {
        trigger: 'plot:click',
        action: (context) => {
          const locked = context.view.isTooltipLocked();
          const { x, y } = context.event;
          if (locked) {
            if (isEqual(clickElement, context.event.data.data)) {
              context.view.unlockTooltip();
              context.view.hideTooltip();
            } else {
              context.view.showTooltip({ x, y });
            }
          } else {
            const { x: ex, y: ey } = context.event;
            context.view.showTooltip({ x: ex, y: ey });
            context.view.lockTooltip();
          }
          clickElement = context.event.data.data;
        },
      },
    ],
    end: [{ trigger: 'plot:mouseleave', action: 'cursor:default' }],
  });

  return <div ref={chartRef}></div>;
};

interface IMatrixChartProps {
  source: DataField[];
  columns: string[];
  height?: number;
}
