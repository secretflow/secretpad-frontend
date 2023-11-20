import {
  DownOutlined,
  UpOutlined,
  CheckOutlined,
  CopyOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { Button, Tabs } from 'antd';
import classnames from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import type { ResultOriginData } from '../typing';
import { execCopy, modifyDataStructure, parseData } from '../utils';

import { AxisChart } from './axis-chart';
import FeatureTable from './feature-table';
import './index.less';
import type { DataField, ResultDataField } from './interface';
import { CoefficientChartTypeEnum } from './interface';
import { MatrixChart } from './matrix-chart';

const { TabPane } = Tabs;

export const CorrMatrix: React.FC<CorrMatrixProps> = ({ data: requestData }) => {
  const data = modifyDataStructure(requestData);

  const csvRef = React.useRef<{
    link: HTMLLinkElement;
  }>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [activeKey, setActiveKey] = useState<string>(CoefficientChartTypeEnum.table);
  const [hasCopy, setHasCopy] = useState<boolean>(false);
  const [tagWrapper, setTagWrapper] = useState('tagWrapper');

  const downloadTable = () => {
    if (csvRef && csvRef.current) {
      csvRef.current.link.click();
    }
  };

  const copyFields = () => {
    setHasCopy(true);
    setTimeout(() => setHasCopy(false), 5000);
    execCopy(selected.join(','));
  };

  const renderTabBarExtraContent = () => (
    <div style={{ paddingBottom: 6 }}>
      {activeKey === 'table' && (
        <Button
          type="link"
          onClick={downloadTable}
          className="customBtn"
          size="small"
          icon={<DownloadOutlined />}
        >
          下载表格
        </Button>
      )}
      <Button
        type="link"
        onClick={copyFields}
        className="customBtn"
        size="small"
        icon={hasCopy ? <CheckOutlined /> : <CopyOutlined />}
      >
        复制已选字段
      </Button>
    </div>
  );

  const { source, fields } = React.useMemo(() => {
    const { records = [], schema } = data;
    const dataSource: DataField[] = parseData(
      { records, tableHeader: schema.map(({ name }) => name) },
      'records',
    ).reduce((ret: DataField[], { s, t, v }: ResultDataField) => {
      if (
        !ret.find(
          ({ source_feature_name, target_feature_name }) =>
            source_feature_name === s && target_feature_name === t,
        )
      ) {
        ret.push(
          {
            value: v,
            source_feature_name: s,
            target_feature_name: t,
          },
          {
            value: v,
            source_feature_name: t,
            target_feature_name: s,
          },
        );
      }

      return ret;
    }, []);

    const fieldsFeatureNames = Array.from(
      new Set(dataSource.map(({ source_feature_name }) => source_feature_name)),
    );

    return {
      fields: fieldsFeatureNames,
      source: dataSource.concat(
        dataSource.map(({ source_feature_name, target_feature_name, value }) => ({
          value,
          source_feature_name: target_feature_name,
          target_feature_name: source_feature_name,
        })),
      ),
    };
  }, [data]);

  const isSelected = useCallback(
    (key: string) => {
      if (key === '全部') {
        return fields.length === selected.length;
      } else {
        return selected.includes(key);
      }
    },
    [selected, fields],
  );

  const toggleSelect = useCallback(
    (e: any) => {
      const target = e.target;
      if (target.tagName === 'SPAN') {
        const key = target.innerText;
        setSelected((pre) => {
          if (key === '全部') {
            if (pre.length === fields.length) {
              return [];
            } else {
              return fields;
            }
          } else {
            const index = pre.findIndex((x) => x === key);
            const newSelected = pre.slice(0);
            if (index >= 0) {
              newSelected.splice(index, 1);
            } else {
              newSelected.push(key);
            }
            return newSelected;
          }
        });
      }
    },
    [fields],
  );

  useEffect(() => {
    setSelected(fields);
  }, [fields]);

  const [allTagHeight, setAllTagHeight] = React.useState(0); // 56
  const [divElemWidth, setDivElemWidth] = React.useState(0);

  useEffect(() => {
    // 根据判断alltag高度来展示展开收起，超过三行即高度超过108展示按钮
    const divElem = document.getElementById('alltag');
    if (!divElem) return;
    const resizeObserver = new ResizeObserver(() => {
      setAllTagHeight(divElem.clientHeight);
      setDivElemWidth(divElem.clientWidth);
    });
    resizeObserver.observe(divElem);
    return () => {
      resizeObserver.unobserve(divElem);
    };
  }, []);

  const renderChart = () => {
    return (
      <div className="chartBlock">
        <div className="features">
          <h5 className="title">全部特征：</h5>
          <div
            onClick={toggleSelect}
            className={classnames('tagWrapper', {
              ['hasMaxHeight']: tagWrapper === 'tagWrapper',
            })}
          >
            <div id="alltag" style={{ display: 'flex', flexWrap: 'wrap' }}>
              {['全部'].concat(fields).map((key: string) => (
                <span
                  title={key}
                  key={key}
                  className={classnames({
                    ['tag']: true,
                    ['selected']: isSelected(key),
                  })}
                >
                  {key}
                </span>
              ))}
              {tagWrapper === 'tagWrapper' && allTagHeight > 108 && (
                <span
                  className="openTag"
                  style={{
                    left: (Math.floor(divElemWidth / 56) - 1) * 56,
                  }}
                  onClick={() => setTagWrapper('showAll')}
                >
                  展开
                  <DownOutlined />
                </span>
              )}
              {tagWrapper === 'showAll' && (
                <span className="closeTag" onClick={() => setTagWrapper('tagWrapper')}>
                  收起
                  <UpOutlined />
                </span>
              )}
            </div>
          </div>
        </div>
        <Tabs
          destroyInactiveTabPane
          activeKey={activeKey}
          onChange={setActiveKey}
          tabBarExtraContent={renderTabBarExtraContent()}
        >
          <TabPane tab="表格" key={CoefficientChartTypeEnum.table}>
            <FeatureTable ref={csvRef} source={source} columns={selected} />
          </TabPane>
          <TabPane tab="色块矩阵" key={CoefficientChartTypeEnum.matrix}>
            <MatrixChart source={source} columns={selected} />
          </TabPane>
          <TabPane tab="色块坐标轴" key={CoefficientChartTypeEnum.axis}>
            <AxisChart source={source} columns={selected} />
          </TabPane>
        </Tabs>
      </div>
    );
  };

  return <div className="coefficient">{renderChart()}</div>;
};

export interface CorrMatrixProps {
  data: ResultOriginData;
}
