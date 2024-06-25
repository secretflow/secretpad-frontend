import { ArrowLeftOutlined } from '@ant-design/icons';
import type { TabsProps } from 'antd';
import { Divider, Tabs, Space } from 'antd';
import classnames from 'classnames';
import { parse } from 'query-string';
import { useCallback, useEffect } from 'react';
import { history } from 'umi';

import { AccessWrapper, PadMode, Platform } from '@/components/platform-wrapper';
import { AdvancedConfigComponent } from '@/modules/advanced-config/advanced-config-entry';
import BinningResultDrawer from '@/modules/component-config/config-item-render/custom-render/binning-modification/drawer';
import {
  componentConfigDrawer,
  ComponentConfigDrawer,
} from '@/modules/component-config/config-modal';
import { QuickConfigModal } from '@/modules/component-config/template-quick-config/quick-config-drawer';
import { ComponentTree } from '@/modules/component-tree/component-tree-view';
import { DAGGuideTourComponent } from '@/modules/dag-guide-tour/dag-guide-tour.view';
import { Log, LogLabel } from '@/modules/dag-log/log-viewer.view';
import { DagLogDrawer } from '@/modules/dag-log/log.drawer.layout';
import { DagLog } from '@/modules/dag-log/log.view';
import { SlsLog, SlsLogLabel } from '@/modules/dag-log/sls-log-viewer.view';
import { SlsService } from '@/modules/dag-log/sls-service';
import { DefaultModalManager } from '@/modules/dag-modal-manager';
import { ModalWidth } from '@/modules/dag-modal-manager/modal-manger-protocol';
import { ResultDrawer } from '@/modules/dag-result/result-modal';
import { DatatableTreeComponent } from '@/modules/data-table-tree/datatable-tree.view';
import { LoginService } from '@/modules/login/login.service';
import { GraphComponents } from '@/modules/main-dag/graph';
import { ModelSubmissionEntry } from '@/modules/main-dag/model-submission-entry';
import { RecordComponent } from '@/modules/main-dag/record';
import { ToolbarComponent } from '@/modules/main-dag/toolbar';
import { ToolbuttonComponent } from '@/modules/main-dag/toolbutton';
import { ModelListComponent } from '@/modules/model-manager';
import { PipelineCreationComponent } from '@/modules/pipeline/pipeline-creation-view';
import { PipelineViewComponent } from '@/modules/pipeline/pipeline-view';
import { RecordListDrawerItem } from '@/modules/pipeline-record-list/record-list-drawer-view';
import { getModel, Model, useModel } from '@/util/valtio-helper';

import ModificationResultDrawer from '../../component-config/config-item-render/custom-render/linear-model-parameters-modification/drawer/index';
import { ProjectListComponent } from '../header-project-list/project-list.view';

import styles from './index.less';

const tabItems: TabsProps['items'] = [
  {
    key: 'pipeline',
    label: '训练流',
    children: <PipelineViewComponent />,
  },
  {
    key: 'components',
    label: '组件库',
    children: <ComponentTree />,
  },
  {
    key: 'datatable',
    label: '数据集',
    children: <DatatableTreeComponent />,
  },
];

export enum DagLayoutMenu {
  PROJECTDATA = 'project-data',
  MODELTRAIN = 'model-train',
  MODELMANAGER = 'model-manager',
}

export const DagLayout = () => {
  const viewInstance = useModel(DagLayoutView);
  const loginService = useModel(LoginService);
  const slsLogService = useModel(SlsService);

  const { type = 'DAG', mode, projectId } = parse(window.location.search);
  const goBack = async () => {
    const userInfo = await loginService.getUserInfo();
    if (userInfo.platformType === Platform.AUTONOMY) {
      const { origin } = (history.location.state as { origin: string }) || {};
      history.push(`/edge?nodeId=${userInfo.ownerId}&tab=${origin || 'my-project'}`);
    } else {
      history.push('/home?tab=project-management');
      viewInstance.setInitActiveMenu('');
    }
  };

  const P2pMenuList = {
    DAG: [
      {
        key: 'DAG-项目数据',
        label: '项目数据',
        id: DagLayoutMenu.PROJECTDATA,
        callBack: () => {
          viewInstance.setDagShow();
          viewInstance.setActiveKey('datatable');
        },
        isInit: false,
        projectMode: ['MPC', 'TEE'],
      },
      {
        key: 'DAG-模型训练',
        label: '模型训练',
        id: DagLayoutMenu.MODELTRAIN,
        callBack: () => {
          viewInstance.setDagShow();
          viewInstance.setActiveKey('pipeline');
        },
        isInit: true,
        projectMode: ['MPC', 'TEE'],
      },
      {
        key: '模型管理',
        label: '模型管理',
        id: DagLayoutMenu.MODELMANAGER,
        callBack: () => {
          viewInstance.setModelManagerShow();
          viewInstance.setActiveKey('pipeline');
        },
        isInit: false,
        projectMode: ['MPC'],
      },
    ],
    PSI: [],
    ALL: [],
  };

  /**  初始化active menu */
  const setInitActiveMenu = useCallback(() => {
    const currentMenu = P2pMenuList[type as keyof typeof P2pMenuList]?.find(
      (item) => item.isInit,
    );
    viewInstance.setActiveMenu(currentMenu?.id || DagLayoutMenu.PROJECTDATA);
    currentMenu?.callBack && currentMenu.callBack();
  }, [type, mode, projectId]);

  useEffect(() => {
    const currentMenuList = P2pMenuList[type as keyof typeof P2pMenuList];
    if (viewInstance.initActiveMenu) {
      const currentMenu = currentMenuList.find(
        (item) => item.id === viewInstance.initActiveMenu,
      );
      if (currentMenu) {
        viewInstance.setActiveMenu(viewInstance.initActiveMenu);
        currentMenu?.callBack && currentMenu.callBack();
      }
    } else {
      setInitActiveMenu();
    }
  }, [viewInstance.initActiveMenu, type, mode, projectId]);

  const logItems = [
    {
      key: '1',
      label: <LogLabel />,
      children: <Log />,
      disabled: false,
    },
  ];

  if (mode === PadMode.MPC) {
    logItems.push({
      key: '2',
      label: <SlsLogLabel />,
      disabled: !slsLogService.slsLogIsConfig,
      children: <SlsLog />,
    });
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.back} onClick={goBack}>
          <ArrowLeftOutlined />
        </span>
        <Divider type="vertical" />
        <span className={styles.title}>项目空间</span>
        <span className={styles.slot}>
          <ProjectListComponent />
        </span>
        <AccessWrapper accessType={{ type: [Platform.AUTONOMY, Platform.CENTER] }}>
          <div className={styles.p2pMenuHeader}>
            {P2pMenuList[type as keyof typeof P2pMenuList]
              .filter((menu) => menu.projectMode.includes(mode as string))
              .map((item, index: number) => {
                return (
                  <div
                    key={item.key}
                    className={classnames(styles.divMenu, {
                      [styles.active]: item.id === viewInstance.activeMenu,
                    })}
                    onClick={() => {
                      viewInstance.setActiveMenu(item.id);
                      item?.callBack && item.callBack();
                    }}
                  >
                    {item.label}
                  </div>
                );
              })}
          </div>
        </AccessWrapper>
      </div>
      {/* <div className={styles.content}> */}
      {viewInstance.modelManagerShow && <ModelListComponent />}
      {/* </div> */}
      {viewInstance.dagShow && (
        <div className={styles.content}>
          <div
            className={classnames(styles.left, {
              [styles.hide]: !viewInstance.leftPanelShow,
            })}
          >
            <div className={styles.leftTop}>
              <Tabs
                destroyInactiveTabPane={true}
                items={tabItems}
                activeKey={viewInstance.activeKey}
                onChange={(key) => viewInstance.setActiveKey(key)}
              />
            </div>
            <div className={styles.leftBottom}>
              <PipelineCreationComponent />
            </div>
          </div>
          <div
            className={classnames(styles.anchor, {
              [styles.hide]: !viewInstance.leftPanelShow,
            })}
            onClick={() => viewInstance.toggleLeftPanel()}
          />

          <div
            className={classnames(styles.center, {
              [styles.hide]: !viewInstance.leftPanelShow,
            })}
          >
            <div className={styles.toolbar}>
              <ToolbarComponent />
              <div className={styles.right}>
                <Space>
                  <AdvancedConfigComponent />
                  <RecordComponent />
                  {!isTeeProject() && <ModelSubmissionEntry />}
                </Space>
              </div>
            </div>
            <div className={styles.graph}>
              <GraphComponents />
            </div>
            <div
              className={styles.toolbutton}
              style={{ right: viewInstance.rightModalSize }}
            >
              <ToolbuttonComponent />
            </div>
          </div>
        </div>
      )}
      <ResultDrawer />
      <ComponentConfigDrawer />
      <QuickConfigModal />
      <DagLogDrawer>
        <DagLog items={logItems} />
      </DagLogDrawer>
      <div style={{ display: 'none' }}>
        <DAGGuideTourComponent />
      </div>
      {/* 分箱修改 drawer 独立不与 modalManager 耦合：解决执行算子的时候不关闭 modal 问题 */}
      <BinningResultDrawer />
      <ModificationResultDrawer />
    </div>
  );
};

const RIGHT_DIST = 20;

/** 判断项目是不是TEE项目，TEE项目没有模型提交功能 */
export const isTeeProject = () => {
  const { mode } = parse(window.location.search);
  return mode === 'TEE';
};

export class DagLayoutView extends Model {
  modalManager = getModel(DefaultModalManager);
  constructor() {
    super();
    this.modalManager.onModalsChanged(() => {
      const status = this.modalManager.modals;
      if (
        status[componentConfigDrawer.id].visible &&
        status[RecordListDrawerItem.id].visible
      ) {
        return (this.rightModalSize =
          ModalWidth[componentConfigDrawer.id] +
          ModalWidth[RecordListDrawerItem.id] +
          RIGHT_DIST);
      }
      if (status[RecordListDrawerItem.id].visible) {
        return (this.rightModalSize = ModalWidth[RecordListDrawerItem.id] + RIGHT_DIST);
      }
      if (status[componentConfigDrawer.id].visible) {
        return (this.rightModalSize =
          ModalWidth[componentConfigDrawer.id] + RIGHT_DIST);
      }

      if (
        !status[componentConfigDrawer.id].visible &&
        !status[RecordListDrawerItem.id].visible
      ) {
        return (this.rightModalSize = RIGHT_DIST);
      }
    });
  }

  leftPanelShow = true;

  rightModalSize = RIGHT_DIST;

  activeKey = 'pipeline';

  activeMenu = '';

  initActiveMenu: string | null = '';

  modelManagerShow = false;
  dagShow = true;

  setActiveKey = (key: string) => {
    this.activeKey = key;
  };

  setInitActiveMenu = (id: string) => {
    this.initActiveMenu = id;
  };

  setActiveMenu = (key: string) => {
    this.activeMenu = key;
  };

  setModelManagerShow = () => {
    this.modelManagerShow = true;
    this.dagShow = false;
    this.modalManager.closeAllModals();
  };

  setDagShow = () => {
    this.modelManagerShow = false;
    this.dagShow = true;
  };

  toggleLeftPanel() {
    this.leftPanelShow = !this.leftPanelShow;
  }
}
