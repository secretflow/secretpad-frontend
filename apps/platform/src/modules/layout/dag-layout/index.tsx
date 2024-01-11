import { ArrowLeftOutlined } from '@ant-design/icons';
import type { TabsProps } from 'antd';
import { Divider, Tabs } from 'antd';
import classnames from 'classnames';
import { parse } from 'query-string';
import { useEffect } from 'react';
import { history } from 'umi';

import { AccessWrapper, Platform } from '@/components/platform-wrapper';
import {
  componentConfigDrawer,
  ComponentConfigDrawer,
} from '@/modules/component-config/config-modal';
import { QuickConfigModal } from '@/modules/component-config/template-quick-config/quick-config-drawer';
import { ComponentTree } from '@/modules/component-tree/component-tree-view';
import { DAGGuideTourComponent } from '@/modules/dag-guide-tour/dag-guide-tour.view';
import { Log } from '@/modules/dag-log/log-viewer.view';
import { DagLogDrawer } from '@/modules/dag-log/log.drawer.layout';
import { DagLog } from '@/modules/dag-log/log.view';
import { DefaultModalManager } from '@/modules/dag-modal-manager';
import { ModalWidth } from '@/modules/dag-modal-manager/modal-manger-protocol';
import { ResultDrawer } from '@/modules/dag-result/result-modal';
import { DatatableTreeComponent } from '@/modules/data-table-tree/datatable-tree.view';
import { LoginService } from '@/modules/login/login.service';
import { GraphComponents } from '@/modules/main-dag/graph';
import { RecordComponent } from '@/modules/main-dag/record';
import { ToolbarComponent } from '@/modules/main-dag/toolbar';
import { ToolbuttonComponent } from '@/modules/main-dag/toolbutton';
import { PipelineCreationComponent } from '@/modules/pipeline/pipeline-creation-view';
import { PipelineViewComponent } from '@/modules/pipeline/pipeline-view';
import { RecordListDrawerItem } from '@/modules/pipeline-record-list/record-list-drawer-view';
import { getModel, Model, useModel } from '@/util/valtio-helper';

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

export const DagLayout = () => {
  const viewInstance = useModel(DagLayoutView);
  const loginService = useModel(LoginService);

  const { type = 'DAG' } = parse(window.location.search);

  const goBack = async () => {
    const userInfo = await loginService.getUserInfo();
    if (userInfo.platformType === Platform.AUTONOMY) {
      const { origin } = (history.location.state as { origin: string }) || {};
      history.push(`/edge?nodeId=${userInfo.ownerId}&tab=${origin || 'my-project'}`);
    } else {
      history.push('/home?tab=project-management');
    }
  };

  const P2pMenuList = {
    DAG: [
      {
        key: 'DAG-项目数据',
        label: '项目数据',
        callBack: () => viewInstance.setActiveKey('datatable'),
        isInit: false,
      },
      {
        key: 'DAG-模型训练',
        label: '模型训练',
        callBack: () => viewInstance.setActiveKey('pipeline'),
        isInit: true,
      },
    ],
    PSI: [],
    ALL: [],
  };

  useEffect(() => {
    viewInstance.setActiveMenu(
      P2pMenuList[type as keyof typeof P2pMenuList]?.findIndex((item) => item.isInit),
    );
  }, []);

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
        <AccessWrapper accessType={{ type: [Platform.AUTONOMY] }}>
          <div className={styles.p2pMenuHeader}>
            {P2pMenuList[type as keyof typeof P2pMenuList].map(
              (item, index: number) => {
                return (
                  <div
                    key={item.key}
                    className={classnames(styles.divMenu, {
                      [styles.active]: index === viewInstance.activeMenu,
                    })}
                    onClick={() => {
                      viewInstance.setActiveMenu(index);
                      item?.callBack && item.callBack();
                    }}
                  >
                    {item.label}
                  </div>
                );
              },
            )}
          </div>
        </AccessWrapper>
      </div>
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
              <RecordComponent />
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
      <ResultDrawer />
      <ComponentConfigDrawer />
      <QuickConfigModal />
      <DagLogDrawer>
        <DagLog>
          <Log />
        </DagLog>
      </DagLogDrawer>
      <div style={{ display: 'none' }}>
        <DAGGuideTourComponent />
      </div>
    </div>
  );
};

const RIGHT_DIST = 20;

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

  activeMenu = 0;

  setActiveKey = (key: string) => {
    this.activeKey = key;
  };

  setActiveMenu = (key: number) => {
    this.activeMenu = key;
  };

  toggleLeftPanel() {
    this.leftPanelShow = !this.leftPanelShow;
  }
}
