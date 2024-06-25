import { DownloadOutlined } from '@ant-design/icons';
import { Button, Table } from 'antd';
import { useRef } from 'react';
import { CSVLink } from 'react-csv';

import type { Tab } from '../../result-report-types';
import { modifyDataStructure } from '../utils';

import styles from './index.less';

const SAMPLE = 'data_filter/sample';

const getFullCsvDataForSample = (allTableInfo?: Tab[]) => {
  const allTableInfoList =
    allTableInfo?.map((info) => ({
      name: info.name,
      ...modifyDataStructure(info),
    })) || [];

  const csvFullData = [
    ['sample_name', 'num_before_sample', 'num_after_sample', 'sample_rate'],
  ];

  allTableInfoList.forEach((record) => {
    const num_before_sample = record?.records?.find(
      (item) => item?.name === 'num_before_sample',
    )?.value;

    const num_after_sample = record?.records?.find(
      (item) => item.name === 'num_after_sample',
    )?.value;

    const sample_rate = record?.records?.find(
      (item) => item.name === 'sample_rate',
    )?.value;

    csvFullData.push([record.name, num_before_sample, num_after_sample, sample_rate]);
  });

  return csvFullData;
};

export const DescriptionTable = (props: IProps) => {
  const { data = [], tableName = '', allTableInfo, componentName } = props;

  let fullCavData;
  if (componentName && componentName === SAMPLE) {
    fullCavData = getFullCsvDataForSample(allTableInfo);
  }

  const csvRef = useRef<{
    link: HTMLLinkElement;
  }>(null);

  const downloadData = () => {
    if (csvRef && csvRef.current) {
      csvRef.current.link.click();
    }
  };

  const columnsList = [
    {
      key: 'name',
      title: 'name',
      dataIndex: 'name',
      showSorterTooltip: false,
    },
    {
      key: 'value',
      title: 'value',
      dataIndex: 'value',
    },
  ];

  return (
    <div>
      <div className={styles.exportBtn}>
        <Button
          type="link"
          size="small"
          onClick={downloadData}
          style={{ right: 0, marginBottom: 8 }}
        >
          <DownloadOutlined />
          导出数据
        </Button>
      </div>
      <CSVLink filename={`${tableName}.csv`} data={fullCavData || data} ref={csvRef} />
      <Table
        bordered
        size="small"
        columns={columnsList}
        rowKey={(record) => record.name}
        dataSource={data}
        scroll={{ x: '100%' }}
        pagination={data.length > 100 && { pageSize: 100, showSizeChanger: false }}
      />
    </div>
  );
};

export interface IProps {
  data?: DataProps[];
  tableName?: string;
  allTableInfo?: Tab[];
  componentName?: string;
}

export interface DataProps {
  name: string;
  value: string | number;
}
