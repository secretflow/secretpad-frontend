import {
  FileTextOutlined,
  HddFilled,
  HddOutlined,
  PlusOutlined,
  SnippetsOutlined,
} from '@ant-design/icons';
import { Button, Popover, Typography, List, Space, Spin, Row, Col } from 'antd';
import React, { useEffect } from 'react';
import { history, useLocation } from 'umi';

import { NodeService } from '@/modules/node';
import { ResultManagerService } from '@/modules/result-manager/result-manager.service';
import { getModel, Model, useModel } from '@/util/valtio-helper';

import styles from './index.less';
import { openNewTab } from '@/util/path';

type NodeDatatableVO = API.NodeDatatableVO;
type NodeResultsVO = API.NodeResultsVO;

export const ManagedNodeComponent: React.FC = () => {
  const viewInstance = useModel(ManagedNodeView);
  const { pathname } = useLocation();

  const [showDetailsBtn, setShowDetailsBtn] = React.useState(-1);

  const { nodeList } = viewInstance;

  const { Title } = Typography;

  const onMouseMoveNodeInfo = (index: number) => {
    setShowDetailsBtn(index);
  };

  useEffect(() => {
    viewInstance.loadData();
  }, []);

  const getContent = (authNode: API.NodeRouteVO[] = []) => {
    return (
      <List
        size="small"
        bordered
        className={styles.nodePopoverList}
        dataSource={authNode}
        renderItem={(item) => (
          <List.Item>
            <Space align="center">
              <div className={styles.nodeStatusIcon}>
                <HddFilled style={{ color: '#52C41A' }} />
              </div>
              <div>{item.srcNodeId}</div>
            </Space>
          </List.Item>
        )}
      />
    );
  };

  const getTableContent = (authNode: API.NodeDatatableVO[] = []) => {
    return (
      <List
        size="small"
        bordered
        className={styles.nodePopoverList}
        dataSource={authNode}
        style={{ maxHeight: 200, overflow: 'auto' }}
        renderItem={(item) => (
          <List.Item>
            <Space>{item.datatableName}</Space>
          </List.Item>
        )}
      />
    );
  };

  const getResultListContent = (authNode: API.NodeResultsVO) => {
    return (
      <Spin spinning={viewInstance.resultListLoading}>
        <List
          size="small"
          bordered
          className={styles.nodePopoverList}
          dataSource={authNode}
          style={{ maxHeight: 200, overflow: 'auto' }}
          renderItem={(item) => (
            <List.Item>
              <Space>{item.productName}</Space>
            </List.Item>
          )}
        />
      </Spin>
    );
  };

  return (
    <div className={styles.nodeContent}>
      <Title className={styles.title}>我管理的节点</Title>
      <div className={styles.content}>
        {nodeList?.map((item, index) => {
          return (
            <div className={styles.nodeInfoWrapper} key={index}>
              <div
                key={index}
                onMouseMove={() => onMouseMoveNodeInfo(index)}
                onMouseLeave={() => setShowDetailsBtn(-1)}
                className={styles.nodeInfo}
                onClick={() => {
                  const search = `nodeId=${item.nodeId}&tab=data-management`;
                  openNewTab(pathname, '/node', search);
                }}
              >
                {/* 上半部份 */}
                <div className={styles.nodeInfoTop}>
                  <div className={styles.nodeInfoTopText}>
                    <div style={{ display: 'flex' }}>
                      <div className={styles.nodeStatusIcon}>
                        <HddFilled style={{ color: '#23B65F' }} />
                      </div>
                      {/* <Tooltip title={item.nodeName}> */}
                      <div className={styles.text}>{item.nodeName}</div>
                      {/* </Tooltip> */}
                    </div>
                    {showDetailsBtn === index && (
                      <Button
                        style={{ borderRadius: 14, width: 72, height: 28 }}
                        size="small"
                        onClick={() => {
                          history.push({
                            pathname: '/my-node',
                            search: `nodeId=${item.nodeId}`,
                          });
                        }}
                      >
                        查看详情
                      </Button>
                    )}
                  </div>
                  <div className={styles.id}>ID: {item.nodeId}</div>
                </div>
                {/* 下半部分 */}
                <div style={{ marginLeft: 24 }}>
                  <div className={styles.nodeInfoBootom}>
                    <Row gutter={8}>
                      <Col span={9} className={styles.nodeInfoBootomItem}>
                        <div className={styles.ItemName}>
                          <HddOutlined />
                          已授权节点
                        </div>
                        <div className={styles.ItemNumber}>
                          <Popover
                            content={getContent(
                              item.nodeRoutes?.filter(
                                (i) => i.srcNodeId !== item.nodeId,
                              ),
                            )}
                            title="已授权节点"
                          >
                            {(item.nodeRoutes?.length || 1) - 1}
                          </Popover>
                        </div>
                      </Col>
                      <Col span={8} className={styles.nodeInfoBootomItem}>
                        <div className={styles.ItemName}>
                          <FileTextOutlined />
                          数据表
                        </div>
                        <div
                          className={styles.ItemNumber}
                          onClick={() =>
                            viewInstance.gotoNodePage(pathname, item.nodeId || '')
                          }
                        >
                          <Popover
                            content={getTableContent(
                              item.datatables as NodeDatatableVO[],
                            )}
                            overlayStyle={{
                              visibility:
                                item.datatables?.length === 0 ? 'hidden' : 'visible',
                            }}
                            title={
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <span>数据表</span>
                                <PlusOutlined
                                  style={{ cursor: 'point', color: '#1677FF' }}
                                  onClick={() =>
                                    viewInstance.gotoNodePage(
                                      pathname,
                                      item.nodeId || '',
                                    )
                                  }
                                />
                              </div>
                            }
                          >
                            {item.datatables?.length}
                          </Popover>
                        </div>
                      </Col>
                      <Col
                        span={7}
                        className={styles.nodeInfoBootomItem}
                        onClick={(e) => {
                          e.stopPropagation();
                          viewInstance.gotoNodePage(
                            pathname,
                            item.nodeId || '',
                            'result',
                          );
                        }}
                      >
                        <div className={styles.ItemName}>
                          <SnippetsOutlined />
                          结果表
                        </div>
                        <div className={styles.ItemNumber}>
                          <Popover
                            content={getResultListContent(
                              viewInstance.resultList || ([] as NodeResultsVO[]),
                            )}
                            title="结果"
                            onOpenChange={() =>
                              viewInstance.loadResultList(item.nodeId || '')
                            }
                          >
                            <span>{item.resultCount || 0}</span>
                          </Popover>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export class ManagedNodeView extends Model {
  nodeList: API.NodeVO[] = [];

  resultList?: API.NodeResultsVO[];

  resultListLoading = false;

  nodeService = getModel(NodeService);
  resultManagerService = getModel(ResultManagerService);

  async loadData() {
    this.nodeList = (await this.nodeService.listNode()) as API.NodeVO[];
  }

  async gotoNodePage(pathname: string, nodeId: string, tab = 'data-management') {
    const search = `nodeId=${nodeId}&tab=${tab}`;
    openNewTab(pathname, '/node', search);
  }

  async loadResultList(nodeId: string) {
    this.resultList = [];
    this.resultListLoading = true;
    const list = await this.resultManagerService.getResultList(
      nodeId,
      1,
      10,
      '',
      [],
      '',
    );
    this.resultListLoading = false;
    this.resultList = list?.nodeResultsVOList || [];
  }
}
