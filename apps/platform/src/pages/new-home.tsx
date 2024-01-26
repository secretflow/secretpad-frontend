import Icon from '@ant-design/icons';
import { useEffect } from 'react';
import React from 'react';

import { ReactComponent as ManagedNode } from '@/assets/menu-node.svg';
import { ReactComponent as projectManager } from '@/assets/project-manager.svg';
import { HomeLayout } from '@/modules/layout/home-layout';
import { HomeLayoutService } from '@/modules/layout/home-layout/home-layout.service';
import { ManagementLayoutComponent } from '@/modules/layout/management-layout';
import { LoginService } from '@/modules/login/login.service';
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
  const loginService = useModel(LoginService);
  useEffect(() => {
    homeLayoutService.setSubTitle('Center');
    homeLayoutService.setBgClassName('centerBg');
    getUserInfo();
  }, []);

  const [hasNotNodeMenu, setHasNotNodeMenu] = React.useState(true);
  useEffect(() => {
    // EDGE 平台用户在center平台的账号不能展示节点注册页面
    if (
      loginService.userInfo?.platformType === 'CENTER' &&
      loginService.userInfo?.ownerType === 'EDGE'
    ) {
      setHasNotNodeMenu(true);
    } else {
      setHasNotNodeMenu(false);
    }
  }, [loginService.userInfo]);

  const getUserInfo = async () => {
    await loginService.getUserInfoAsync();
  };

  return (
    <HomeLayout>
      <ManagementLayoutComponent
        menuItems={
          hasNotNodeMenu
            ? menuItems.filter((item) => item.key !== 'node-management')
            : menuItems
        }
        defaultTabKey={hasNotNodeMenu ? 'project-management' : 'node-management'}
      />
    </HomeLayout>
  );
};

export default HomePage;
