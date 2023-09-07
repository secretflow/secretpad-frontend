import {
  CloseOutlined,
  OneToOneOutlined,
  SearchOutlined,
  PlusOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import { splitNodeId, ActionType } from '@secretflow/dag';
import type { MenuProps } from 'antd';
import { Button, Select, Tooltip, Dropdown } from 'antd';
import React from 'react';

import { ReactComponent as ZoomFitIcon } from '@/assets/zoom-fit.icon.svg';
import { getModel, Model, useModel } from '@/util/valtio-helper';

import mainDag from './dag';
import styles from './index.less';

const TOOLS = [
  {
    type: ActionType.zoomIn,
    icon: <PlusOutlined style={{ color: '#545456' }} />,
    render: 'button',
  },
  {
    type: ActionType.zoomTo,
    icon: <PlusOutlined style={{ color: '#545456' }} />,
    render: 'dropdown',
  },
  {
    type: ActionType.zoomOut,
    icon: <MinusOutlined style={{ color: '#545456' }} />,
    render: 'button',
  },
  {
    type: ActionType.zoomToFit,
    icon: <ZoomFitIcon style={{ color: '#545456' }} />,
    render: 'button',
  },
  {
    type: ActionType.zoomToOrigin,
    icon: <OneToOneOutlined style={{ color: '#545456' }} />,
    render: 'button',
  },
];

const dropDownItems: MenuProps['items'] = [
  {
    key: 1,
    label: '50%',
  },
  {
    key: 2,
    label: '75%',
  },
  {
    key: 3,
    label: '100%',
  },
  {
    key: 4,
    label: '125%',
  },
  {
    key: 5,
    label: '150%',
  },
];

export const ToolbuttonComponent: React.FC = () => {
  const viewInstance = useModel(ToolButtonView);

  const { searchMode, nodeList, searchText, setSearchText } = viewInstance;

  return (
    <div className={styles.toolbutton}>
      <div className={styles.search}>
        <Select
          style={{ width: searchMode ? 180 : 0 }}
          className={styles.searchselect}
          showSearch
          value={searchText}
          placeholder="搜索组件名称或ID"
          optionFilterProp="children"
          onChange={(value) => setSearchText(value)}
          filterOption={(input, option) =>
            (option!.children as unknown as string)
              .toLowerCase()
              .indexOf(input.toLowerCase()) >= 0
          }
          onSelect={(nodeId: string) => viewInstance.onSelectNode(nodeId)}
        >
          {nodeList.map((item) => (
            <Select.Option value={item.value} key={item.value}>
              {item.label}
            </Select.Option>
          ))}
        </Select>
        <Tooltip title="搜索">
          <Button
            icon={
              searchMode ? (
                <CloseOutlined style={{ color: '#545456' }} />
              ) : (
                <SearchOutlined style={{ color: '#545456' }} />
              )
            }
            onClick={() => viewInstance.changeSearchMode()}
          />
        </Tooltip>
      </div>
      <div className={styles.btns}>
        {TOOLS.map((tool) => {
          if (tool.render === 'button') {
            return (
              <Tooltip
                key={tool.type}
                title={viewInstance.getToolButtonLabel(tool.type)}
                placement="top"
              >
                <Button
                  icon={tool.icon}
                  onClick={() => viewInstance.run(tool.type)}
                  disabled={!viewInstance.isToolButtonEnabled(tool.type)}
                />
              </Tooltip>
            );
          } else if (tool.render === 'dropdown') {
            return (
              <Dropdown
                menu={{
                  items: dropDownItems,
                  onClick: ({ key }) => viewInstance.run(tool.type, key),
                }}
                placement="top"
                key={tool.type}
              >
                <Button style={{ width: 48, padding: 0 }}>
                  {viewInstance.zoomLabel}
                </Button>
              </Dropdown>
            );
          }
        })}
      </div>
    </div>
  );
};

export class ToolButtonView extends Model {
  searchMode = false;

  showSearchPanel = false;

  nodeList: { label: string; value: string }[] = [];

  zoom = 1;

  searchText = '';

  get zoomLabel() {
    return `${Math.floor(this.zoom * 100)}%`;
  }

  changeSearchMode = () => {
    this.searchMode = !this.searchMode;
    if (this.searchMode) {
      this.getNodeList();
    }
  };

  setSearchText = (value: string) => {
    this.searchText = value;
  };

  getNodeList = () => {
    const graph = mainDag.graphManager.getGraphInstance();
    if (graph) {
      const nodes = graph.getNodes();
      this.nodeList = nodes.map((node) => {
        const { id, label } = node.getData();
        const { index } = splitNodeId(id);
        return {
          label: `${label} (${index})`,
          value: id,
        };
      });
    }
  };

  onSelectNode = (nodeId: string) => {
    mainDag.graphManager.executeAction(
      [ActionType.selectNode, ActionType.centerNode],
      nodeId,
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  run = (type: ActionType, args?: any) => {
    if (type === ActionType.zoomTo) {
      const key = parseInt(args, 10);
      const zoom = 0.25 * (key + 1);
      mainDag.graphManager.executeAction(type, zoom);
      return;
    }
    mainDag.graphManager.executeAction(type, args);
  };

  getToolButtonLabel = (type: ActionType) => {
    const action = mainDag.graphManager.getActionInfo(type);
    if (action) {
      const { label, hotKey } = action;
      if (hotKey) {
        return `${label} ${hotKey.text}`;
      }
      return label;
    }
  };

  isToolButtonEnabled = (type: ActionType) => {
    if (type == ActionType.zoomIn) {
      return this.zoom < 1.5;
    } else if (type === ActionType.zoomOut) {
      return this.zoom > 0.51;
    }
    return true;
  };

  onGraphScale = (zoom: number) => {
    this.zoom = zoom;
  };
}

mainDag.EventHub.register(getModel(ToolButtonView));
