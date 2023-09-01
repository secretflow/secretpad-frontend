import { SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Input,
  Space,
  Table,
  Typography,
  ConfigProvider,
  Row,
  Col,
  Tag,
} from 'antd';
import type { InputRef } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import React, { useRef } from 'react';

import './sheet.less';
import { ReactHightLighter } from './react-hight-lighter';
import type { DataIndex, DataType, OutputSheetProps, RecordItem } from './typing';
import { AnchorType } from './typing';

const { Text } = Typography;

export const OutputSheet: React.FC<OutputSheetProps> = (props) => {
  const { outputTable, tableInfo } = props;

  const searchInput = useRef<InputRef>(null);

  const getColumnSearchProps = (dataIndex: DataIndex): ColumnType<DataType> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder="请输入"
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => confirm()}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            搜索
          </Button>
          <Button
            onClick={() => clearFilters && clearFilters()}
            size="small"
            style={{ width: 90 }}
          >
            清空
          </Button>
        </Space>
      </div>
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    onFilterDropdownOpenChange: (visible: boolean) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
  });

  const columns: ColumnsType<DataType> = [
    {
      title: '字段',
      dataIndex: 'name',
      width: '25%',
      render(text: string) {
        return <span>{text || ' - - '}</span>;
      },
      ...getColumnSearchProps('name'),
      filterIcon: (filtered: boolean) => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: '25%',
      filters: [
        { text: 'string', value: 'string' },
        { text: 'double', value: 'double' },
        { text: 'long', value: 'long' },
        { text: 'float', value: 'float' },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onFilter: (value: any, record: DataType) => record.type.indexOf(value) === 0,
      render(text: string) {
        return <span>{(text || '').toLocaleLowerCase() || ' - - '}</span>;
      },
    },
    {
      title: '节点',
      dataIndex: 'node_id',
      ellipsis: true,
      filters: tableInfo?.records?.[0]?.map((item: RecordItem) => {
        return {
          text: item.id,
          value: item.id,
        };
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onFilter: (value: any, record: DataType) => record.node_id.indexOf(value) === 0,
    },
  ];

  const findNodeId = tableInfo?.records?.[0]?.map(
    (item: { fields: string; name: string; fieldTypes: string }) => {
      if (item.fields) {
        return item?.fields?.split(',').map((ret) => {
          return {
            name: ret,
            node_id: item.name,
          };
        });
      } else {
        return [
          {
            name: '',
            node_id: item.name,
          },
        ];
      }
    },
  );

  const findType = tableInfo?.records?.[0]?.map(
    (item: { fields: string; name: string; fieldTypes: string }) => {
      if (item.fieldTypes) {
        return item?.fieldTypes?.split(',').map((ret) => {
          return {
            type: ret,
          };
        });
      }
      return;
    },
  );

  const contentData = findNodeId?.map(
    (item: { name: string; node_id: string }[], index: number) => {
      return item?.map((ret, inx: number) => {
        return {
          ...ret,
          ...findType?.[index]?.[inx],
        };
      });
    },
  );

  let dataList: DataType[] = [];
  for (const key in contentData) {
    if (Object.prototype.hasOwnProperty.call(contentData, key)) {
      dataList = dataList.concat(contentData[key] as DataType[]);
    }
  }

  return (
    <div className="dagComponentOutputTableSheet">
      <div className="contentHeader">
        <Row>
          <Col flex="1 1 100px" style={{ overflow: 'hidden' }}>
            <Text ellipsis={{ tooltip: true }} className="tableName">
              {/* TODO: 条件判断待确认 */}
              {`${
                outputTable.type !== 'model' && outputTable.type !== 'rule'
                  ? '表名：'
                  : ''
              }  ${outputTable.tableName}`}
            </Text>
          </Col>
          <Col flex="0 1 80px">
            {(outputTable.type === 'model' || outputTable.type === 'rule') && (
              <Tag>{getLabel(outputTable.type)}</Tag>
            )}
          </Col>
        </Row>
        <Row>
          <Text ellipsis>
            <span className="tableNameLable">生成时间：</span>
            <span className="tableNameValue">{tableInfo?.gmt_create}</span>
          </Text>
        </Row>
        {tableInfo?.records?.[0]?.map(
          (item: { name: string; path: string; id: string }) => {
            return (
              <div key={item.id}>
                <Row align="bottom">
                  <Col span={6}>
                    <EllipsisMiddle suffixCount={6} className="tableNameLable">
                      {`${item.name} ${getLabel(outputTable.type)}路径:`}
                    </EllipsisMiddle>
                  </Col>
                  <Col span={11}>
                    <Text ellipsis={{ tooltip: true }}>
                      <span className="tableNameValue">{item.path}</span>
                    </Text>
                  </Col>
                  <Col offset={2} span={5}>
                    <span className="tableNameLinkTo">查看并下载</span>
                  </Col>
                </Row>
              </div>
            );
          },
        )}
      </div>
      {outputTable?.type?.split(',').includes(AnchorType.datatable) ||
      outputTable?.type?.split(',').includes(AnchorType.unionTable) ? (
        <>
          <h4>表字段</h4>
          <ConfigProvider locale={zhCN}>
            <Table columns={columns} dataSource={dataList} size="small" />
          </ConfigProvider>
        </>
      ) : (
        <>
          <h4>{getLabel(outputTable.type)}详情</h4>
          <ReactHightLighter
            type="json"
            codeString={JSON.stringify(tableInfo.records, null, 2)}
          />
        </>
      )}
    </div>
  );
};

const getLabel = (type: string) => {
  {
    /* TODO: 条件判断待确认 */
  }
  if (type === 'model') {
    return '模型';
  }
  if (type === 'rule') {
    return '规则';
  }
  return '节点';
};

export const EllipsisMiddle: React.FC<{
  suffixCount: number;
  children: string;
  className?: string;
}> = ({ suffixCount, children, className }) => {
  const start = children.slice(0, children.length - suffixCount).trim();
  const suffix = children.slice(-suffixCount).trim();
  return (
    <Text
      style={{ maxWidth: '100%' }}
      ellipsis={{ suffix, tooltip: children }}
      className={className}
    >
      {start}
    </Text>
  );
};
