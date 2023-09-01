import { Popover, Badge, Table, Typography } from 'antd';
import React from 'react';

import styles from './datatable-preview.less';

interface DatatablePreviewInterface {
  tableInfo: API.DatatableVO;
  children: React.ReactElement;
  node: API.NodeVO;
  loading: boolean;
}

export const DatatablePreview = (props: DatatablePreviewInterface) => {
  const { Link } = Typography;
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

  const content = (
    <>
      <Table
        dataSource={props.tableInfo?.schema}
        columns={columns}
        loading={props.loading}
        rowKey={(record) => record.colName as string}
      />
      <Link
        onClick={() => {
          const a = document.createElement('a');
          a.href = `/node?nodeId=${props.node.nodeId}&tab=data-management`;
          a.target = '_blank';
          a.click();
        }}
      >
        查看全部
      </Link>
    </>
  );

  return (
    <Popover
      content={content}
      placement="rightTop"
      overlayClassName={styles.nodePopover}
      title={
        <>
          <span className={styles.title}>{props.tableInfo?.datatableName}</span>
          <Badge status="success" text="可用" />
        </>
      }
    >
      {props.children}
    </Popover>
  );
};
