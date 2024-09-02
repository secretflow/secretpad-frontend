import { useModel } from '@/util/valtio-helper';
import { DeleteOutlined, PlusOutlined, SwapOutlined } from '@ant-design/icons';
import {
  Button,
  Divider,
  Dropdown,
  MenuProps,
  message,
  Space,
  Tag,
  theme,
  Tooltip,
  Typography,
} from 'antd';

import React from 'react';
import { AddNodeModal } from '../add-node';
import { NodeState, NodeStateText } from '@/modules/managed-node-list';

import styles from './index.less';
import { MyNodeService } from '../my-node.service';
import { confirmDelete } from '@/components/comfirm-delete';

const { Text } = Typography;

export const SwitchNode = () => {
  const { useToken } = theme;
  const myNodeService = useModel(MyNodeService);

  const {
    autonomyNodeList,
    getNodeInfo,
    nodeInfo,
    delAutonomyNode,
    getAutonomyNodeList,
  } = myNodeService;

  const { token } = useToken();

  const contentStyle: React.CSSProperties = {
    backgroundColor: token.colorBgElevated,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowSecondary,
  };

  const menuStyle: React.CSSProperties = {
    boxShadow: 'none',
  };

  const items: MenuProps['items'] = autonomyNodeList.map((item) => {
    return {
      key: item.nodeId,
      label: (
        <Space>
          {item.isMainNode && <Tag className={styles.mainTag}>主节点</Tag>}
          <div className={styles.menuTextLabel}>
            <Text ellipsis={{ tooltip: item.nodeName }}>{item.nodeName}</Text>
          </div>
          <Tag
            color={
              NodeStateText[(item?.nodeStatus as NodeState) || NodeState.UNKNOWN].icon
            }
            className={styles.menuTagLabel}
          >
            {NodeStateText[(item?.nodeStatus as NodeState) || NodeState.UNKNOWN].text}
          </Tag>
        </Space>
      ),
    };
  });

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    myNodeService.currentPageNodeId = e.key;
    getNodeInfo(e.key);
  };

  const handleDelete = () => {
    confirmDelete({
      name: nodeInfo.nodeName || '',
      description: '',
      onOk: async () => {
        const { status } = await delAutonomyNode(nodeInfo.nodeId!);
        if (status && status.code === 0) {
          message.success(`「${nodeInfo.nodeName}」删除成功`);
          await getAutonomyNodeList();
          myNodeService.setCurrentPageMainNodeId();
          await getNodeInfo(myNodeService.currentPageNodeId as string);
        } else {
          message.error(status?.msg);
        }
      },
    });
  };

  return (
    <>
      <Dropdown
        menu={{ items, onClick: handleMenuClick }}
        overlayStyle={{
          minWidth: 300,
        }}
        dropdownRender={(menu) => (
          <div style={contentStyle}>
            {React.cloneElement(menu as React.ReactElement, { style: menuStyle })}
            <Divider style={{ margin: 0 }} />
            <Tooltip
              placement="topLeft"
              title={(items || []).length >= 10 ? '已有10个节点，不可再新增' : ''}
            >
              <Button
                disabled={(items || []).length >= 10}
                type="link"
                onClick={() => (myNodeService.addNodeModelVisible = true)}
                icon={<PlusOutlined />}
                className={styles.addCalcNodeBtn}
              >
                新增计算节点
              </Button>
            </Tooltip>
          </div>
        )}
        placement="bottomRight"
      >
        <Space className={styles.swapNodeText}>
          <Button
            type="text"
            icon={<SwapOutlined style={{ fontSize: 14 }} />}
            className={styles.switchNodeBtn}
          >
            切换节点
          </Button>
        </Space>
      </Dropdown>
      <Tooltip
        placement="top"
        title={
          nodeInfo.allowDeletion
            ? null
            : `${nodeInfo.isMainNode ? '机构主节点' : '已有授权的合作节点'}，不可删除`
        }
      >
        <Button
          type="text"
          disabled={!nodeInfo.allowDeletion}
          onClick={handleDelete}
          icon={<DeleteOutlined style={{ fontSize: 14 }} />}
          className={styles.deleteNodeBtn}
        >
          删除
        </Button>
      </Tooltip>
      <AddNodeModal
        visible={myNodeService.addNodeModelVisible}
        close={() => (myNodeService.addNodeModelVisible = false)}
      />
    </>
  );
};
