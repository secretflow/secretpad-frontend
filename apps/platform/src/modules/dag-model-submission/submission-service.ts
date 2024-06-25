import { parse } from 'query-string';

import { Platform } from '@/components/platform-wrapper';
import { SubmitGraphService } from '@/modules/dag-submit/graph-service';
import { LoginService } from '@/modules/login/login.service';
import API from '@/services/secretpad';
import { Model, getModel } from '@/util/valtio-helper';

export interface ModelInfo {
  modelNode: any[];
  preNodes: any[];
  predictNode: any[];
  postNodes: any[];
}

export class SubmissionDrawerService extends Model {
  loginService = getModel(LoginService);

  modelInfo: ModelInfo = {
    modelNode: [],
    preNodes: [],
    predictNode: [],
    postNodes: [],
  };

  addressNodeList: API.ModelPartyPathResponse[] = [];

  currentSubmitParams = {
    name: '',
    desc: '',
    address: [],
  };

  loading = false;

  isSubmitting = false;

  showAlert = false;

  submitGraphService = getModel(SubmitGraphService);

  submitTimer: ReturnType<typeof setTimeout> | undefined = undefined;

  constructor() {
    super();
    this.submitGraphService.onModelSubmitChanged(this.setModelInfoChanged.bind(this));
  }

  setModelInfoChanged = (modeInfoData: ModelInfo) => {
    this.modelInfo = modeInfoData;
  };

  clearAddressNodeList = () => {
    this.addressNodeList = [];
  };

  // 获取列表路径
  getModelNodesAddress = async (modelId: string) => {
    const { projectId } = parse(window.location.search);
    const graphNodeId = modelId.split('-').slice(0, 3).join('-');
    this.loading = true;
    const { status, data } = await API.ModelExportController.modelPartyPath({
      projectId: projectId as string,
      graphNodeOutPutId: modelId,
      graphNodeId: graphNodeId,
    });
    const userInfo = await this.loginService.getUserInfo();
    if (userInfo.platformType === Platform.AUTONOMY) {
      const currentId = userInfo.ownerId;
      this.showAlert = !(data || [])?.some((item) => item.nodeId === currentId);
    } else {
      this.showAlert = false;
    }
    this.loading = false;
    if (status && status.code === 0 && data) {
      this.addressNodeList = data;
    }
  };

  /** 提交模型 */
  submitModel = async (params: API.ModelExportPackageRequest) => {
    return API.ModelExportController.pack(params);
  };

  /** 查询模型提交状态 */
  checkSubmitModelStatus = (jobId: string) => {
    const { projectId } = parse(window.location.search);
    if (!projectId) return;
    return API.ModelExportController.status({
      jobId: jobId,
      projectId: projectId as string,
    });
  };

  /** 取消模型提交轮询 */
  cancelSubmitTimer = () => {
    this.isSubmitting = false;
    if (this.submitTimer) {
      clearTimeout(this.submitTimer);
      this.submitTimer = undefined;
    }
  };
}
