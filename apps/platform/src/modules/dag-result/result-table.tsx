import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import { Button, Input, Space, Table, Tag } from 'antd';
import type { ColumnType } from 'antd/es/table';
import type { FilterConfirmProps } from 'antd/es/table/interface';
import { groupBy, map as lodashMap } from 'lodash';
import type { Key } from 'react';
import { useState, useRef } from 'react';
import { CSVLink } from 'react-csv';

import styles from './index.less';
import type { DataType, ResultComponentProps } from './types';
import { formatTimestamp } from './utils';

export const ResultTableComponent = (props: ResultComponentProps<'table'>) => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<InputRef>(null);
  const csvRef = useRef<{
    link: HTMLLinkElement;
  }>(null);

  const downloadData = () => {
    if (csvRef && csvRef.current) {
      csvRef.current.link.click();
    }
  };
  const { data, id } = props;

  const { gmtCreate, meta } = data;
  const { rows } = meta;

  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: string,
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex: string): ColumnType<DataType> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            搜索
          </Button>
          <Button
            onClick={() => {
              clearFilters && handleReset(clearFilters);
              handleSearch(selectedKeys as string[], confirm, dataIndex);
            }}
            size="small"
            style={{ width: 90 }}
          >
            清空
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex as keyof DataType]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) => text,
  });

  const dataSource: {
    field: string;
    fieldType: string;
    nodeId: string;
    key: string;
  }[] = [];
  const metaInfo: { path: string; nodeId: string; tableId: string }[] = [];

  rows.forEach((r) => {
    const { path, nodeId, fields, fieldTypes, tableId } = r;
    if (fields === '') {
      return;
    }
    metaInfo.push({ path, nodeId, tableId });
    const fieldList = fields.split(',');
    const fieldTypeList = fieldTypes.split(',');

    fieldList.forEach((field, index) => {
      dataSource.push({
        field,
        fieldType: fieldTypeList[index],
        nodeId,
        key: `${nodeId}-${index}`,
      });
    });
  });

  const columns = [
    {
      title: '字段',
      dataIndex: 'field',
      key: 'field',
      ...getColumnSearchProps('field'),
    },
    {
      title: '类型',
      dataIndex: 'fieldType',
      key: 'fieldType',
      filters: lodashMap(
        groupBy(dataSource, 'fieldType'),
        (g: string, key: string) => ({
          text: key,
          value: key,
        }),
      ) as unknown as { text: string; value: string }[],
      onFilter: (value: string | number | boolean, record: DataType) =>
        record.fieldType.indexOf(value as string) === 0,
      render(text: string) {
        return <span>{(text || '').toLocaleLowerCase() || ' - - '}</span>;
      },
    },
    {
      title: '节点',
      dataIndex: 'nodeId',
      key: 'nodeId',
      ellipsis: true,
      filters: lodashMap(groupBy(dataSource, 'nodeId'), (g: string, key: string) => ({
        text: key,
        value: key,
      })) as unknown as { text: string; value: string }[],
      onFilter: (value: string | number | boolean, record: DataType) =>
        record.nodeId.indexOf(value as string) === 0,
    },
  ];

  // 去除导出数据时手动加入的key
  const convertDownDataSource = (dataList: { key?: Key }[] = []) => {
    return dataList.map((item) => {
      delete item.key;
      return item;
    });
  };
  return (
    <>
      <div className={styles.report}>
        <div className={styles.item}>
          <span className={styles.name}>{id}</span>
          <Tag color="rgba(0,104,250,0.08)">表</Tag>
        </div>
        <div className={styles.item}>
          <span className={styles.timeLabel}>生成时间：</span>
          <span>{formatTimestamp(gmtCreate)}</span>
        </div>
        {metaInfo.map((row, index) => {
          const { path, nodeId, tableId } = row;

          return (
            <>
              <div className={styles.item}>
                <span className={styles.timeLabel}>{nodeId}节点路径：</span>
                <span>{path}</span>
                {/* no download for readtable */}
                {props.codeName !== 'read_data/datatable' && (
                  <Button
                    type="link"
                    size="small"
                    style={{ paddingLeft: 20 }}
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = `/node?nodeId=${nodeId}&tab=result&resultName=${tableId}`;
                      a.target = '_blank';
                      a.click();
                    }}
                  >
                    查看结果
                  </Button>
                )}
              </div>
            </>
          );
        })}
      </div>
      <div className={styles.tableHeader}>
        <div>表字段</div>
        <Button
          type="link"
          style={{ color: 'rgba(0,10,26,0.68)' }}
          size="small"
          onClick={downloadData}
        >
          <DownloadOutlined />
          导出表结构
        </Button>
      </div>
      <CSVLink
        filename={`${id}.csv`}
        data={convertDownDataSource(dataSource)}
        ref={csvRef}
      />
      <Table dataSource={dataSource} columns={columns} size="small" />
    </>
  );
};
