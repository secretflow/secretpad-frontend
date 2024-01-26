import { InfoCircleOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { Checkbox, Space, Switch, Table, Tooltip } from 'antd';
import React from 'react';

export interface TableColumnVO {
  colName: string;
  colType: string;
  colComment: string;
  isGroupKey?: boolean;
  isAssociateKey?: boolean;
  isProtection?: boolean;
}

export interface ProjectTableFieldProps {
  value?: TableColumnVO[];
  onChange?: (fields: TableColumnVO[]) => void;
}

export const ProjectTableField = (props: ProjectTableFieldProps) => {
  const { onChange } = props;
  const fields = props.value || [];

  const changeField = React.useCallback(
    (colName: string, key: string, value: boolean) => {
      if (onChange) {
        const changedFields = fields.map((field) => {
          if (field.colName === colName) {
            switch (key) {
              case 'isAssociateKey':
                return {
                  ...field,
                  isAssociateKey: value,
                  isGroupKey: false,
                  isProtection: value ? value : field.isProtection,
                };
              case 'isGroupKey':
                return {
                  ...field,
                  isGroupKey: value,
                  isAssociateKey: false,
                  isProtection: value ? value : field.isProtection,
                };
              case 'isProtection':
                return {
                  ...field,
                  isProtection: value,
                  isGroupKey: false,
                  isAssociateKey: false,
                };
              default:
                return field;
            }
          } else {
            return field;
          }
        });
        onChange(changedFields);
      }
    },
    [fields, onChange],
  );

  const columns = React.useMemo(() => {
    const basicColumns: TableColumnsType<TableColumnVO> = [
      {
        title: '字段名称',
        dataIndex: 'colName',
        width: 150,
        render: (text: string) => text || '- -',
        ellipsis: true,
      },
      {
        title: '类型',
        dataIndex: 'colType',
        render: (text: string) => text || '- -',
      },
      {
        title: '描述',
        dataIndex: 'colComment',
        render: (text: string) => text || '- -',
        ellipsis: true,
      },
      {
        title: '关联键',
        dataIndex: 'isAssociateKey',
        render: (isAssociateKey: boolean, { colName }: TableColumnVO) => (
          <Checkbox
            checked={isAssociateKey}
            onChange={({ target }) =>
              changeField(colName, 'isAssociateKey', target.checked)
            }
          />
        ),
      },
      {
        title: '分组列',
        dataIndex: 'isGroupKey',
        render: (isGroupKey: boolean, { colName }: TableColumnVO) => (
          <Checkbox
            checked={isGroupKey}
            onChange={({ target }) =>
              changeField(colName, 'isGroupKey', target.checked)
            }
          />
        ),
      },
      {
        title: '保护开关',
        dataIndex: 'isProtection',
        width: 130,
        render: (isProtection: boolean, { colName }: TableColumnVO) => (
          <Space>
            <Switch
              checked={isProtection}
              checkedChildren="保护中"
              unCheckedChildren="不保护"
              onChange={(checked) => changeField(colName, 'isProtection', checked)}
            />
            {isProtection ? null : (
              <Tooltip
                placement="left"
                title="字段将不被保护，字段数据可以直接出现在SELECT的分析结果中"
              >
                <InfoCircleOutlined
                  style={{
                    color: 'red',
                  }}
                />
              </Tooltip>
            )}
          </Space>
        ),
      },
    ];

    return basicColumns;
  }, [changeField]);

  return (
    <Table
      dataSource={fields}
      rowKey={(record) => record.colName as string}
      columns={columns}
      pagination={{ showSizeChanger: false }}
    />
  );
};
