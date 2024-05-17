import { Model } from '@/util/valtio-helper';

import { ModelStatus, type ModelServiceProtocol } from './types';
import { FilterValue } from 'antd/es/table/interface';
import { ChangeEvent } from 'react';
import { parse } from 'query-string';
import { ModelServingDetail } from './model-info/model-info.view';
import API from '@/services/secretpad';
import { message } from 'antd';

export class ModelService extends Model implements ModelServiceProtocol {
  loading = false;

  submitLoading = false;

  model_stats = '';

  search = '';

  sortRule = {};

  pageNumber = 1;

  pageSize = 10;

  totalNum = 1;

  searchDebounce: number | undefined = undefined;

  modelListTimer: ReturnType<typeof setTimeout> | undefined;

  modelList: API.ModelPackVO[] = [];

  modelServingDetailList: ModelServingDetail[] = [];

  modelServingDetail: API.ServingDetailVO = {};

  projectList: API.ProjectVO[] = [];

  isProjectArchive = false;

  toggle = false;

  onViewUnMount() {
    this.search = '';
  }

  getModelList = async () => {
    const { projectId } = parse(window.location.search);
    if (!projectId) return [];
    this.loading = true;
    const info = await API.ModelManagementController.modelPackPage({
      projectId: projectId as string,
      modelStats: this.model_stats,
      searchKey: this.search,
      page: this.pageNumber,
      size: this.pageSize,
      sort: this.sortRule,
    });
    this.loading = false;
    if (info.status && info.status.code === 0 && info.data) {
      this.modelList = info.data.modelPacks || [];
      this.totalNum = info?.data?.total || 0;
      const flag = this.modelList.filter(
        (item) => item.modelStats === ModelStatus.PUBLISHING,
      );
      if (flag.length) {
        clearTimeout(this.modelListTimer);
        this.modelListTimer = setTimeout(() => {
          this.getModelList();
        }, 10000);
      } else {
        clearTimeout(this.modelListTimer);
      }
    }
    return this.modelList;
  };

  publish = async (params: API.CreateModelServingRequest) => {
    this.submitLoading = true;
    const { status } = await API.ModelManagementController.createServing(params);
    this.submitLoading = false;
    if (status && status.code === 0) {
      message.success('模型发布成功');
    } else {
      message.error(status?.msg);
    }
  };

  discard = async (modelId: string) => {
    const { status } = await API.ModelManagementController.discardModelPack({
      modelId: modelId,
    });
    if (status && status.code === 0) {
      message.success('模型废弃成功');
    } else {
      message.error(status?.msg);
    }
  };

  setOffline = async (servingId: string) => {
    const { status } = await API.ModelManagementController.deleteModelServing({
      servingId: servingId,
    });
    if (status && status.code === 0) {
      message.success('模型下线成功');
    } else {
      message.error(status?.msg);
    }
  };

  delete = async (modelId: string) => {
    const { status } = await API.ModelManagementController.deleteModelPack({
      modelId: modelId,
    });
    if (status && status.code === 0) {
      message.success('模型删除成功');
    } else {
      message.error(status?.msg);
    }
  };

  /** 模型详情 */
  getModelServiceInfo = async (servingId: string) => {
    const { data, status } = await API.ModelManagementController.modelServing({
      servingId: servingId,
    });
    if (status && status.code === 0 && data) {
      this.modelServingDetail = data;
      this.modelServingDetailList = (data?.servingDetails || []).map((item) => {
        const featureMappings = item.featureMappings || {};
        const featuresItem = Object.keys(featureMappings).map((feature) => ({
          into: feature,
          online: featureMappings[feature as keyof typeof featureMappings],
        }));
        return {
          nodeId: item.nodeId,
          nodeName: item.nodeName,
          featureHttp: item.featureHttp,
          featuresItem: featuresItem,
          endpoints: item.endpoints,
          isMock: item.isMock,
          sourcePath: item.sourcePath,
          resources: item.resources?.[0] || {},
        };
      });
    } else {
      this.modelServingDetail = {};
    }
  };

  /** 模型状态过滤 */
  modelStatusFilter = (value: string) => {
    this.model_stats = value;
    this.getModelList();
  };

  /** 模型时间排序 */
  modelTimeFilter = (
    _: Record<string, FilterValue | null>,
    sort: { order: string; field: string },
  ) => {
    if (sort?.order) {
      this.sortRule = {
        [sort.field]: sort.order === 'ascend' ? 'ASC' : 'DESC',
      };
    } else {
      this.sortRule = {};
    }
    this.getModelList();
  };

  /** 搜索模型 */
  searchModel = (e: ChangeEvent<HTMLInputElement>) => {
    this.search = e.target.value;
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.getModelList();
    }, 300) as unknown as number;
  };

  /** 获取P2P模式下所有项目 */
  getListProject = async (projectId: string, isP2p: boolean) => {
    const { data, status } = isP2p
      ? await API.P2PProjectController.listP2PProject()
      : await API.ProjectController.listProject();
    if (status?.code === 0 && data) {
      this.projectList = (data as API.ProjectVO[]) || [];
      this.isProjectArchive =
        this.projectList.find((item) => item.projectId === projectId)?.status ===
        'ARCHIVED';
    }
    return this.projectList;
  };

  setToggle = () => {
    this.toggle = !this.toggle;
  };
}
