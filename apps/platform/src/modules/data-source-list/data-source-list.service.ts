import { message } from 'antd';
import { parse } from 'query-string';

import {
  create,
  deleteUsingPOST,
  detail,
} from '@/services/secretpad/DataSourceController';
import { listNode } from '@/services/secretpad/InstController';
import { Model } from '@/util/valtio-helper';

import { NodeState } from '../managed-node-list';

export class DataSourceService extends Model {
  dataSourceDetailLoading = false;

  dataSourceDetail: API.DatasourceDetailAggregateVO = {};

  nodeOptions: NodeOptions[] = [];

  /** 获取所属节点列表 */
  queryAutonomyNodeList = async () => {
    const { status, data } = await listNode();
    if (status && status.code === 0) {
      this.nodeOptions = (data || [])
        .filter((item) => item.nodeStatus === NodeState.READY)
        .map((item) => ({
          label: item.nodeName,
          value: item.nodeId,
        }));
    } else {
      this.nodeOptions = [];
      message.error(status?.msg);
    }
  };

  async addDataSource(value: API.CreateDatasourceRequest) {
    const { ownerId } = parse(window.location.search);
    const data = {
      ...value,
      nodeIds: ((value.nodeIds as unknown as { nodeId: string }[]) || []).map(
        (item) => item.nodeId,
      ),
      ownerId: ownerId as string,
    };
    const res = await create(data);
    return res;
  }

  async deleteDataSource(data: API.DeleteDatasourceRequest) {
    const res = await deleteUsingPOST(data);
    if (res?.status?.code === 0) {
      message.success('删除成功!');
    } else {
      message.error(res?.status?.msg || '删除失败');
    }
  }

  async getDataSourceDetail(data: API.DatasourceDetailRequest) {
    this.dataSourceDetailLoading = true;
    const res = await detail(data);
    if (res.data) {
      this.dataSourceDetail = res.data;
    }
    this.dataSourceDetailLoading = false;
  }
}

// 此处类型定义 用于筛选
export enum DataSourceType {
  'OSS' = 'OSS',
  'HTTP' = 'HTTP',
  'ODPS' = 'ODPS', // 未支持
  'MYSQL' = 'MYSQL',
}

export enum DataSourceStatus {
  'AVAILABLE' = 'Available',
  'UNAVAILABLE' = 'UnAvailable',
}

export const DataSourceStatusText = {
  [DataSourceStatus.AVAILABLE]: {
    text: '可用',
    color: 'success',
  },
  [DataSourceStatus.UNAVAILABLE]: {
    text: '不可用',
    color: 'error',
  },
};

export type NodeOptions = {
  label?: string;
  value?: string;
};
