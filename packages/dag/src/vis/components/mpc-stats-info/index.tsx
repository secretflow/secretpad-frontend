import { BarChartOutlined, BarsOutlined } from '@ant-design/icons';
import { Menu, Radio } from 'antd';
import React, { useRef, useState } from 'react';

import type { ResultOriginData } from '../typing';
import { modifyDataStructure, safeJson } from '../utils';

import { ChartTable } from './chart-table';
import { ContinueDataTable } from './continue-data-table';
import { DiscreteDataTable } from './discrete-data-table';
import './index.less';
import { DataTypeEnum, ShowTypeEnum } from './interface';

export const MPCStatsInfo: React.FunctionComponent<MPCStatsInfoProps> = (props) => {
  const { records = [] } = modifyDataStructure(props.data);
  const tableInfo = records?.length ? safeJson(records[0][0] as string) : {};
  const { continuous_bins = [], discrete_bins = [] } = tableInfo;

  const [dataType, setDataType] = useState<DataTypeEnum>(DataTypeEnum.continue);
  const [showType, setShowType] = useState<ShowTypeEnum>(ShowTypeEnum.table);
  const tableWrapRef = useRef<HTMLDivElement>(null);

  const renderInfo = () => {
    if (showType === ShowTypeEnum.chart && dataType === DataTypeEnum.continue) {
      return <ChartTable info={continuous_bins} />;
    }
    if (showType === ShowTypeEnum.table && dataType === DataTypeEnum.continue) {
      return <ContinueDataTable info={continuous_bins} />;
    }
    if (showType !== ShowTypeEnum.data && dataType === DataTypeEnum.discrete) {
      return <DiscreteDataTable info={discrete_bins} />;
    }

    return null;
  };

  return (
    <div className="dagComponentStatsInfo">
      <div className="dagComponentStatsBlock" ref={tableWrapRef}>
        <header className="header">
          {showType !== ShowTypeEnum.data && (
            <Menu
              onClick={({ key }) => setDataType(key as DataTypeEnum)}
              selectedKeys={[dataType]}
              className="menu"
              mode="horizontal"
              items={[
                {
                  label: '连续型变量',
                  key: DataTypeEnum.continue,
                },
                {
                  label: '离散型变量',
                  key: DataTypeEnum.discrete,
                },
              ]}
            />
          )}
          <div className="right">
            <Radio.Group
              value={showType}
              onChange={({ target }) => setShowType(target.value)}
            >
              <Radio.Button
                disabled={dataType === DataTypeEnum.discrete}
                value={ShowTypeEnum.chart}
              >
                <BarChartOutlined className="icon" />
              </Radio.Button>
              <Radio.Button value={ShowTypeEnum.table}>
                <BarsOutlined className="icon" />
              </Radio.Button>
            </Radio.Group>
          </div>
        </header>
        {renderInfo()}
      </div>
    </div>
  );
};
export interface MPCStatsInfoProps {
  data: ResultOriginData;
}
