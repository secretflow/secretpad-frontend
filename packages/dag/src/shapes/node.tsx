import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  CopyOutlined,
  DeleteOutlined,
  LogoutOutlined,
  LoginOutlined,
  PlayCircleOutlined,
  StopOutlined,
  PoweroffOutlined,
} from '@ant-design/icons';
import type { Graph, Node } from '@antv/x6';
import { Dropdown, Menu } from '@antv/x6-react-components';
import { register } from '@antv/x6-react-shape';
import { Popover } from 'antd';
import '@antv/x6-react-components/es/dropdown/style/index.css';
import '@antv/x6-react-components/es/menu/style/index.css';
import classnames from 'classnames';
import React from 'react';

import { DAGGlobalContainer } from '..';
import { ActionType, HotKeys } from '../actions';
import { NodeStatus } from '../types';
import type { GraphNode } from '../types';

import { Description } from './descriptions';
import './index.less';
import { ComponentIcons } from './node-icon';
import type { DAGProtocol } from '../protocol';

const { Item: MenuItem, Divider } = Menu;
export const ShowMenuContext = React.createContext(true);

const DagNode = (props: { node: Node; graph: Graph }) => {
  const { node, graph } = props;
  const DAGContext = DAGGlobalContainer.get(graph) as DAGProtocol;
  const graphManager = DAGContext?.graphManager;
  const data = node.getData<GraphNode>();
  const { id, status, label, codeName, styles } = data;
  const statusName = NodeStatus[status];
  const [domain] = codeName.split('/');
  const {
    isOpaque = false,
    isHighlighted = false,
    isContinueRun = false,
  } = styles || {};
  const showMenu = React.useContext(ShowMenuContext);

  const getStatusFlag = () => {
    switch (status) {
      case NodeStatus.success:
        return <CheckCircleOutlined style={{ color: 'rgba(35,182,95,1)' }} />;
      case NodeStatus.failed:
        return <CloseCircleOutlined style={{ color: 'rgba(252,117,116,1)' }} />;
      case NodeStatus.stopped:
        return <PoweroffOutlined style={{ color: 'rgba(252,117,116,1)' }} />;
      case NodeStatus.running:
        return <SyncOutlined style={{ color: '#1890FF' }} spin />;
      case NodeStatus.pending:
        return null;
      default:
        return null;
    }
  };

  const onMenuItemClick = (key: ActionType) => {
    const argsIsArrayKey = [ActionType.removeCell, ActionType.copy];
    const argsIsRun = [ActionType.runDown, ActionType.runUp, ActionType.runSingle];
    const argsIsContinue = [ActionType.continueRun];
    if (argsIsArrayKey.includes(key)) {
      graphManager.executeAction(key, [id]);
    } else if (argsIsRun.includes(key)) {
      graphManager.executeAction(key, [id]);
      setTimeout(() => {
        graphManager.executeAction(ActionType.queryStatus, []);
      }, 1500);
    } else if (argsIsContinue.includes(key)) {
      graphManager.executeAction(key, id);
      setTimeout(() => {
        graphManager.executeAction(ActionType.queryStatus, []);
      }, 1500);
    } else {
      graphManager.executeAction(key, id);
    }
  };

  /**
   * Popover content 以及 getMenuItems 是否展示继续执行按钮
   * 目前只支持 (SecureBoost训练 SSGLM训练 SS-XGB训练) 算子才可 继续执行, 即 isContinueRun = true
   * */
  const showContinueRun =
    showMenu &&
    (data.status === NodeStatus.stopped || data.status === NodeStatus.failed) &&
    isContinueRun;

  const getMenuItems = () => {
    const menu = (
      <Menu
        hasIcon={true}
        onClick={(key: string) => onMenuItemClick(key as ActionType)}
      >
        <MenuItem
          name={ActionType.copy}
          icon={<CopyOutlined />}
          hotkey={HotKeys.copyActionHotKey.text}
          text="复制"
        />
        <MenuItem
          name={ActionType.removeCell}
          icon={<DeleteOutlined />}
          hotkey={HotKeys.removeCellActionHotKey.text}
          text="删除"
        />
        <Divider />
        <MenuItem
          name={ActionType.runDown}
          icon={<LogoutOutlined />}
          hotkey={HotKeys.runDownActionHotKey.text}
          text="从此处开始执行"
        />
        <MenuItem
          name={ActionType.runUp}
          icon={<LoginOutlined />}
          hotkey={HotKeys.runUpActionHotKey.text}
          text="执行到此处"
        />
        <MenuItem
          name={ActionType.runSingle}
          icon={<PlayCircleOutlined />}
          hotkey={HotKeys.runSingleActionHotKey.text}
          text="执行节点"
        />
        {data.status === NodeStatus.running && (
          <MenuItem name={ActionType.stopRun} icon={<StopOutlined />} text="停止执行" />
        )}
        {showContinueRun && (
          <MenuItem
            name={ActionType.continueRun}
            icon={<SyncOutlined />}
            text="继续执行"
          />
        )}
      </Menu>
    );
    return menu;
  };

  return showMenu ? (
    <Dropdown
      overlay={getMenuItems()}
      trigger={['contextMenu']}
      overlayStyle={{ overflowY: 'auto' }}
    >
      <Popover
        trigger="hover"
        content={
          <Description data={{ ...data, showContinueRun }} dagContext={DAGContext} />
        }
        placement="bottom"
        arrow={false}
        overlayClassName={'popover'}
        overlayStyle={{ width: 258 }}
        destroyTooltipOnHide
      >
        <div className={classnames(['dag-node', statusName])}>
          <span className="icon">
            {ComponentIcons[domain] || ComponentIcons['default']}
          </span>
          <span className="label">{label}</span>
          <span className="status">{getStatusFlag()}</span>
        </div>
      </Popover>
    </Dropdown>
  ) : (
    <Popover
      trigger="hover"
      content={
        <Description data={{ ...data, showContinueRun }} dagContext={DAGContext} />
      }
      placement="bottom"
      arrow={false}
      overlayClassName={'popover'}
      overlayStyle={{ width: 258 }}
      destroyTooltipOnHide
    >
      <div
        className={classnames(
          ['dag-node', statusName],
          { opaque: isOpaque },
          { hightlight: isHighlighted },
        )}
      >
        <span className="icon">
          {ComponentIcons[domain] || ComponentIcons['default']}
        </span>
        <span className="label">{label}</span>
        <span className="status">{getStatusFlag()}</span>
      </div>
    </Popover>
  );
};

// register node
register({
  shape: 'dag-node',
  width: 180,
  height: 36,
  component: DagNode,
  effect: ['data'],
  inherit: 'react-shape',
  ports: {
    groups: {
      top: {
        position: 'top',
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: '#C2C8D5',
            strokeWidth: 1,
            fill: '#fff',
          },
        },
      },
      bottom: {
        position: 'bottom',
        markup: [
          {
            tagName: 'circle',
            selector: 'outer',
          },
          {
            tagName: 'circle',
            selector: 'inner',
          },
        ],
        attrs: {
          outer: {
            r: 10,
            magnet: true,
            stroke: 'transparent',
            fill: 'transparent',
          },
          inner: {
            r: 4,
            magnet: true,
            stroke: '#C2C8D5',
            strokeWidth: 1,
            fill: '#fff',
          },
        },
      },
    },
  },
});
