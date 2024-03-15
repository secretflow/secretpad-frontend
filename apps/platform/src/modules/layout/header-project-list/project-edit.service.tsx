import { Platform } from '@/components/platform-wrapper';
import { LoginService } from '@/modules/login/login.service';
import { Model, getModel } from '@/util/valtio-helper';

export class ProjectEditService extends Model {
  loginService = getModel(LoginService);

  constructor() {
    super();
    this.loginService.getUserInfo();
  }

  canEdit: CanEditType = {
    configFormDisabled: false,
    menuContextDisabled: false,
    graphHotKeyDisabled: false,
    toolbarDisabled: false,
    createPipelineDisabled: false,
    startDragDisabled: false,
    runAllToolTip: '',
    recordStoptaskDisabled: false,
    pipelineEditDisabled: false,
    submitModelDisabled: false,
  };

  changeCanEditTrue = () => {
    this.canEdit = {
      configFormDisabled: true,
      menuContextDisabled: true,
      graphHotKeyDisabled: true,
      toolbarDisabled: true,
      createPipelineDisabled: true,
      startDragDisabled: true,
      runAllToolTip: '',
      recordStoptaskDisabled: true,
      pipelineEditDisabled: true,
      submitModelDisabled: true,
    };
  };

  changeCanEditFalse = () => {
    this.canEdit = {
      configFormDisabled: false,
      menuContextDisabled: false,
      graphHotKeyDisabled: false,
      toolbarDisabled: false,
      createPipelineDisabled: false,
      startDragDisabled: false,
      runAllToolTip: '',
      recordStoptaskDisabled: false,
      pipelineEditDisabled: false,
      submitModelDisabled: false,
    };
  };

  changeCanEdit = (canEdit: Partial<CanEditType>) => {
    this.canEdit = {
      ...this.canEdit,
      ...canEdit,
    };
  };

  /**
   * @returns 判断是不是 P2P 模式。P2P 下才有这个需求
   */
  isP2pMode = () => {
    return this.loginService.userInfo?.platformType === Platform.AUTONOMY;
  };
}

type CanEditType = {
  /** 右侧面板能否编辑 */
  configFormDisabled: boolean;
  /** 算子组件右键菜单 */
  menuContextDisabled: boolean;
  /** 画布快捷键 */
  graphHotKeyDisabled: boolean;
  /** toolBar */
  toolbarDisabled: boolean;
  /** 创建训练流 */
  createPipelineDisabled: boolean;
  /** 能否拖动算子到画布 */
  startDragDisabled: boolean;
  /** 执行全部的 runAllToolTip */
  runAllToolTip: string;
  /** recordList 停止任务按钮  */
  recordStoptaskDisabled: boolean;
  /** pipeline edit */
  pipelineEditDisabled: boolean;
  /** 画布提交模型 */
  submitModelDisabled: boolean;
};
