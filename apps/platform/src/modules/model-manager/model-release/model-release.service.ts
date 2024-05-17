import API from '@/services/secretpad';
import { Model } from '@/util/valtio-helper';
import { parse } from 'query-string';
import { ModelStatus } from '../types';

export class ModelReleaseService extends Model {
  loading = false;

  toggle = false;

  // 预测节点
  // 根据模型获取节点
  predictionNodes: Array<API.ModelPackDetailVOParties> = [];

  // 入模特征
  // 根据节点获取入模特征
  intoFeatures: Record<string, string[]> = {};

  // 特征服务表
  // 根据节点获取特征服务表
  featureServicesSheets: { label: string; value: string }[][] = [];

  // 在线特征 key: node-sheetId
  // 根据特征服务表获取在线特征
  onlineFeatures: Record<string, string[]> = {};

  // 获取预测节点列表
  modelList: API.ModelPackVO[] = [];

  getCanSubmitModelList = async () => {
    const { projectId } = parse(window.location.search);
    if (!projectId) return [];
    const info = await API.ModelManagementController.modelPackPage({
      projectId: projectId as string,
      page: 1,
      size: 1000,
    });
    if (info.status && info.status.code === 0 && info.data) {
      const canSubmitModelStatus = [
        ModelStatus.PENDING,
        ModelStatus.OFFLINE,
        ModelStatus.FAILED,
      ];
      this.modelList =
        info.data.modelPacks?.filter((item) =>
          canSubmitModelStatus.includes(item.modelStats as ModelStatus),
        ) || [];
    }
  };

  getPredictionNodes = async (modelId: string) => {
    const { projectId } = parse(window.location.search);
    if (!projectId) return [];
    this.loading = true;
    const { status, data } = await API.ModelManagementController.modelPackDetail({
      modelId,
      projectId: projectId as string,
    });
    this.loading = false;
    if (status && status.code === 0 && data) {
      this.predictionNodes = data?.parties || [];
      (data?.parties || []).forEach((item) => {
        if (!item.nodeId) return;
        this.intoFeatures[item.nodeId] = item?.columns || [];
      });
    } else {
      this.predictionNodes = [];
    }
  };

  getFeatureServices = async (nodeId: string, key: number) => {
    const { projectId } = parse(window.location.search);
    if (!projectId) return [];
    const { status, data } =
      await API.FeatureDatasourceController.projectFeatureTableList({
        nodeId: nodeId,
        projectId: projectId as string,
      });
    if (status && status.code === 0 && data) {
      /** 设置特征服务 */
      this.featureServicesSheets[key] = data.map((item) => ({
        label: item.featureTableName!,
        value: item.featureTableId!,
      })) as { label: string; value: string }[];

      /** 设置节点的特征服务下面的在线特征  */
      data.forEach((item) => {
        const id = `${nodeId}_${item.featureTableId}`;
        const newColumns = (item?.columns || []).map((feature) => feature.colName!);
        this.onlineFeatures[id] = newColumns;
      });
    }
  };

  setToggle = () => {
    this.toggle = !this.toggle;
  };

  changeToggle = (value: boolean) => {
    this.toggle = value;
  };
}
