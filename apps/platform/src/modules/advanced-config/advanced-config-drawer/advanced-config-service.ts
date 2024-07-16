import { message } from 'antd';

import { getGraphDetail, fullUpdateGraph } from '@/services/secretpad/GraphController';
import { projectGraphDomainDataSourceList } from '@/services/secretpad/ProjectController';

import { Model } from '@/util/valtio-helper';

export type DataSourceConfig = {
  editAllowed: boolean;
  nodeId: string;
  nodeName: string;
  dataSourceId: string;
};

type SelectOption = {
  label: string;
  value: string;
};
interface GlobalConfig {
  maxParallelism: number;
  dataSourceConfig: API.GraphDetailVODataSourceConfig[];
}
export class advancedConfigService extends Model {
  loading = false;

  config: GlobalConfig = {
    maxParallelism: 1,
    dataSourceConfig: [],
  };

  nodeDataSourceOptionsMap: Record<string, SelectOption[]> = {};

  queryAllNodeDataSources = async (projectId: string) => {
    this.loading = true;
    const { status, data } = await projectGraphDomainDataSourceList({
      projectId,
    });
    this.loading = false;
    if (status && status.code === 0 && data) {
      const obj: Record<string, SelectOption[]> = {};
      data.forEach((item) => {
        const dataSources = item.dataSources?.map((source) => ({
          label: source.dataSourceName,
          value: source.dataSourceId,
        }));
        if (item.nodeId) {
          obj[item.nodeId] = dataSources || [];
        }
      });
      this.nodeDataSourceOptionsMap = obj;
    }
  };

  getSetting = async (graphId: string, projectId: string) => {
    if (!graphId || !projectId) {
      this.config = {
        maxParallelism: 1,
        dataSourceConfig: [],
      };
      return;
    }
    this.loading = true;
    const { status, data } = await getGraphDetail({
      graphId,
      projectId,
    });
    this.loading = false;
    if (status && status.code === 0) {
      this.config.maxParallelism = data?.maxParallelism || 1;
      this.config.dataSourceConfig = data?.dataSourceConfig || [];
    }
  };

  setting = async (params: API.FullUpdateGraphRequest) => {
    const { status } = await fullUpdateGraph(params);
    if (status && status.code === 0) {
      message.success('配置成功');
    } else {
      message.error(status?.msg);
    }
  };
}
