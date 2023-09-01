import Icon from '@ant-design/icons';
import { useEffect } from 'react';

import { ReactComponent as ManagedNode } from '@/assets/menu-node.svg';
import { ReactComponent as projectManager } from '@/assets/project-manager.svg';
import { HomeLayout } from '@/modules/layout/home-layout';
import { HomeLayoutService } from '@/modules/layout/home-layout/home-layout.service';
import { ManagementLayoutComponent } from '@/modules/layout/management-layout';
import { ManagedNodeListComponent } from '@/modules/managed-node-list';
import { ProjectListComponent } from '@/modules/project-list';
import { useModel } from '@/util/valtio-helper';

const menuItems: {
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  key: string;
}[] = [
  {
    label: '节点注册',
    icon: <Icon component={ManagedNode} />,
    component: <ManagedNodeListComponent />,
    key: 'node-management',
  },

  {
    label: '项目管理',
    icon: <Icon component={projectManager} />,
    component: <ProjectListComponent />,
    key: 'project-management',
  },
];

const HomePage = () => {
  const homeLayoutService = useModel(HomeLayoutService);
  useEffect(() => {
    homeLayoutService.setSubTitle('Center');
    homeLayoutService.setBgClassName('centerBg');
  }, []);
  return (
    <HomeLayout>
      <ManagementLayoutComponent
        menuItems={menuItems}
        defaultTabKey={'node-management'}
      />
    </HomeLayout>
  );
};

export default HomePage;
