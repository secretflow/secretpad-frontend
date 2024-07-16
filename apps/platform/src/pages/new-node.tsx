import Icon from '@ant-design/icons';
import { parse } from 'query-string';
import { useEffect, useState } from 'react';
import { useLocation } from 'umi';

import { ReactComponent as DataSource } from '@/assets/data-source.svg';
import { ReactComponent as DataManager } from '@/assets/jiaochabiao.svg';
import { ReactComponent as CooperativeNode } from '@/assets/join-node.svg';
import { ReactComponent as ResultManager } from '@/assets/resultmanager.svg';
import { CooperativeNodeListComponent } from '@/modules/cooperative-node-list';
import { DataManagerComponent } from '@/modules/data-manager/data-manager.view';
import { DataSourceListComponent } from '@/modules/data-source-list';
import { HomeLayout } from '@/modules/layout/home-layout';
import { HomeLayoutService } from '@/modules/layout/home-layout/home-layout.service';
import { ManagementLayoutComponent } from '@/modules/layout/management-layout';
import { MessageService } from '@/modules/message-center/message.service';
import { MyNodeService } from '@/modules/my-node/my-node.service';
import { NodeService } from '@/modules/node';
import { ResultManagerComponent } from '@/modules/result-manager/result-manager.view';
import { useModel } from '@/util/valtio-helper';

type MenuItem = {
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  key: string;
};

const defaultMenuItems: MenuItem[] = [
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
  const messageService = useModel(MessageService);
  const nodeService = useModel(NodeService);
  const myNodeService = useModel(MyNodeService);

  const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultMenuItems);
  const [defaultTabKey, setDefaultTabKey] = useState<string>('');

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

  useEffect(() => {
    const getNodeInfo = async () => {
      await myNodeService.getNodeInfo(nodeId as string);

      let _defaultKey = 'data-source';

      /**
       * 遇到 tee 节点，先屏蔽 数据源管理
       * 原因：tee 暂不支持 oss 数据源管理
       */
      if (
        myNodeService.nodeInfo.nodeId === 'tee' &&
        myNodeService.nodeInfo.type === 'embedded'
      ) {
        const items = menuItems.filter((item) => item.key !== 'data-source');

        _defaultKey = 'data-management';
        setMenuItems(items);
      }

      setDefaultTabKey(_defaultKey);
    };

    getNodeInfo();
  }, [nodeId]);

  return (
    <HomeLayout>
      <ManagementLayoutComponent menuItems={menuItems} defaultTabKey={defaultTabKey} />
    </HomeLayout>
  );
};

export default NodePage;
