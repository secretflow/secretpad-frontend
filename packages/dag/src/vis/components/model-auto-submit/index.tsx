import type { TableColumnsType } from 'antd';
import { Table } from 'antd';
import { each } from 'lodash';
import React from 'react';

import type { ResultOriginData } from '../typing';
import { lexicographicalOrder, modifyDataStructure } from '../utils';

import './index.less';
import { handleResultData } from './utils';

export interface ModelProps {
  data: ResultOriginData;
}

export const ModelAutoSubmit: React.FC<ModelProps> = (props) => {
  const { data: requestData } = props;
  const data = modifyDataStructure(requestData);
  const parsedData = React.useMemo(() => handleResultData(data), [data]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: TableColumnsType<any> | undefined = [];

  each(data.schema, ({ name, type }) => {
    columns.push({
      key: name,
      title: name,
      dataIndex: name,
      sorter: (a, b) => {
        // if (type === 'STRING') {
        if (type === 'AT_INT') {
          return lexicographicalOrder(a[name], b[name]);
        }
        return a[name] - b[name];
      },
      showSorterTooltip: false,
    });
  });

  return (
    <div className="dagComponentModelSubmit">
      <Table
        columns={columns}
        bordered
        size="small"
        dataSource={parsedData}
        rowKey="feature"
      />
    </div>
  );
};
