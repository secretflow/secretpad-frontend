import { Descriptions, Drawer } from 'antd';
import { useEffect } from 'react';

import { PreviewGraphComponents } from '@/modules/result-details/graph';
import { FullscreenGraphModalComponent } from '@/modules/result-details/graph-fullscreen-modal';
import API from '@/services/secretpad';
import { Model, useModel } from '@/util/valtio-helper';

import { ModelStatus } from '../types';

import styles from './index.less';

type ModelDetail = {
  visible: boolean;
  close: () => void;
  data?: any;
};

export const ModelDetailModal = (props: ModelDetail) => {
  const modelDetailService = useModel(ModelDetailService);

  const { visible, data = {}, close } = props;

  useEffect(() => {
    if (!data?.modelId || !data?.projectId) return;
    visible && modelDetailService.getModelDetail(data.modelId, data.projectId);
  }, [data?.modelId, visible, data?.projectId]);

  return (
    <Drawer
      title={`「${data.modelName}」 模型详情`}
      destroyOnClose
      open={visible}
      onClose={close}
      width={680}
    >
      <div className={styles.modelDesc}>
        <Descriptions column={1}>
          <Descriptions.Item label="模型名称">{data.modelName}</Descriptions.Item>
          <Descriptions.Item label="模型ID">{data.modelId}</Descriptions.Item>
          <Descriptions.Item label="模型描述">{data.modelDesc}</Descriptions.Item>
          <>
            {(modelDetailService.modelDetail.servingDetails || []).map((item) => (
              <Descriptions.Item key={item.nodeName} label={`${item.nodeName}模型路径`}>
                {item?.sourcePath || '-'}
              </Descriptions.Item>
            ))}
          </>
        </Descriptions>
      </div>
      <div className={styles.dagBoxContent}>
        <PreviewGraphComponents
          graph={modelDetailService.modelDetail.graphDetailVO as API.GraphDetailVO}
          id={modelDetailService.taskIds}
          projectMode={data?.projectMode || 'MPC'}
          value={false}
        />
      </div>
      <FullscreenGraphModalComponent />
    </Drawer>
  );
};

export class ModelDetailService extends Model {
  modelDetail: API.ModelPackInfoVO = {};

  taskIds: string[] = [];

  async getModelDetail(id: string, projectId: string) {
    const { status, data } = await API.ModelManagementController.modelPackInfo({
      modelId: id,
      projectId: projectId,
    });
    if (status && status.code === 0 && data) {
      this.modelDetail = data;
      const taskId = (this.modelDetail.graphDetailVO?.nodes || [])
        .filter((item) =>
          (this.modelDetail?.modelGraphDetail || []).includes(item.graphNodeId!),
        )
        .map((item) => item.taskId!);
      this.taskIds = taskId;
    } else {
      this.modelDetail = {};
    }
  }
}
