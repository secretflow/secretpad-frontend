import Icon from '@ant-design/icons';
import { parse } from 'query-string';
import { useEffect } from 'react';
import { useLocation } from 'umi';

import { ReactComponent as DataSource } from '@/assets/data-source.svg';
import { ReactComponent as DataManager } from '@/assets/jiaochabiao.svg';
import { ReactComponent as CooperativeNode } from '@/assets/join-node.svg';
import { ReactComponent as projectManager } from '@/assets/project-manager.svg';
import { ReactComponent as ResultManager } from '@/assets/resultmanager.svg';
import { ReactComponent as Workbench } from '@/assets/workbench.svg';
import { CooperativeNodeListComponent } from '@/modules/cooperative-node-list';
import { DataManagerComponent } from '@/modules/data-manager/data-manager.view';
import { DataSourceListComponent } from '@/modules/data-source-list';
import { HomeLayout } from '@/modules/layout/home-layout';
import { HomeLayoutService } from '@/modules/layout/home-layout/home-layout.service';
import { ManagementLayoutComponent } from '@/modules/layout/management-layout';
import { MessageService } from '@/modules/message-center/message.service';
import { NodeService } from '@/modules/node';
import { P2pProjectListComponent } from '@/modules/p2p-project-list';
import { P2PWorkbenchComponent } from '@/modules/p2p-workbench/workbench.view';
import { ResultManagerComponent } from '@/modules/result-manager/result-manager.view';
import { useModel } from '@/util/valtio-helper';

const menuItems: {
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  key: string;
}[] = [
  {
    label: '工作台',
    icon: <Icon component={Workbench} />,
    component: <P2PWorkbenchComponent />,
    key: 'workbench',
  },
  {
    label: '数据源管理',
    icon: <Icon component={DataSource} />,
    component: <DataSourceListComponent />,
    key: 'data-source',
  },
  {
    label: '数据管理',
    icon: <Icon component={DataManager} />,
    component: <DataManagerComponent />,
    key: 'data-management',
  },
  {
    label: '合作节点',
    icon: <Icon component={CooperativeNode} />,
    component: <CooperativeNodeListComponent />,
    key: 'connected-node',
  },
  {
    label: '我的项目',
    icon: <Icon component={projectManager} />,
    component: <P2pProjectListComponent />,
    key: 'my-project',
  },
  {
    label: '结果管理',
    icon: <Icon component={ResultManager} />,
    component: <ResultManagerComponent />,
    key: 'result',
  },
];
const EdgePage = () => {
  const { search } = useLocation();
  const { nodeId } = parse(search);
  const homeLayoutService = useModel(HomeLayoutService);
  const messageService = useModel(MessageService);
  const nodeService = useModel(NodeService);

  useEffect(() => {
    const getNodeList = async () => {
      const nodeList = await nodeService.listNode();
      if (nodeId) {
        const node = nodeList.find((n) => nodeId === n.nodeId);
        if (node) nodeService.setCurrentNode(node);
      }
    };
    const getMessageTotal = async () => {
      if (nodeId) {
        const res = await messageService.getMessageCount(nodeId as string);
        if (res.status) {
          homeLayoutService.setMessageCount(res?.data || 0);
        }
      }
    };
    homeLayoutService.setSubTitle('Edge');
    getNodeList();
    // 获取未处理消息数量
    getMessageTotal();
  }, []);
  return (
    <HomeLayout>
      <ManagementLayoutComponent menuItems={menuItems} defaultTabKey={'workbench'} />
    </HomeLayout>
  );
};

export default EdgePage;
