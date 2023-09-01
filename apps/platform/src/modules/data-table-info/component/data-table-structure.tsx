import { Table } from 'antd';

import styles from './component.less';

const columns = [
  {
    title: '字段名称',
    dataIndex: 'colName',
  },
  {
    title: '类型',
    dataIndex: 'colType',
  },
  {
    title: '描述',
    dataIndex: 'colComment',
  },
];

export function DataTableStructure(props: { schema: API.TableColumnVO[] }) {
  return (
    <Table
      columns={columns}
      dataSource={props.schema || []}
      size="small"
      className={styles.table}
      rowKey={(record) => record.colName as string}
    />
  );
}
