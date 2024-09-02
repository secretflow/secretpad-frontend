import { message } from 'antd';

import { listNode } from '@/services/secretpad/InstController';
import { listResults } from '@/services/secretpad/NodeController';
import { Model } from '@/util/valtio-helper';

import type { TableType } from './result-manager.protocol';

type TableTypeMapper = {
  [key in TableType]: string;
};

export const TableTypeMap: TableTypeMapper = {
  table: '表',
  report: '报告',
  rule: '规则',
  model: '模型',
};

export enum ResultTableState {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  RUNNING = 'RUNNING',
}

export class ResultManagerService extends Model {
  list = [];
  loading = false;

  /** AUTONOMY 模式 - 机构下的所有可用节点 */
  autonomyNodeList: API.NodeVO[] = [];

  download = async (nodeId: string, tableInfo: API.NodeResultsVO) => {
    message.info('开始下载,请稍等...');
    const token = localStorage.getItem('User-Token') || '';
    fetch(`/api/v1alpha1/data/download`, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'include',
      headers: {
        'content-type': 'application/json',
        'User-Token': token,
      },

      body: JSON.stringify({
        nodeId,
        domainDataId: tableInfo.domainDataId,
      }),
    }).then((res) =>
      res.blob().then((blob) => {
        const data = new Blob(['\ufeff', blob], { type: 'text/plain;charset=utf-8' });

        const disposition = res.headers.get('Content-Disposition');
        let filename = '';
        const filenameRegex = /filename[^;=\n]*=[^'"]*['"]*((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition || '');
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
        const a = document.createElement('a');
        document.body.appendChild(a); //兼容火狐，将a标签添加到body当中
        const url = window.URL.createObjectURL(data); // 获取 blob 本地文件连接 (blob 为纯二进制对象，不能够直接保存到磁盘上)
        a.href = url;
        a.download = filename;
        a.click();
        a.remove(); //移除a标签
        window.URL.revokeObjectURL(url);
        message.success('下载完成');
      }),
    );
  };

  async getResultList(
    ownerId: string,
    pageNumber: number,
    pageSize: number,
    search: string,
    types: string[],
    sortRule: string,
    nodeNamesFilter: string[] | null,
  ) {
    const result = await listResults({
      ownerId,
      pageNumber,
      pageSize,
      nameFilter: search,
      kindFilters: types,
      timeSortingRule: sortRule,
      nodeNamesFilter,
    });
    return result.data;
  }

  async getList() {
    this.loading = true;
    // const result = await listResults({});
    // this.list = result.data;
    this.loading = false;
  }

  /** AUTONOMY 模式下获取机构下所有节点列表 */
  getAutonomyNodeList = async () => {
    const { status, data } = await listNode();
    if (status && status.code === 0) {
      this.autonomyNodeList = data || [];
    } else {
      message.error(status?.msg);
    }
  };
}
