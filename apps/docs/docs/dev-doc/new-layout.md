---
nav: 文档
group:
  title: 页面及模块开发
  order: 3
order: 1
mobile: false
---

# 新增布局

可以通过两种方式添加布局

## 路由声明式布局

可以在`config/routes.ts`内配置。例如：

```js
export const routes = [
  {
    path: '/',
    wrappers: ['@/wrappers/theme-wrapper', '@/wrappers/login-auth'],
    component: '@/modules/layout/layout.view', // 这里声明了一个全局的layout
    routes: [
      { path: '/', component: 'home' },
      { path: '/home', component: 'home' },
      { path: '/dag', component: 'dag' },
      { path: '/node', component: 'node' },
      { path: '/record', component: 'record' },
    ],
  },
  {
    path: '/guide',
    wrappers: ['@/wrappers/theme-wrapper', '@/wrappers/login-auth'],
    component: 'guide',
  },
  {
    path: '/login',
    wrappers: ['@/wrappers/theme-wrapper'],
    component: 'login',
  },
];
```

更多信息请参考 [umi 路由](https://umijs.org/docs/guides/routes#%E5%85%A8%E5%B1%80-layout)

## 手动添加布局

平台所有的布局文件都管理在`src/modules/layout`目录内

例如: `src/modules/layout/home-layout` 布局文件

```tsx | pure
import { ShowMenuContext, Portal } from '@secretflow/dag';
import type { ReactNode } from 'react';

import { HeaderComponent } from './header-view';
import styles from './index.less';

export const HomeLayout = ({ children }: { children: ReactNode }) => {
  const X6ReactPortalProvider = Portal.getProvider();
  return (
    <div className={styles.home}>
      <ShowMenuContext.Provider value={false}>
        <X6ReactPortalProvider />
      </ShowMenuContext.Provider>

      <div className={styles.header}>
        <HeaderComponent />
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
};
```

使用布局。例如 `pages/home.tsx`页面入口：

```tsx | pure
import { HomeLayout } from '@/modules/layout/home-layout';
import { ProjectContentComponent } from '@/modules/project-content/project-content.view';

const HomePage = () => {
  return (
    <HomeLayout>
      <ProjectContentComponent />
    </HomeLayout>
  );
};

export default HomePage;
```
