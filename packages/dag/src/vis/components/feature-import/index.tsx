import { DownloadOutlined } from '@ant-design/icons';
import { Button, Table, Tabs, ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';
import { CSVLink } from 'react-csv';

import type { ResultData, ResultOriginData } from '../typing';
import { lexicographicalOrder, modifyDataStructure } from '../utils';
import { parseData } from '../utils';

import { BarChart } from './BarChart';
import './index.less';

interface DataType {
  key: string;
  feature_name: string;
  feature_importance: number;
}

interface FeatureImportType {
  data: ResultOriginData;
}

const handleResultData = (data: ResultData) => {
  const { records = [], schema } = data || {};
  return parseData(
    { records, tableHeader: schema.map(({ name }) => name) },
    'records',
  ).map((item: any) => {
    return {
      feature_name: item.feature_name,
      label:
        item.feature_name.length > 8
          ? `${item.feature_name.slice(0, 4)}...${item.feature_name.slice(
              9,
              item.feature_name.length,
            )}`
          : item.feature_name,
      feature_importance: item.importance,
    };
  });
};

export const FeatureImport: React.FC<FeatureImportType> = (props) => {
  const { data: requestData } = props;
  const resultData = modifyDataStructure(requestData);
  const startDataSource = React.useMemo(
    () => handleResultData(resultData),
    [resultData],
  );

  const [dataSource, setDatasource] = React.useState(startDataSource);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tableChange = (
    _pagination: any,
    _filters: any,
    sorter: any,
    extra: { currentDataSource: DataType[] },
  ) => {
    if (!sorter.order) {
      setDatasource(startDataSource);
    } else {
      setDatasource(extra.currentDataSource);
    }
  };

  const csvRef = React.useRef<{
    link: HTMLLinkElement;
  }>(null);

  const [tabKey, setTabKey] = React.useState('1');
  const { TabPane } = Tabs;

  const handleExportData = () => {
    if (csvRef && csvRef.current) {
      csvRef.current.link.click();
    }
  };

  const newData = (dataSource || [])?.map(
    (item: { feature_name: string; feature_importance: string }) => [
      item.feature_name,
      item.feature_importance,
    ],
  );

  const downData = [['特征', '特征重要性'], ...newData];

  const columns: ColumnsType<DataType> = [
    {
      title: '特征',
      dataIndex: 'feature_name',
      key: 'feature_name',
      width: '35%',
      sorter: (a, b) => {
        return lexicographicalOrder(a.feature_name, b.feature_name);
      },
    },
    {
      title: '特征重要性',
      dataIndex: 'feature_importance',
      key: 'feature_importance',
      sorter: (a, b) => a.feature_importance - b.feature_importance,
    },
  ];

  const reverseDataSource = (array: DataType[]) => {
    const newDataSource = [];
    for (let i = array.length - 1; i >= 0; i--) {
      newDataSource[newDataSource.length] = array[i];
    }
    return newDataSource;
  };

  return (
    <div className="dagComponentFeatureImport">
      <div className="header">
        <div>
          <span>更新时间：</span>
          <span>{(resultData as ResultData)?.gmt_modified || '-'}</span>
        </div>
      </div>
      <CSVLink filename="特征重要性.csv" data={downData} ref={csvRef} />
      <Tabs
        destroyInactiveTabPane
        defaultActiveKey={tabKey}
        onChange={(key: string) => setTabKey(key)}
        tabBarExtraContent={
          <Button type="text" icon={<DownloadOutlined />} onClick={handleExportData}>
            下载结果
          </Button>
        }
      >
        <TabPane tab="表格" key={'1'} forceRender={true}>
          <ConfigProvider locale={zhCN}>
            <Table columns={columns} dataSource={dataSource} onChange={tableChange} />
          </ConfigProvider>
        </TabPane>
        <TabPane tab="条形图" key={'2'} forceRender={false}>
          <div>
            <BarChart data={reverseDataSource(dataSource)} />
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};
