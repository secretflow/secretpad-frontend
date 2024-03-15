import { PlusOutlined } from '@ant-design/icons';
import { Button, message, Popconfirm, Space, Tag, Table } from 'antd';
import { parse } from 'query-string';
import React, { useEffect } from 'react';

import { formatTimestamp } from '@/modules/dag-result/utils';
import { DataManagerView } from '@/modules/data-manager/data-manager.view';
import { NodeService } from '@/modules/node';
import { ComputeModeType, computeModeText } from '@/modules/project-list';
import { getDatatable } from '@/services/secretpad/DatatableController';
import { deleteProjectDatatable } from '@/services/secretpad/ProjectController';
import { getModel, Model, useModel } from '@/util/valtio-helper';

import styles from './index.less';
import type { ProjectAuthConfigType } from './project-auth-config';
import { ProjectAuthConfigDrawer } from './project-auth-config';

interface IProps {
  tableInfo: API.DatatableVO;
  size: 'small' | 'large' | 'middle' | undefined;
}

export const DataTableAuth: React.FC<IProps> = (props: IProps) => {
  const viewInstance = useModel(DataTableAuthModel);
  const { tableInfo, size } = props;

  useEffect(() => {
    viewInstance.getTableInfo(tableInfo);
  }, [viewInstance, tableInfo]);

  const columns = [
    {
      title: '已授权项目',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      width: '30%',
      render: (text: string, record: API.AuthProjectVO) => (
        <div
          style={{
            width: 170,
          }}
        >
          <Tag>
            {computeModeText[record?.computeMode as keyof typeof computeModeText] ||
              computeModeText[ComputeModeType.MPC]}
          </Tag>
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: '授权时间',
      dataIndex: 'gmtCreate',
      key: 'gmtCreate',
      ellipsis: true,
      width: '30%',
      render: (gmtCreate: string) => (
        <div style={{ width: 80 }}>{formatTimestamp(gmtCreate as string)}</div>
      ),
    },
    {
      title: '操作',
      dataIndex: 'options',
      key: 'options',
      ellipsis: true,
      width: '30%',
      render: (text: string, record: API.AuthProjectVO) => (
        <Space>
          <Popconfirm
            placement="topLeft"
            title={`确定要取消对「${record.name}」的授权吗`}
            onConfirm={() => viewInstance.cancelAuth(record, tableInfo)}
            okText="确定"
            cancelText="取消"
          >
            <a>取消授权</a>
          </Popconfirm>
          <a onClick={() => viewInstance.openProjectAuthDrawer('EDIT', record)}>
            配置授权
          </a>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button
        className={styles.addAuthBtn}
        onClick={() => viewInstance.openProjectAuthDrawer('ADD')}
        icon={<PlusOutlined />}
      >
        添加授权项目
      </Button>
      <Table
        dataSource={viewInstance.projectAuthList}
        columns={columns}
        rowKey={(record) => record.projectId as string}
      />
      <ProjectAuthConfigDrawer
        open={viewInstance.showProjectAuthDrawer}
        onClose={() => (viewInstance.showProjectAuthDrawer = false)}
        data={viewInstance.projectAuthRecord}
        type={viewInstance.projectAuthConfigType}
        tableInfo={viewInstance.tableInfo}
        onOk={() => viewInstance.getTableInfo(viewInstance.tableInfo)}
      />
    </div>
  );
};

export class DataTableAuthModel extends Model {
  nodeService = getModel(NodeService);
  dataManagerViewService = getModel(DataManagerView);

  projectAuthRecord: API.AuthProjectVO | undefined = undefined;

  showProjectAuthDrawer = false;

  projectAuthConfigType: ProjectAuthConfigType = 'ADD';

  openProjectAuthDrawer = (type: ProjectAuthConfigType, record?: any) => {
    if (type === 'EDIT') {
      this.projectAuthRecord = record;
    }
    this.projectAuthConfigType = type;
    this.showProjectAuthDrawer = true;
  };

  projectAuthList: API.AuthProjectVO[] = [];

  tableInfo: API.DatatableVO = {};

  async getTableInfo(tableInfo: API.DatatableVO) {
    const { nodeId } = parse(window.location.search);
    const response = await getDatatable({
      datatableId: tableInfo.datatableId,
      nodeId: nodeId as string,
      type: tableInfo.type,
    });
    this.tableInfo = response.data || {};
    this.projectAuthList = [...(this.tableInfo.authProjects || [])].reverse() || [];
  }

  async cancelAuth(item: API.AuthProjectVO, tableInfo: API.DatatableVO) {
    const res = await deleteProjectDatatable({
      projectId: item.projectId,
      nodeId: this.nodeService.currentNode?.nodeId,
      datatableId: tableInfo.datatableId,
      type: tableInfo.type,
    });

    if (res.status?.code == 0) {
      message.success('取消成功');
      this.dataManagerViewService.getTableList();
    } else {
      message.error('操作失败');
    }
    await this.getTableInfo(tableInfo);
  }
}
