import { Table } from 'antd';

import { useModel } from '@/util/valtio-helper';

import { BinModificationsRenderView } from '..';
import styles from '../index.less';

const defaultColumns = [
  {
    title: 'feature',
    key: 'feature',
    dataIndex: 'feature',
  },
  {
    title: '所属节点',
    key: 'node',
    dataIndex: 'node',
  },
  {
    title: 'weight',
    key: 'weight',
    dataIndex: 'weight',
  },
];

export const LinearModelParametersTable = () => {
  const { parametersData } = useModel(BinModificationsRenderView);

  const columns = defaultColumns;

  return (
    <div className={styles.binningTable}>
      <Table
        bordered
        columns={columns}
        dataSource={parametersData?.variableParametersData}
      />
    </div>
  );
};
