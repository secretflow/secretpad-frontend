import { Table } from 'antd';
import React, { useCallback, useMemo, useState } from 'react';
import { CSVLink } from 'react-csv';

import { lexicographicalOrder } from '../utils';

import type { DataField } from './interface';

interface Props {
  source: DataField[];
  columns: string[];
}

const getValue = (x: string, y: string, source: DataField[]) => {
  const valueObject = source.find(
    (s) => x === s.source_feature_name && y === s.target_feature_name,
  );
  return valueObject?.value;
};

// eslint-disable-next-line react/display-name
const FeatureTable = React.forwardRef((props: Props, csvRef: any) => {
  const { columns, source } = props;
  const [sortField, setSortField] = useState<string>();
  const [direction, setDirection] = useState('');
  const compare = useCallback(
    (next: any, pre: any) => {
      if (direction && sortField) {
        const n = next[sortField],
          p = pre[sortField];
        return direction === 'ascend' ? (n < p ? -1 : 1) : n > p ? -1 : 1;
      } else {
        return 0;
      }
    },
    [sortField, direction],
  );

  const newColumns: any[] = useMemo(() => {
    return [
      {
        title: '序号',
        dataIndex: 'index',
        width: 80,
      },
      {
        title: '特征列',
        dataIndex: 'columnnames',
        ellipsis: true,
        sorter: (a: { columnnames: string }, b: { columnnames: string }) => {
          return lexicographicalOrder(a.columnnames, b.columnnames);
        },
        showSorterTooltip: false,
      },
    ].concat(
      columns.map(
        (item) =>
          ({
            title: item,
            dataIndex: item,
            ellipsis: true,
            showSorterTooltip: false,
            width: 100,
            sorter: (a: any, b: any, direct: any) => {
              setDirection(direct);
              setSortField(item);
            },
          } as any),
      ),
    );
  }, [columns]);

  const data = useMemo(() => {
    const newData = columns
      .map((x) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const record: Record<string, any> = {
          columnnames: x,
        };
        columns.forEach((y) => {
          record[y] = getValue(x, y, source);
        });
        return record;
      })
      .sort(compare)
      .map((val, i) => ({ index: i + 1, ...val }));
    return newData;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, columns, sortField, direction]);

  return (
    <div>
      <CSVLink filename="matrix_table.csv" data={data} ref={csvRef} />
      <Table
        rowKey="index"
        pagination={false}
        columns={newColumns}
        dataSource={data}
        scroll={{ x: 1200 }}
      />
    </div>
  );
});
export default FeatureTable;
