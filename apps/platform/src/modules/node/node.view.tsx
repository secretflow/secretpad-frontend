import { DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Tabs, Tag, Badge, Dropdown } from 'antd';
import { parse } from 'query-string';
import React from 'react';
import { history, useLocation } from 'umi';

import GirlImg from '@/assets/small-girl.png';
import { DataManagerComponent } from '@/modules/data-manager/data-manager.view';
import type { NodeVO } from '@/modules/guide-node/guide-node.service';
import { HomeLayoutService } from '@/modules/layout/home-layout/home-layout.service';
import { NodeService } from '@/modules/node';
import { ResultManagerComponent } from '@/modules/result-manager/result-manager.view';
import { getModel, Model, useModel } from '@/util/valtio-helper';

import styles from './index.less';

export const NodeComponent: React.FC = () => {
  const viewInstance = useModel(NodeView);

  const { search } = useLocation();
  const { tab } = parse(search);

  const nodeList = viewInstance.nodeList.map((node) => ({
    key: node.nodeId,
    label: (
      <div onClick={() => viewInstance.changeCurrentNode(node as NodeVO)}>
        {node.nodeName}
      </div>
    ),
  }));

  return (
    <div className={styles.main}>
      <div className={styles.nodeInfo}>
        <div className={styles.currentNode}>
          <div className={styles.nodeNameAndStatus}>
            <Dropdown
              menu={{ items: nodeList as MenuProps['items'] }}
              placement="bottomLeft"
              overlayStyle={{ minWidth: 200 }}
            >
              <span className={styles.nodeName}>
                {viewInstance.nodeService.currentNode?.nodeName}
                <span className={styles.nodeNameSpread}>
                  <DownOutlined />
                </span>
              </span>
            </Dropdown>

            <span className={styles.nodeStatus}>
              <Tag
                icon={<Badge key={'green'} color={'#23B65F'} text="" />}
                color="#D8FBE7"
              >
                <span style={{ marginLeft: 5, color: '#23B65F' }}>节点可用</span>
              </Tag>
            </span>
          </div>
          <div className={styles.nodeId}>
            ID: {viewInstance.nodeService.currentNode?.nodeId}
          </div>
        </div>
        <div className={styles.tips}>
          <img src={GirlImg} style={{ width: 36, marginRight: 5 }} />
          <span>以下是你可管理的节点，支持查看、下载结果表</span>
        </div>
      </div>
      <div className={styles.mainContent}>
        <Tabs
          type="card"
          defaultActiveKey={(tab as string) || 'table'}
          destroyInactiveTabPane={true}
          onTabClick={(e) => {
            const url = new URL(window.location.href);
            url.searchParams.set('tab', e as string);
            url.searchParams.delete('resultName');
            history.push(url.toString());
          }}
        >
          <Tabs.TabPane tab="数据管理" tabKey="table" key="table">
            <DataManagerComponent />
          </Tabs.TabPane>
          <Tabs.TabPane tab="结果管理" tabKey="result" key="result">
            <ResultManagerComponent />
          </Tabs.TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export class NodeView extends Model {
  pageTitle = '节点管理中心';

  homeLayoutService = getModel(HomeLayoutService);
  nodeService = getModel(NodeService);

  nodeList: API.NodeVO[] = [];

  onViewMount() {
    this.homeLayoutService.setSubTitle(this.pageTitle);
    this.loadData();
  }

  setCurrentNodeById(id: string) {
    const node = this.nodeList.find((i) => i.nodeId === id);
    if (!node) return;
    this.setCurrentNode(node as NodeVO);
  }

  changeCurrentNode(node: NodeVO) {
    const url = new URL(window.location.href);
    url.searchParams.set('nodeId', node.nodeId as string);
    history.push(url.toString());
    this.setCurrentNode(node);
  }

  setCurrentNode(node: NodeVO) {
    this.nodeService.setCurrentNode(node);
  }

  async loadData() {
    this.nodeList = await this.nodeService.listNode();
    const { nodeId } = parse(window.location.search);
    this.setCurrentNodeById(nodeId as string);
  }
}
