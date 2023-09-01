import Icon from '@ant-design/icons';
import { parse } from 'query-string';
import { useEffect } from 'react';
import { useLocation } from 'umi';

import { ReactComponent as DataManager } from '@/assets/jiaochabiao.svg';
import { ReactComponent as CooperativeNode } from '@/assets/join-node.svg';
import { ReactComponent as ResultManager } from '@/assets/resultmanager.svg';
import { CooperativeNodeListComponent } from '@/modules/cooperative-node-list';
import { DataManagerComponent } from '@/modules/data-manager/data-manager.view';
import { HomeLayout } from '@/modules/layout/home-layout';
import { HomeLayoutService } from '@/modules/layout/home-layout/home-layout.service';
import { ManagementLayoutComponent } from '@/modules/layout/management-layout';
import { NodeService } from '@/modules/node';
import { ResultManagerComponent } from '@/modules/result-manager/result-manager.view';
import { useModel } from '@/util/valtio-helper';

const menuItems: {
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  key: string;
}[] = [
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
    label: '结果管理',
    icon: <Icon component={ResultManager} />,
    component: <ResultManagerComponent />,
    key: 'result',
  },
];
const NodePage = () => {
  const { search } = useLocation();
  const { nodeId } = parse(search);
  const homeLayoutService = useModel(HomeLayoutService);
  const nodeService = useModel(NodeService);

  useEffect(() => {
    const getNodeList = async () => {
      const nodeList = await nodeService.listNode();
      if (nodeId) {
        const node = nodeList.find((n) => nodeId === n.nodeId);
        if (node) nodeService.setCurrentNode(node);
      }
    };
    homeLayoutService.setSubTitle('Edge');
    getNodeList();
  }, []);
  return (
    <HomeLayout>
      <ManagementLayoutComponent
        menuItems={menuItems}
        defaultTabKey={'data-management'}
      />
    </HomeLayout>
  );
};

export default NodePage;
