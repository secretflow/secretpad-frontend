import { Table } from 'antd';

import style from './index.less';

const columns = [
  {
    title: '已选择字段',
    dataIndex: 'field',
  },
];

export const FieldMiniTable = (props: IProps) => {
  const { selectedFields } = props;

  return (
    <Table
      size="small"
      pagination={false}
      columns={columns}
      scroll={{ y: 120 }}
      dataSource={selectedFields.map((field) => ({ field }))}
      className={style.filedMiniTable}
      rowKey="field"
    />
  );
};

export interface IProps {
  selectedFields: string[];
}
