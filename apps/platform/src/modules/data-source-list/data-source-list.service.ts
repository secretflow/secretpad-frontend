import { message } from 'antd';

import {
  create,
  deleteUsingPOST,
  detail,
} from '@/services/secretpad/DataSourceController';
import { Model } from '@/util/valtio-helper';

export class DataSourceService extends Model {
  dataSourceDetailLoading = false;

  dataSourceDetail: API.DatasourceDetailVO = {};

  async addDataSource(data: API.CreateDatasourceRequest) {
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
}
