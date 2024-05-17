import { Model } from '@/util/valtio-helper';

import API from '@/services/secretpad';
import { message } from 'antd';

interface GlobalConfig {
  maxParallelism: number;
}
export class advancedConfigService extends Model {
  loading = false;

  config: GlobalConfig = {
    maxParallelism: 1,
  };

  getSetting = async (graphId: string, projectId: string) => {
    if (!graphId || !projectId) return;
    this.loading = true;
    const { status, data } = await API.GraphController.getGraphDetail({
      graphId,
      projectId,
    });
    this.loading = false;
    if (status && status.code === 0) {
      this.config.maxParallelism = data?.maxParallelism || 1;
    }
  };

  setting = async (params: API.FullUpdateGraphRequest) => {
    const { status } = await API.GraphController.fullUpdateGraph(params);
    if (status && status.code === 0) {
      message.success('配置成功');
    } else {
      message.error(status?.msg);
    }
  };
}
