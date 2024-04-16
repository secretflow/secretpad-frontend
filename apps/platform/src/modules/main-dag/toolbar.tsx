import {
  PlaySquareOutlined,
  LoginOutlined,
  LogoutOutlined,
  GatewayOutlined,
  CopyOutlined,
  SnippetsOutlined,
  DeleteOutlined,
  PoweroffOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import type { Cell } from '@secretflow/dag';
import { ActionType } from '@secretflow/dag';
import { Button, Divider, Popover, Tooltip, message } from 'antd';
import classnames from 'classnames';
import React from 'react';

import { ReactComponent as RunAllIcon } from '@/assets/run-all.icon.svg';
import runAllImg from '@/assets/run-all.png';
import runDownImg from '@/assets/run-down.png';
import runSingleImg from '@/assets/run-single.png';
import runUpImg from '@/assets/run-up.png';
import { getModel, Model, useModel } from '@/util/valtio-helper';

import { DefaultModalManager } from '../dag-modal-manager';
import { ProjectEditService } from '../layout/header-project-list/project-edit.service';

import mainDag from './dag';
import { GraphService } from './graph-service';
import styles from './index.less';

const EXECUTION_TOOLBAR = [
  {
    type: ActionType.runAll,
    label: '全部执行',
    title: '执行全部组件',
    desc: '执行当前训练流所有组件',
    image: runAllImg,
    icon: <RunAllIcon />,
  },
  {
    type: ActionType.runSingle,
    label: '执行单节点',
    title: '执行节点',
    desc: '执行选择的单个组件',
    image: runSingleImg,
    icon: <PlaySquareOutlined />,
  },
  {
    type: ActionType.runDown,
    label: '开始执行',
    title: '开始执行',
    desc: '追溯选择组件的下游流程，执行该组件下游的所有组件',
    image: runDownImg,
    icon: <LoginOutlined />,
  },
  {
    type: ActionType.runUp,
    label: '执行到此',
    title: '执行到此',
    desc: '追溯该组件的上游流程，执行该组件上游的所有组件',
    image: runUpImg,
    icon: <LogoutOutlined />,
  },
  {
    type: ActionType.stopAll,
    label: '停止',
    title: '停止',
    desc: '停止执行当前训练流所有组件',
    icon: <PoweroffOutlined />,
  },
];

const GRAPH_TOOLBAR = [
  {
    type: ActionType.toggleSelection,
    label: '框选',
    icon: <GatewayOutlined />,
  },
  {
    type: ActionType.copy,
    label: '复制',
    icon: <CopyOutlined />,
  },
  {
    type: ActionType.paste,
    label: '粘贴',
    icon: <SnippetsOutlined />,
  },
  {
    type: ActionType.removeCell,
    label: '删除',
    icon: <DeleteOutlined />,
  },
];

const FORMAT_TOOLBAR = [
  {
    type: ActionType.tidyLayout,
    label: '整理',
    icon: <AppstoreOutlined />,
  },
];

export const ToolbarComponent: React.FC = () => {
  const viewInstance = useModel(ToolbarView);

  // 这段代码是在切换dag的时候，判断需不需要保留上个dag的“复制“ 信息，需要则注释掉，不需要则打开
  // const { dagId } = parse(window.location.search);

  // useEffect(() => {
  //   // localStorage.removeItem('DAG_COPY_CONTENT');
  //   // viewInstance.copied = false;
  // }, [dagId]);

  return (
    <div className={`${styles.toolbar} toolbar-for-guide-tour`}>
      {EXECUTION_TOOLBAR.map((tool) => (
        <Popover
          key={tool.type}
          overlayClassName={styles.popoverContent}
          placement="topLeft"
          title={
            <div className={styles.title}>
              <div>{tool.title}</div>
              <div className={styles.titleText}>
                {viewInstance.getToolBarHotKeyText(tool.type)}
              </div>
            </div>
          }
          content={
            <div className={styles.descContent}>
              <span className={styles.text}>{tool.desc}</span>
              {tool.image && <img src={tool.image} alt="" />}
            </div>
          }
        >
          <Tooltip
            title={
              tool.type === ActionType.runAll
                ? viewInstance.projectEditService.canEdit.runAllToolTip
                : ''
            }
          >
            <Button
              type="text"
              icon={tool.icon}
              onClick={() => viewInstance.exec(tool.type)}
              disabled={!viewInstance.isToolBarEnabled(tool.type)}
              className={classnames(styles.toolBarButton, {
                [styles.runAll]: tool.type === ActionType.runAll,
                [styles.runAllDisabled]:
                  tool.type === ActionType.runAll &&
                  viewInstance.projectEditService.canEdit.toolbarDisabled,
                [styles.notRunAll]: tool.type !== ActionType.runAll,
                [styles.disabledBtn]: !viewInstance.isToolBarEnabled(tool.type),
              })}
            >
              {tool.label}
            </Button>
          </Tooltip>
        </Popover>
      ))}
      <Divider type="vertical" />
      {GRAPH_TOOLBAR.map((tool) => (
        <Tooltip
          key={tool.type}
          title={
            <div className={styles['tooltip-title']}>
              <div>{viewInstance.getToolBarHotKeyText(tool.type)}</div>
            </div>
          }
        >
          <Button
            type="text"
            icon={tool.icon}
            onClick={() => viewInstance.exec(tool.type)}
            disabled={!viewInstance.isToolBarEnabled(tool.type)}
            className={classnames({
              [styles.active]: viewInstance.isToolBarActive(tool.type),
              [styles.notRunAll]: tool.type !== ActionType.runAll,
              [styles.disabledBtn]: !viewInstance.isToolBarEnabled(tool.type),
            })}
          >
            {viewInstance.getToolBarLabel(tool.type, tool.label)}
          </Button>
        </Tooltip>
      ))}

      <Divider type="vertical" />
      {FORMAT_TOOLBAR.map((tool) => (
        <Tooltip
          key={tool.type}
          title={
            <div className={styles['tooltip-title']}>
              <div>{viewInstance.getToolBarHotKeyText(tool.type)}</div>
            </div>
          }
        >
          <Button
            type="text"
            icon={tool.icon}
            onClick={() => viewInstance.exec(tool.type)}
            disabled={!viewInstance.isToolBarEnabled(tool.type)}
            className={classnames({
              [styles.active]: viewInstance.isToolBarActive(tool.type),
              [styles.notRunAll]: tool.type !== ActionType.runAll,
            })}
          >
            {viewInstance.getToolBarLabel(tool.type, tool.label)}
          </Button>
        </Tooltip>
      ))}
    </div>
  );
};

export class ToolbarView extends Model {
  selectedNodeIds: string[] = [];

  rubberband = false;

  copied = false;

  isStopButtonActive = false;

  graphService = getModel(GraphService);

  modalManager = getModel(DefaultModalManager);

  projectEditService = getModel(ProjectEditService);

  constructor() {
    super();
    this.graphService.onNodeRunningEvent((isRunning: boolean) => {
      if (isRunning !== this.isStopButtonActive) {
        this.isStopButtonActive = isRunning;
      }
    });
  }

  isToolBarEnabled(type: ActionType) {
    //  p2p 模式判断项目和训练流不可编辑
    if (this.projectEditService.canEdit.toolbarDisabled) {
      return false;
    }
    const selectOneTypes = [ActionType.runDown, ActionType.runSingle, ActionType.runUp];
    const selectManyTypes = [ActionType.copy, ActionType.removeCell];
    if (selectOneTypes.includes(type)) {
      return this.selectedNodeIds.length === 1;
    }
    if (selectManyTypes.includes(type)) {
      return this.selectedNodeIds.length > 0;
    }
    if (type === ActionType.paste) {
      return this.copied;
    }

    if (type === ActionType.stopAll) {
      return this.isStopButtonActive;
    }
    return true;
  }

  isToolBarActive(type: ActionType) {
    return type === ActionType.toggleSelection && this.rubberband;
  }

  setIsStopButtonActive(status: boolean) {
    this.isStopButtonActive = status;
  }

  getToolBarLabel(type: ActionType, label: string) {
    if (this.isToolBarActive(type)) {
      return `取消${label}`;
    }
    return label;
  }

  getToolBarHotKeyText = (type: ActionType) => {
    const action = mainDag.graphManager.getActionInfo(type);
    if (action && action.hotKey) {
      return action.hotKey.text;
    }
  };

  exec = async (type: ActionType) => {
    this.modalManager.closeAllModals();
    switch (type) {
      case ActionType.runAll:
        await mainDag.graphManager.executeAction(type);
        setTimeout(() => {
          mainDag.graphManager.executeAction(ActionType.queryStatus);
        }, 1500);

        break;
      case ActionType.runDown:
      case ActionType.runSingle:
      case ActionType.runUp:
        await this.run(type);
        setTimeout(() => {
          mainDag.graphManager.executeAction(ActionType.queryStatus);
        }, 1500);
        break;

      case ActionType.stopAll:
        await mainDag.graphManager.executeAction(type);
        break;

      case ActionType.toggleSelection:
        this.rubberband = await mainDag.graphManager.executeAction(type);
        break;
      case ActionType.copy:
        this.copy();
        break;
      case ActionType.paste:
        this.paste();
        break;
      case ActionType.removeCell:
        this.delete();
        break;

      case ActionType.tidyLayout:
        await mainDag.graphManager.executeAction(type);
        break;
      default:
        break;
    }
  };

  delete() {
    const cells = mainDag.graphManager.getSelectedCells();
    if (cells.length > 0) {
      const nodeIds = cells.filter((cell) => cell.isNode()).map((cell) => cell.id);
      const edgeIds = cells.filter((cell) => cell.isEdge()).map((cell) => cell.id);
      mainDag.graphManager.executeAction(ActionType.removeCell, nodeIds, edgeIds);
      message.success('删除成功');
    }
  }

  copy() {
    const cells = mainDag.graphManager.getSelectedCells();
    if (cells.length > 0) {
      const nodeIds = cells.filter((cell) => cell.isNode()).map((cell) => cell.id);
      const edgeIds = cells.filter((cell) => cell.isEdge()).map((cell) => cell.id);
      mainDag.graphManager.executeAction(ActionType.copy, nodeIds, edgeIds);
      this.copied = true;
    }
  }

  paste() {
    if (this.copied) {
      mainDag.graphManager.executeAction(ActionType.paste);
    }
  }

  async run(type: ActionType) {
    const cells = mainDag.graphManager.getSelectedCells();
    const nodes = cells.filter((cell) => cell.isNode());
    if (nodes.length === 1) {
      await mainDag.graphManager.executeAction(type, [nodes[0].id]);
    }
  }

  onSelectionChanged(cells: Cell[]) {
    const nodes = cells.filter((cell) => cell.isNode());
    this.selectedNodeIds = nodes.map((node) => node.id);
  }

  onCopyActionChange(isCopied: boolean) {
    this.copied = isCopied;
  }
}

mainDag.EventHub.register(getModel(ToolbarView));
