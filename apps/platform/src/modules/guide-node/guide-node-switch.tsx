import { HddFilled, PlusOutlined } from '@ant-design/icons';
import { Typography, Divider, Tag, Popover, Space, List, Row, Tooltip } from 'antd';
import classnames from 'classnames';
import React from 'react';
import { history } from 'umi';

import type { NodeVO, NodeRouteVO, NodeDatatableVO } from './guide-node.service';
import styles from './node.less';

const { Link, Text } = Typography;

export interface NodeSwitchType {
  value?: string;
  nodes: NodeVO[];
  onChange?: (value: string) => void;
}

const getContent = (authenticatedNodes: string[]) => {
  return (
    <List
      size="small"
      bordered
      className={styles.nodePopoverList}
      dataSource={authenticatedNodes}
      renderItem={(item) => (
        <List.Item>
          <Space>
            <div className={styles.nodeStatusIcon}>
              <HddFilled style={{ color: '#52C41A' }} />
            </div>
            {item}
          </Space>
        </List.Item>
      )}
    />
  );
};

const getSheetContent = (dataSheet: NodeDatatableVO[]) => {
  return (
    <List
      size="small"
      bordered
      className={styles.nodePopoverList}
      dataSource={dataSheet}
      renderItem={(item) => <List.Item>{item.datatableName}</List.Item>}
    />
  );
};

export const NodeSwitch: React.FC<NodeSwitchType> = (props) => {
  const { nodes = [], value, onChange } = props;
  const embeddedNodes = nodes.filter(
    (node) => node.type === 'embedded' && node.nodeId !== 'tee',
  );

  const getAuthenticatedNodes = (nodeRoutes: NodeRouteVO[], nodeId: string) => {
    const authenticatedNodes = new Set<string>();
    nodeRoutes.forEach((route) => {
      if (route.srcNodeId === nodeId) {
        authenticatedNodes.add(route.dstNodeId as string);
      }
    });

    return Array.from(authenticatedNodes);
  };
  return (
    <div className={styles.nodes}>
      {embeddedNodes?.map(({ nodeId, nodeRoutes, datatables, nodeName }) => {
        const authenticatedNodes = getAuthenticatedNodes(
          nodeRoutes as NodeRouteVO[],
          nodeId as string,
        );
        return (
          <div
            key={nodeId}
            className={classnames(styles.node, {
              [styles.checked]: value === nodeId,
            })}
            onClick={() => {
              if (onChange) {
                onChange(nodeId as string);
              }
            }}
          >
            <div className={styles.nodeTitle}>
              <Space align="center">
                <div className={styles.nodeStatusIcon}>
                  <HddFilled
                    style={{ color: '#52C41A', width: '12px', height: '12px' }}
                  />
                </div>
                <div className={styles.nodeTitleText}>{nodeName}</div>
              </Space>
              <Tag color="blue">
                <span className={styles.authNodeText}>已授权</span>
                <Popover
                  placement="right"
                  title="已授权节点"
                  content={getContent(authenticatedNodes)}
                >
                  <Link className={styles.authNodeNum}>
                    {authenticatedNodes.length}
                  </Link>
                </Popover>
                <span className={styles.authNodeText}>节点</span>
              </Tag>
            </div>
            <EllipsisMiddle className={styles.nodeIdText}>
              {`ID:${nodeId}`}
            </EllipsisMiddle>
            <Divider dashed className={styles.nodeDivider}></Divider>
            <div>
              {datatables?.slice(0, 1).map((dataSheetItem, index) => {
                return (
                  <React.Fragment key={dataSheetItem.datatableId}>
                    <div className={styles.dataSheetText}>
                      {dataSheetItem.datatableName}
                      {index === datatables.slice(0, 1).length - 1 && (
                        <span className={styles.dataSheetContent}>
                          <Text className={styles.dataText}>共</Text>
                          <Popover
                            placement="right"
                            title={
                              <Row justify="space-between">
                                <span>数据表</span>
                                <PlusOutlined
                                  style={{ cursor: 'point', color: '#0068FA' }}
                                  onClick={() => {
                                    history.push({
                                      pathname: '/node',
                                      search: `nodeId=${nodeId}&tab=data-management`,
                                    });
                                  }}
                                />
                              </Row>
                            }
                            content={getSheetContent(datatables)}
                          >
                            <Link className={styles.authNodeNum}>
                              {datatables.length}
                            </Link>
                          </Popover>
                          <Text className={styles.dataText}>个数据表</Text>
                        </span>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
              {datatables?.length === 0 && (
                <Text className={styles.nullDataSheet}>共0个数据表</Text>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const EllipsisMiddle: React.FC<{
  children: string;
  className?: string;
}> = ({ children, className }) => {
  return (
    <Tooltip title={children}>
      <Text
        style={{ maxWidth: '100%' }}
        ellipsis={{ tooltip: children }}
        className={className}
      >
        {children}
      </Text>
    </Tooltip>
  );
};
