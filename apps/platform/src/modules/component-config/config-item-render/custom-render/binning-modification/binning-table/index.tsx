import { Table } from 'antd';

import { useModel } from '@/util/valtio-helper';

import { BinModificationsRenderView } from '..';
import ExpandedTable from '../expanded-table';
import styles from '../index.less';
import { TableTypeEnum } from '../types';

const woeColumnsType = [
  {
    title: '特征',
    dataIndex: 'feature',
    key: 'feature',
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
  },
  {
    title: 'IV',
    dataIndex: 'iv',
    key: 'iv',
    sorter: (a: any, b: any) => a.iv - b.iv,
  },
  { title: '分箱数', dataIndex: 'binCount', key: 'binCount' },
];

const defaultColumnsType = [
  {
    title: '特征',
    dataIndex: 'feature',
    key: 'feature',
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
  },
  { title: '分箱数', dataIndex: 'binCount', key: 'binCount' },
];

export const BinningTable = () => {
  const { parametersData, type } = useModel(BinModificationsRenderView);

  const columns =
    type === TableTypeEnum.WoeBinning ? woeColumnsType : defaultColumnsType;

  return (
    <div className={styles.binningTable}>
      <Table
        bordered
        columns={columns}
        expandable={{
          expandedRowRender: (record) => {
            return <ExpandedTable bins={record?.bins || []} />;
          },
        }}
        dataSource={parametersData?.variableBins}
      />
    </div>
  );
};
