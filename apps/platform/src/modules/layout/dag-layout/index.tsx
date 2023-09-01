import { ArrowLeftOutlined } from '@ant-design/icons';
import type { TabsProps } from 'antd';
import { Divider, Tabs } from 'antd';
import classnames from 'classnames';
import { history } from 'umi';

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
  const goBack = () => {
    history.push('/home?tab=project-management');
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.back} onClick={goBack}>
          <ArrowLeftOutlined />
        </span>
        <Divider type="vertical" />
        <span className={styles.title}>进入训练流</span>
        <span className={styles.slot}>
          <ProjectListComponent />
        </span>
      </div>
      <div className={styles.content}>
        <div
          className={classnames(styles.left, {
            [styles.hide]: !viewInstance.leftPanelShow,
          })}
        >
          <div className={styles.leftTop}>
            <Tabs destroyInactiveTabPane={true} items={tabItems} />
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

  toggleLeftPanel() {
    this.leftPanelShow = !this.leftPanelShow;
  }
}
