"use strict";(self.webpackChunksecretpad_doc=self.webpackChunksecretpad_doc||[]).push([[904],{59494:function(t,n,e){e.r(n),e.d(n,{demos:function(){return d}});var o=e(44194),a=e(34053),d={}},24239:function(t,n,e){e.r(n),e.d(n,{demos:function(){return d}});var o=e(44194),a=e(16423),d={}},14792:function(t,n,e){e.r(n),e.d(n,{demos:function(){return d}});var o=e(44194),a=e(16316),d={}},40794:function(t,n,e){e.r(n),e.d(n,{demos:function(){return d}});var o=e(44194),a=e(15135),d={}},859:function(t,n,e){e.r(n),e.d(n,{demos:function(){return d}});var o=e(44194),a=e(94358),d={}},20837:function(t,n,e){e.r(n),e.d(n,{demos:function(){return d}});var o=e(44194),a=e(19024),d={}},45831:function(t,n,e){e.r(n),e.d(n,{demos:function(){return d}});var o=e(44194),a=e(77056),d={}},97872:function(t,n,e){e.r(n),e.d(n,{demos:function(){return d}});var o=e(44194),a=e(23441),d={}},12820:function(t,n,e){e.r(n),e.d(n,{demos:function(){return d}});var o=e(44194),a=e(72761),d={}},94575:function(t,n,e){e.r(n),e.d(n,{demos:function(){return d}});var o=e(44194),a=e(51617),d={}},20498:function(t,n,e){e.r(n),e.d(n,{demos:function(){return d}});var o=e(44194),a=e(10233),d={}},53121:function(t,n,e){e.r(n),e.d(n,{demos:function(){return d}});var o=e(44194),a=e(23781),d={}},24954:function(t,n,e){e.r(n),e.d(n,{demos:function(){return d}});var o=e(44194),a=e(77284),d={}},13036:function(t,n,e){e.r(n),e.d(n,{texts:function(){return a}});var o=e(34053);const a=[{value:"\u4EE5\u767B\u5F55\u6821\u9A8C\u4E3E\u4F8B",paraId:0,tocIndex:0},{value:"\u5728\u9996\u6B21\u8FDB\u5165\u5E73\u53F0\u7684\u65F6\u5019\uFF0C\u5224\u65AD\u7528\u6237\u662F\u5426\u4ECE\u672A\u767B\u5F55\u8FC7\uFF0C\u5982\u679C\u662F\u5219\u8DF3\u8F6C\u5230\u767B\u5F55\u754C\u9762\u3002\u6240\u4EE5\u9700\u8981\u5BF9\u6240\u6709\u9875\u9762\u505A\u6743\u9650\u6821\u9A8C\u3002",paraId:1,tocIndex:0},{value:"\u90A3\u4E48\u6211\u4EEC\u5C31\u53EF\u4EE5\u5229\u7528 umi \u7684 wrapper \u529F\u80FD\u8FDB\u884C\u6743\u9650\u63A7\u5236\u3002\u5982\u4E0B\uFF1A",paraId:2,tocIndex:0},{value:"src/wrappers/login-auth.tsx",paraId:3,tocIndex:0},{value:`import { Navigate, Outlet } from 'umi';

// \u5728\u8FD9\u91CC\u63A7\u5236\u662F\u4E0D\u662F\u7B2C\u4E00\u6B21\u8FDB\u5165\u5E73\u53F0
const BeginnerAuth = (props: any) => {
  const neverLogined = localStorage.getItem('neverLogined');
  if (!neverLogined) {
    localStorage.setItem('neverLogined', 'true');
    return <Navigate to="/login" />;
  }
  return <Outlet />;
};

export default BeginnerAuth;
`,paraId:4,tocIndex:0},{value:"\u5728",paraId:5,tocIndex:0},{value:"config/route.ts",paraId:5,tocIndex:0},{value:"\u91CC\u9762\u914D\u7F6E\u4E0A\u6211\u4EEC\u5199\u597D\u7684 wrapper",paraId:5,tocIndex:0},{value:`export const routes = [
  {
    path: '/',
    wrappers: ['@/wrappers/login-auth'],
    component: '@/modules/layout/layout.view',
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
    wrappers: ['@/wrappers/login-auth'],
    component: 'guide',
  },
  {
    path: '/login',
    wrappers: [],
    component: 'login',
  },
];
`,paraId:6,tocIndex:0},{value:`\u5982\u679C\u975E\u9996\u6B21\u8FDB\u5165\u5E73\u53F0\uFF0C\u6211\u4EEC\u901A\u8FC7\u62E6\u622A request \u7684\u54CD\u5E94\u8FDB\u884C\u767B\u5F55\u5224\u65AD\u3002
\u5728 `,paraId:7,tocIndex:0},{value:"app.ts",paraId:7,tocIndex:0},{value:"\u5185:",paraId:7,tocIndex:0},{value:`import { message } from 'antd';
import { history } from 'umi';
import request, { extend } from 'umi-request';

request.interceptors.response.use(async (response, options) => {
  const { status } = await response.clone().json();
  // \u9519\u8BEF\u7801202011603\u662F\u672A\u767B\u5F55
  if (status.code === 202011603) {
    history.push('/login');
  }
  return response;
});
`,paraId:8,tocIndex:0}]},65093:function(t,n,e){e.r(n),e.d(n,{texts:function(){return a}});var o=e(16423);const a=[{value:"\u5F53\u5B8C\u6210\u4E8C\u5F00\u6216\u8005\u529F\u80FD\u66F4\u65B0\u540E\uFF0C\u9700\u8981\u5C06\u9879\u76EE\u91CD\u65B0\u6784\u5EFA\u5E76\u653E\u5728\u540E\u7AEF\u9879\u76EE\u4E2D\u4E00\u540C\u90E8\u7F72\u3002",paraId:0,tocIndex:0},{value:`$ pnpm build
`,paraId:1,tocIndex:1},{value:"\u6784\u5EFA\u4EA7\u7269\u4F1A\u5728 ",paraId:2,tocIndex:1},{value:"dist",paraId:2,tocIndex:1},{value:" \u76EE\u5F55\u4E0B\u751F\u6210\u3002",paraId:2,tocIndex:1},{value:"\u5982\u679C\u662F\u4E0E ",paraId:3,tocIndex:2},{value:"SecretPad",paraId:3,tocIndex:2},{value:" \u4E00\u540C\u90E8\u7F72\uFF0C\u9700\u8981\u5148\u5C06\u6784\u5EFA\u4EA7\u7269\u653E\u5728 SecretPad \u9879\u76EE\u4E2D\uFF0C\u4E4B\u540E\u6267\u884C SecretPad \u955C\u50CF\u6784\u5EFA\u811A\u672C\u3002",paraId:3,tocIndex:2},{value:"\u5728 SecretPad \u4E0B\u65B0\u5EFA ",paraId:4,tocIndex:2},{value:"/secretpad-web/src/main/resources/static",paraId:4,tocIndex:2},{value:" \u76EE\u5F55\uFF0C\u5C06 ",paraId:4,tocIndex:2},{value:"dist",paraId:4,tocIndex:2},{value:" \u76EE\u5F55\u4E0B\u7684\u4EA7\u7269\u653E\u5728\u8BE5\u76EE\u5F55\u4E2D\uFF08\u5982\u679C\u5DF2\u6709\u8BE5\u76EE\u5F55\u5219\u8FDB\u884C\u6587\u4EF6\u66FF\u6362\uFF09\uFF0C\u4E4B\u540E\u8FD0\u884C SecretPad \u7684 ",paraId:4,tocIndex:2},{value:"bash ./scripts/build.sh",paraId:4,tocIndex:2},{value:" \u547D\u4EE4\u91CD\u65B0\u6784\u5EFA\u955C\u50CF\uFF08\u6CE8\u610F\u4E0D\u662F ",paraId:4,tocIndex:2},{value:"make build",paraId:4,tocIndex:2},{value:" \u547D\u4EE4\uFF0C",paraId:4,tocIndex:2},{value:"make build",paraId:4,tocIndex:2},{value:" \u4F1A\u62C9\u53D6\u5B98\u65B9 Release \u7684\u524D\u7AEF\u4EA7\u7269\u6784\u5EFA\u955C\u50CF\uFF09\u3002",paraId:4,tocIndex:2}]},16340:function(t,n,e){e.r(n),e.d(n,{texts:function(){return a}});var o=e(16316);const a=[{value:"\u5728\u524D\u540E\u7AEF\u5206\u79BB\u5F00\u53D1\u7684\u65F6\u5019\uFF0C\u5728\u672C\u5730\u8C03\u8BD5\u4EE3\u7801\u4F1A\u9047\u5230\u8DE8\u57DF\u7684\u95EE\u9898\u3002",paraId:0,tocIndex:0},{value:"\u53EF\u4EE5\u901A\u8FC7 umi \u81EA\u5E26\u7684 proxy \u529F\u80FD\u8FDB\u884C\u8DE8\u57DF\u4EE3\u7406\u3002",paraId:1,tocIndex:0},{value:"\u66F4\u591A\u914D\u7F6E\u8BF7\u53C2\u8003 ",paraId:2,tocIndex:0},{value:"umi \u4EE3\u7406",paraId:2,tocIndex:0},{value:"config/config.ts",paraId:3,tocIndex:0},{value:`import { defineConfig } from 'umi';

import { routes } from './routes';

export default defineConfig({
  proxy: {
    '/api': {
      target: 'http://\u5F00\u53D1\u670D\u52A1\u5730\u5740',
      changeOrigin: true,
    },
});
`,paraId:4,tocIndex:0}]},74158:function(t,n,e){e.r(n),e.d(n,{texts:function(){return a}});var o=e(15135);const a=[{value:`
  `,paraId:0},{value:`
    `,paraId:1},{value:`
      apps
      `,paraId:1},{value:"\u5E73\u53F0\u53CA\u6587\u6863\u76EE\u5F55",paraId:1},{value:`
      `,paraId:1},{value:`
        `,paraId:2},{value:`
          docs
          `,paraId:2},{value:"\u5E73\u53F0\u6587\u6863\u76EE\u5F55",paraId:2},{value:`
        `,paraId:2},{value:`
        `,paraId:2},{value:`
          platform
          `,paraId:2},{value:"\u4E2D\u5FC3\u7BA1\u63A7\u6A21\u5F0F\u5E73\u53F0\u76EE\u5F55",paraId:2},{value:`
          `,paraId:2},{value:`
            `,paraId:3},{value:`
              config
              `,paraId:3},{value:"\u5DE5\u7A0B\u914D\u7F6E\u76EE\u5F55",paraId:3},{value:`
              `,paraId:3},{value:`
                `,paraId:4},{value:`
                  config.ts
                  `,paraId:4},{value:"umi\u914D\u7F6E",paraId:4},{value:`
                `,paraId:4},{value:`
                `,paraId:4},{value:`
                  routes.ts
                  `,paraId:4},{value:"\u8DEF\u7531\u914D\u7F6E",paraId:4},{value:`
                `,paraId:4},{value:`
              `,paraId:4},{value:`
            `,paraId:3},{value:`
            `,paraId:3},{value:`
              src
              `,paraId:3},{value:"\u6E90\u7801\u76EE\u5F55",paraId:3},{value:`
              `,paraId:3},{value:`
                `,paraId:5},{value:`
                  modules
                  `,paraId:5},{value:"\u5E73\u53F0\u6A21\u5757(\u7EC4\u4EF6)\u76EE\u5F55",paraId:5},{value:`
                `,paraId:5},{value:`
                `,paraId:5},{value:`
                  pages
                  `,paraId:5},{value:"\u5E73\u53F0\u9875\u9762\u76EE\u5F55",paraId:5},{value:`
                `,paraId:5},{value:`
                `,paraId:5},{value:`
                  services
                  `,paraId:5},{value:"\u63A5\u53E3\u76EE\u5F55",paraId:5},{value:`
                `,paraId:5},{value:`
                `,paraId:5},{value:`
                  wrappers
                  `,paraId:5},{value:"\u5168\u5C40\u7EC4\u4EF6\u76EE\u5F55",paraId:5},{value:`
                  `,paraId:5},{value:`
                    `,paraId:6},{value:`
                        login-auth.tsx
                        `,paraId:6},{value:"\u767B\u5F55\u6743\u9650\u6821\u9A8C",paraId:6},{value:`
                    `,paraId:6},{value:`
                    `,paraId:6},{value:`
                        theme-wrappers.tsx
                        `,paraId:6},{value:"\u5168\u5C40\u4E3B\u9898",paraId:6},{value:`
                    `,paraId:6},{value:`
                  `,paraId:6},{value:`
                `,paraId:5},{value:`
               `,paraId:5},{value:`
            `,paraId:3},{value:`
          `,paraId:3},{value:`
        `,paraId:2},{value:`
      `,paraId:2},{value:`
    `,paraId:1},{value:`
    `,paraId:1},{value:`
      packages
      `,paraId:1},{value:"\u5E73\u53F0\u901A\u7528\u7EC4\u4EF6\u5E93",paraId:1},{value:`
      `,paraId:1},{value:`
        `,paraId:7},{value:`
          dag
          `,paraId:7},{value:"\u4EFB\u52A1\u6D41\u7EC4\u4EF6",paraId:7},{value:`
        `,paraId:7},{value:`
        `,paraId:7},{value:`
          utils
          `,paraId:7},{value:"\u5DE5\u5177\u65B9\u6CD5",paraId:7},{value:`
        `,paraId:7},{value:`
      `,paraId:7},{value:`
    `,paraId:1},{value:`
  `,paraId:1},{value:`
  `,paraId:8},{value:`
    `,paraId:9},{value:`
      modules
    `,paraId:9},{value:`
    `,paraId:9},{value:`
      `,paraId:10},{value:`
        login
        `,paraId:10},{value:"\u767B\u5F55",paraId:10},{value:`
        `,paraId:10},{value:`
           `,paraId:11},{value:`
             index.tsx
             `,paraId:11},{value:"view + viewModel",paraId:11},{value:`
           `,paraId:11},{value:`
           `,paraId:11},{value:`
             index.less
             `,paraId:11},{value:"\u6837\u5F0F",paraId:11},{value:`
           `,paraId:11},{value:`
           `,paraId:11},{value:`
             login.service.tsx
             `,paraId:11},{value:"\u7528\u4E8E\u5904\u7406\u63A5\u53E3\u53CA\u4E00\u4E9B\u590D\u6742\u903B\u8F91\uFF0C\u5305\u62EC\u4E00\u4E9B\u516C\u7528\u670D\u52A1\u7B49",paraId:11},{value:`
           `,paraId:11},{value:`
        `,paraId:11},{value:`
      `,paraId:10},{value:`
    `,paraId:10},{value:`
  `,paraId:9},{value:`import { message } from 'antd';
import React from 'react';
import { history } from 'umi';

import { ReactComponent as Logo } from '@/assets/logo1.svg';
import platformConfig from '@/platform.config';
import { getModel, Model, useModel } from '@/util/valtio-helper';

import { LoginForm } from './component/login-form';
import type { UserInfo } from './component/login-form';
import styles from './index.less';
import { LoginService } from './login.service';

/* view */
export const LoginComponent: React.FC = () => {
  //  \u901A\u8FC7useModel\u5C06viewModel\u6CE8\u5165\u8FDB\u6765
  const loginModel = useModel(LoginModel);
  return (
    <div className={styles.content}>
      <div className={styles.left}>
        <Logo />
      </div>
      <div className={styles.right}>
        <LoginForm onConfirm={loginModel.loginConfirm} />
      </div>
    </div>
  );
};

/* viewModel viewModel\u7684\u5C5E\u6027\u90FD\u662F\u54CD\u5E94\u5F0F\u7684*/
export class LoginModel extends Model {
  token = '';
  loginService = getModel(LoginService);

  loginConfirm = async (loginFields: UserInfo) => {
    const { status, data } = await this.loginService.login({
      name: loginFields.name,
      password: loginFields.password,
    });

    const notFirstTimeIn = localStorage.getItem('notFirstTimeIn');
    this.token = data || '';
    if (status?.code === 0) {
      message.success('\u767B\u5F55\u6210\u529F');
      localStorage.setItem('neverLogined', 'true');

      if (notFirstTimeIn || !platformConfig.guide) {
        history.push('/');
      } else {
        history.push('/guide');
        localStorage.setItem('notFirstTimeIn', 'true');
      }
    } else {
      message.error('\u767B\u5F55\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u7528\u6237\u540D\u6216\u5BC6\u7801');
    }
  };
}
`,paraId:12,tocIndex:3}]},39363:function(t,n,e){e.r(n),e.d(n,{texts:function(){return a}});var o=e(94358);const a=[{value:"\u53EF\u4EE5\u901A\u8FC7\u4E24\u79CD\u65B9\u5F0F\u6DFB\u52A0\u5E03\u5C40",paraId:0,tocIndex:0},{value:"\u53EF\u4EE5\u5728",paraId:1,tocIndex:1},{value:"config/routes.ts",paraId:1,tocIndex:1},{value:"\u5185\u914D\u7F6E\u3002\u4F8B\u5982\uFF1A",paraId:1,tocIndex:1},{value:`export const routes = [
  {
    path: '/',
    wrappers: ['@/wrappers/theme-wrapper', '@/wrappers/login-auth'],
    component: '@/modules/layout/layout.view', // \u8FD9\u91CC\u58F0\u660E\u4E86\u4E00\u4E2A\u5168\u5C40\u7684layout
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
`,paraId:2,tocIndex:1},{value:"\u66F4\u591A\u4FE1\u606F\u8BF7\u53C2\u8003 ",paraId:3,tocIndex:1},{value:"umi \u8DEF\u7531",paraId:3,tocIndex:1},{value:"\u5E73\u53F0\u6240\u6709\u7684\u5E03\u5C40\u6587\u4EF6\u90FD\u7BA1\u7406\u5728",paraId:4,tocIndex:2},{value:"src/modules/layout",paraId:4,tocIndex:2},{value:"\u76EE\u5F55\u5185",paraId:4,tocIndex:2},{value:"\u4F8B\u5982: ",paraId:5,tocIndex:2},{value:"src/modules/layout/home-layout",paraId:5,tocIndex:2},{value:" \u5E03\u5C40\u6587\u4EF6",paraId:5,tocIndex:2},{value:`import { ShowMenuContext, Portal } from '@secretflow/dag';
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
`,paraId:6,tocIndex:2},{value:"\u4F7F\u7528\u5E03\u5C40\u3002\u4F8B\u5982 ",paraId:7,tocIndex:2},{value:"pages/home.tsx",paraId:7,tocIndex:2},{value:"\u9875\u9762\u5165\u53E3\uFF1A",paraId:7,tocIndex:2},{value:`import { HomeLayout } from '@/modules/layout/home-layout';
import { ProjectContentComponent } from '@/modules/project-content/project-content.view';

const HomePage = () => {
  return (
    <HomeLayout>
      <ProjectContentComponent />
    </HomeLayout>
  );
};

export default HomePage;
`,paraId:8,tocIndex:2}]},1008:function(t,n,e){e.r(n),e.d(n,{texts:function(){return a}});var o=e(19024);const a=[{value:"\u6A21\u5757\u662F\u7531 UI \u7EC4\u4EF6(UI Component + UI \u72B6\u6001 + \u6837\u5F0F) + \u6A21\u5757\u670D\u52A1\u7EC4\u6210\u7684",paraId:0,tocIndex:1},{value:"\u6211\u4EEC\u4F7F\u7528\u4E86",paraId:1,tocIndex:2},{value:"valtio",paraId:1,tocIndex:2},{value:"\u8FDB\u884C\u7EC4\u4EF6\u72B6\u6001\u7684\u7BA1\u7406\uFF0C\u5E76\u4E14\u57FA\u4E8E",paraId:1,tocIndex:2},{value:"valtio",paraId:1,tocIndex:2},{value:"\u6211\u4EEC\u5C01\u88C5\u4E86\u6211\u4EEC\u7684\u5F00\u53D1\u8303\u5F0F\u3002",paraId:1,tocIndex:2},{value:"\u4EE5\u7B80\u5355\u7684",paraId:2,tocIndex:2},{value:"TodoList",paraId:2,tocIndex:2},{value:"\u4E3A\u4F8B\uFF0C\u770B\u770B\u4E00\u4E2A\u6A21\u5757\u7684\u7ED3\u6784",paraId:2,tocIndex:2},{value:`\u2514\u2500\u2500 src
    \u251C\u2500\u2500 modules
      \u251C\u2500\u2500 demoModule
    \xA0   \u2514\u2500\u2500 index.ts  // \u6A21\u5757\u5165\u53E3
        \u2514\u2500\u2500 demo.service.ts // \u6A21\u5757\u63D0\u4F9B\u7684\u670D\u52A1
        \u2514\u2500\u2500 demo.view.tsx // UI\u7EC4\u4EF6
        \u2514\u2500\u2500 index.less // \u6837\u5F0F
        \u2514\u2500\u2500 types.ts // \u7C7B\u578B\u5B9A\u4E49


`,paraId:3,tocIndex:2},{value:"\u7C7B\u4F3C\u4E8E MVVM \u7684\u6982\u5FF5\uFF0C\u4E00\u4E2A UI \u7EC4\u4EF6\u5206\u4E3A\u4E86 view + viewModel",paraId:4,tocIndex:3},{value:"src/modules/example/todo-list.view.tsx",paraId:5,tocIndex:3},{value:`import { Button, Checkbox, List, Card } from 'antd';

import { getModel, useModel, Model } from '../../util/valtio-helper';

import { TodoListService } from './todo-list.service';
import type { TodoItem } from './types';

// \u5B9A\u4E49\u4E00\u4E2Aview
const TodoListComponent = () => {
  // \u901A\u8FC7 useModel \u65B9\u6CD5\u628A\u7EC4\u4EF6\u72B6\u6001\u5F15\u5165\u7EC4\u4EF6\u5185
  const viewInstance = useModel(TodoListView);

  // \u5F53viewInstance.list\u6709\u53D8\u5316\u65F6\uFF0C\u4F1A\u81EA\u52A8\u91CD\u65B0\u6E32\u67D3\u7EC4\u4EF6
  return (
    <div>
      <Card
        title="TODO List"
        extra={
          <Button
            type="link"
            onClick={() =>
              viewInstance.addItem({
                title: 'new item' + viewInstance.list.length,
                description: 'desc',
              })
            }
          >
            + Add
          </Button>
        }
      >
        <List
          itemLayout="horizontal"
          dataSource={viewInstance.list}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Checkbox
                    checked={item.isFinished}
                    onChange={(e) => {
                      viewInstance.checkItem(item, e.target.checked);
                    }}
                  />
                }
                title={item.title}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

// \u5B9A\u4E49view\u5BF9\u5E94\u7684viewModel\uFF0C\u53EA\u8981\u96C6\u6210\u4E86Model\u7C7B\uFF0C\u5219\u6240\u6709\u7684\u5C5E\u6027\u90FD\u662F\u54CD\u5E94\u5F0F\u7684
export default TodoListComponent;
class TodoListView extends Model {
  // \u53EF\u4EE5\u901A\u8FC7getModel\u83B7\u53D6\u672C\u6A21\u5757\u6216\u8005\u5176\u4ED6\u6A21\u5757\u7684\u670D\u52A1
  todoListService = getModel(TodoListService);

  // \u6240\u6709\u7684\u5C5E\u6027\u90FD\u662F\u54CD\u5E94\u5F0F\u7684\uFF0C\u5C5E\u6027\u7684\u503C\u53D8\u5316\u65F6\uFF0C\u4F1A\u81EA\u52A8\u89E6\u53D1\u7EC4\u4EF6\u7684\u66F4\u65B0
  list: TodoItem[] = [];

  // \u7EC4\u4EF6\u6302\u8F7D\u65F6\u4F1A\u81EA\u52A8\u8C03\u7528\u8BE5\u65B9\u6CD5
  onViewMount() {
    this.list = this.todoListService.todoList;
  }

  // \u7EC4\u4EF6\u9500\u6BC1\u65F6\u65F6\u4F1A\u81EA\u52A8\u8C03\u7528\u8BE5\u65B9\u6CD5
  onViewUnmount() {
    return;
  }

  checkItem(item: TodoItem, checked: boolean) {
    this.todoListService.changeStatus(item, checked);
  }

  addItem(item: Omit<TodoItem, 'isFinished'>) {
    this.todoListService.add(item);
  }
}
`,paraId:6,tocIndex:3},{value:"\u670D\u52A1",paraId:7,tocIndex:4},{value:" \u8868\u793A\u548C UI \u65E0\u5173\u7684\u76F8\u5173\u72B6\u6001\u53CA\u903B\u8F91\u7684\u5904\u7406",paraId:7,tocIndex:4},{value:"\u793A\u4F8B\u4E2D\uFF0C",paraId:8,tocIndex:4},{value:"Todo\u9879\u7BA1\u7406",paraId:8,tocIndex:4},{value:" \u63D0\u4F9B\u7684\u670D\u52A1\u5982\u4E0B\u6240\u793A\uFF1A",paraId:8,tocIndex:4},{value:"todoList \u8868\u793A\u6240\u6709 Todo \u9879",paraId:9,tocIndex:4},{value:"add() \u65B9\u6CD5\u65B0\u5EFA\u9879\u76EE",paraId:9,tocIndex:4},{value:"changeStatus() \u65B9\u6CD5\u66F4\u65B0\u9879\u76EE\u5B8C\u6210\u60C5\u51B5",paraId:9,tocIndex:4},{value:"\u8FD9\u6837\uFF0C\u5176\u4ED6\u6A21\u5757(\u4F8B\u5982\u6388\u6743\u7BA1\u7406\u3001\u7ED3\u679C\u7BA1\u7406\u7B49\u7B49)\u5747\u53EF\u4EE5\u65B9\u4FBF\u5730\u901A\u8FC7 ",paraId:10,tocIndex:4},{value:"getModel",paraId:10,tocIndex:4},{value:" \u6216\u8005 ",paraId:10,tocIndex:4},{value:"useModel",paraId:10,tocIndex:4},{value:"(React \u7EC4\u4EF6\u5185\u4F7F\u7528) \u65B9\u6CD5\u5F15\u7528\u5230\uFF0CTodo \u9879\u7BA1\u7406\u6A21\u5757\u63D0\u4F9B\u7684\u76F8\u5173\u670D\u52A1\u4E86\u3002",paraId:10,tocIndex:4},{value:"src/modules/example/todo-list.service.ts",paraId:11,tocIndex:4},{value:`/**
 * This is the service for a to-do list. There are list of todo items. It allows to add
 * new items and change the status (if it's finished).
 */
export class TodoListService {
  /**
   * Todo list
   */
  todoList: TodoItem[] = [];

  /**
   * Add new todo item to the list.
   *
   * @param item the item to be added
   * @throws error when the title of item is duplicate
   */
  add(item: Omit<TodoItem, 'isFinished'>) {
    if (this.todoList.find((i) => i.title === item.title)) {
      throw new Error('This item is already there.');
    }
    this.todoList.push({
      ...item,
      isFinished: false,
    });
  }

  /**
   * Change the status of the item in the list
   *
   * @param item the item to be changed
   * @param isFinished the status
   */
  changeStatus(item: TodoItem, isFinished: boolean) {
    const i = this.todoList.find((todo) => todo.title === item.title);
    if (i) i.isFinished = isFinished;
  }
}
`,paraId:12,tocIndex:4}]},44873:function(t,n,e){e.r(n),e.d(n,{texts:function(){return a}});var o=e(77056);const a=[{value:"\u6839\u636E umi \u7684\u7EA6\u5B9A\u5F0F\u8DEF\u7531\uFF0C\u5E73\u53F0\u6240\u6709\u9875\u9762\u90FD\u7BA1\u7406\u5728 ",paraId:0,tocIndex:0},{value:"src/pages",paraId:0,tocIndex:0},{value:"\u76EE\u5F55\u4E0B",paraId:0,tocIndex:0},{value:"\u5728 ",paraId:1,tocIndex:0},{value:"src/pages",paraId:1,tocIndex:0},{value:" \u4E0B\u65B0\u5EFA\u4E00\u4E2A ",paraId:1,tocIndex:0},{value:"xxx.tsx",paraId:1,tocIndex:0},{value:" \u6587\u4EF6",paraId:1,tocIndex:0},{value:"\u5728",paraId:2,tocIndex:0},{value:"config/routes.ts",paraId:2,tocIndex:0},{value:"\u6587\u4EF6\u4E2D\uFF0C\u4E3A\u65B0\u589E\u7684\u9875\u9762\u6587\u4EF6\u58F0\u660E\u8DEF\u7531",paraId:2,tocIndex:0},{value:`\u4F8B\u5982\uFF1A
\u6211\u4EEC\u5728`,paraId:3,tocIndex:0},{value:"src/pages",paraId:3,tocIndex:0},{value:"\u76EE\u5F55\u4E2D\u65B0\u589E\u4E86\u4E00\u4E2A",paraId:3,tocIndex:0},{value:"new-page.tsx",paraId:3,tocIndex:0},{value:`\u6587\u4EF6\u3002
\u5219\u53EF\u4EE5\u5982\u4E0B\u58F0\u660E\u8DEF\u7531\uFF1A`,paraId:3,tocIndex:0},{value:`export const routes = [
  {
    path: '/',
    wrappers: ['@/wrappers/theme-wrapper', '@/wrappers/login-auth'],
    component: '@/modules/layout/layout.view',
    routes: [
      { path: '/', component: 'home' },
      { path: '/home', component: 'home' },
      { path: '/new-page', component: 'new-page' }, // \u8FD9\u662F\u6211\u4EEC\u65B0\u589E\u7684\u9875\u9762
    ],
  },
];
`,paraId:4,tocIndex:0}]},68676:function(t,n,e){e.r(n),e.d(n,{texts:function(){return a}});var o=e(23441);const a=[{value:"\u5E73\u53F0\u540E\u7AEF\u5E26\u6709 swagger \u670D\u52A1\uFF0C\u90E8\u7F72\u540E\u9ED8\u8BA4\u8BBF\u95EE\u8DEF\u5F84\u4E3A ",paraId:0,tocIndex:0},{value:"${server_url}/swagger_ui.html",paraId:0,tocIndex:0},{value:"\u70B9\u51FB\u4E0A\u56FE\u7BAD\u5934\u6240\u793A\u4F4D\u7F6E\uFF0C\u5F97\u5230 swagger.json \u7684\u5730\u5740\u3002\u5C06\u5730\u5740\u914D\u7F6E\u5230",paraId:1,tocIndex:0},{value:"config/openapi.config.js",paraId:1,tocIndex:0},{value:"\u7684 SWAGGER_JSON_PATH \u53D8\u91CF",paraId:1,tocIndex:0},{value:"\u5728 ",paraId:2,tocIndex:0},{value:"apps/platform",paraId:2,tocIndex:0},{value:" \u76EE\u5F55\u8FD0\u884C",paraId:2,tocIndex:0},{value:`$ pnpm openapi
`,paraId:3,tocIndex:0},{value:"\u5373\u53EF\u81EA\u52A8\u751F\u6210 api \u8BF7\u6C42\u7684\u76F8\u5173\u4EE3\u7801",paraId:4,tocIndex:0},{value:"config/openapi.config.js",paraId:5,tocIndex:0},{value:`const { generateService } = require('@umijs/openapi');
const fs = require('fs');
const path = require('path');

// \u8FD9\u91CC\u66FF\u6362\u4E3A\u672C\u5730\u670D\u52A1\u7684swagger.json\u7684\u5730\u5740
const SWAGGER_JSON_PATH = 'https://petstore.swagger.io/v2/swagger.json';

const DIR_PATH = path.resolve(__dirname, '../', 'src', 'services');
const SUB_DIR_NAME = 'secretpad_openapi';

generateService({
  schemaPath: SWAGGER_JSON_PATH,
  serversPath: DIR_PATH,
  projectName: SUB_DIR_NAME,

  requestLibPath: "import request from 'umi-request'",
}).then(() => {
  const not_rename_files = ['index.ts', 'typings.d.ts'];

  const files_dirs = path.resolve(DIR_PATH, SUB_DIR_NAME);

  const generatedFiles = fs.readdirSync(files_dirs);

  generatedFiles.forEach((fileName) => {
    if (not_rename_files.indexOf(fileName) < 0) {
      fs.renameSync(
        path.resolve(files_dirs, fileName),
        path.resolve(
          files_dirs,
          fileName.charAt(0).toUpperCase() + fileName.slice(1),
        ),
      );
    }
  });
});
`,paraId:6,tocIndex:0}]},68087:function(t,n,e){e.r(n),e.d(n,{texts:function(){return a}});var o=e(72761);const a=[{value:"\u652F\u6301\u901A\u8FC7 ",paraId:0,tocIndex:0},{value:"qiankun",paraId:0,tocIndex:0},{value:" \u8FDB\u884C\u96C6\u6210, \u53EF\u5FEB\u901F\u5C06\u5176\u914D\u7F6E\u4E3A ",paraId:0,tocIndex:0},{value:"qiankun",paraId:0,tocIndex:0},{value:" \u7684\u5B50\u5E94\u7528\u3002",paraId:0,tocIndex:0},{value:"\u53EA\u9700\u8981\u5728 ",paraId:1,tocIndex:0},{value:"platform/config.ts",paraId:1,tocIndex:0},{value:" \u4E2D\u5F00\u542F\u5982\u4E0B\u914D\u7F6E\u5373\u53EF",paraId:1,tocIndex:0},{value:`export default defineConfig({
  plugins: ['@umijs/plugins/dist/qiankun'],
  qiankun: {
    slave: {},
  },
});
`,paraId:2,tocIndex:0},{value:"\u5982\u679C\u4F60\u7684\u4E3B\u5E94\u7528\u9879\u76EE\u662F\u57FA\u4E8E ",paraId:3,tocIndex:0},{value:"Umi",paraId:3,tocIndex:0},{value:" \u5F00\u53D1\u7684\uFF0C\u53EF\u4EE5\u5F00\u542F\u4EE5\u4E0B\u914D\u7F6E\u63A5\u5165\u5B50\u5E94\u7528, \u5177\u4F53\u53EF\u53C2\u8003 ",paraId:3,tocIndex:0},{value:"UmiJS \u6587\u6863",paraId:3,tocIndex:0},{value:`export default defineConfig({
  qiankun: {
    master: {
      apps: [
        {
          name: 'secretpad',
          entry: '//localhost:8009', // \u5B50\u5E94\u7528\u542F\u52A8\u7684\u670D\u52A1
        },
      ],
    },
  },
  routes: [
    {
      name: 'secretpad',
      path: '/secretpad/*',
      microApp: 'secretpad',
    },
  ],
});
`,paraId:4,tocIndex:0},{value:"\u5728\u4F60\u7684\u4E3B\u5E94\u7528\u9879\u76EE\u4E2D\uFF0C\u8BBF\u95EE ",paraId:5,tocIndex:0},{value:"/secretpad/*",paraId:5,tocIndex:0},{value:" \u8DEF\u7531\u5373\u53EF\u770B\u5230\u5E73\u53F0\u88AB\u6210\u529F\u63A5\u5165\u3002",paraId:5,tocIndex:0},{value:"\u5982\u679C\u4F60\u7684\u4E3B\u5E94\u7528\u4E0D\u662F\u57FA\u4E8E ",paraId:6,tocIndex:0},{value:"Umi",paraId:6,tocIndex:0},{value:" \u5F00\u53D1\u7684, \u63A5\u5165\u5B50\u5E94\u7528\u8BF7\u53C2\u8003 ",paraId:6,tocIndex:0},{value:"qiankun \u6587\u6863",paraId:6,tocIndex:0}]},53048:function(t,n,e){e.r(n),e.d(n,{texts:function(){return a}});var o=e(51617);const a=[{value:"\u5E73\u53F0\u4F7F\u7528",paraId:0,tocIndex:0},{value:"umi-request",paraId:0,tocIndex:0},{value:"\u505A\u4E3A\u7F51\u7EDC\u8BF7\u6C42\u7684\u524D\u7AEF\u5E93\u3002",paraId:0,tocIndex:0},{value:"\u5728",paraId:1,tocIndex:0},{value:"src/app.ts",paraId:1,tocIndex:0},{value:"\u5185\u53EF\u4EE5\u5BF9\u8BF7\u6C42\u5E93\u505A\u914D\u7F6E\u3001\u62E6\u622A\u7B49\u64CD\u4F5C\u3002",paraId:1,tocIndex:0},{value:`import { history } from 'umi';
import request, { extend } from 'umi-request';

request.interceptors.request.use((url, options) => {
  return {
    url: \`\${url}\`,
    options: {
      ...options,
      mode: 'cors',
      credentials: 'include',
      interceptors: true,
      headers: {
        'Content-Type': 'application/json',
      },
    },
  };
});

request.interceptors.response.use(async (response, options) => {
  const { status } = await response.clone().json();
  if (status.code === 202011603) {
    history.push('/login');
  }
  return response;
});
`,paraId:2,tocIndex:0}]},40273:function(t,n,e){e.r(n),e.d(n,{texts:function(){return a}});var o=e(10233);const a=[{value:"\u786E\u4FDD\u6B63\u786E\u5B89\u88C5 ",paraId:0,tocIndex:1},{value:"Node.js",paraId:0,tocIndex:1},{value:" \u4E14\u7248\u672C\u4E3A 16+ \u5373\u53EF\u3002",paraId:0,tocIndex:1},{value:`$ node -v
v16.14.2
`,paraId:1,tocIndex:1},{value:"\u786E\u4FDD\u5DF2\u5B89\u88C5",paraId:2,tocIndex:1},{value:"pnpm",paraId:2,tocIndex:1},{value:`$ pnpm -v
8.8.0
`,paraId:3,tocIndex:1},{value:"\u5728\u9879\u76EE\u6839\u76EE\u5F55\u8FD0\u884C",paraId:4,tocIndex:2},{value:`$ pnpm bootstrap
`,paraId:5,tocIndex:2},{value:"\u5728\u9879\u76EE\u6839\u76EE\u5F55\u8FD0\u884C",paraId:6,tocIndex:3},{value:`$ pnpm dev
`,paraId:7,tocIndex:3},{value:"\u6B64\u65F6\u8BBF\u95EE(",paraId:8,tocIndex:3},{value:"http://localhost:8000",paraId:8,tocIndex:3},{value:") \u5373\u53EF\u8FDB\u5165\u5E73\u53F0",paraId:8,tocIndex:3}]},16090:function(t,n,e){e.r(n),e.d(n,{texts:function(){return a}});var o=e(23781);const a=[{value:"\u5E73\u53F0\u91C7\u7528 antd \u7EC4\u4EF6\u5E93\uFF0C\u4E3B\u9898\u91C7\u7528 antd \u7684\u4E3B\u9898\u65B9\u6848\u3002",paraId:0,tocIndex:0},{value:"\u53EF\u4EE5\u5728 ",paraId:1,tocIndex:0},{value:"src/platform.config.ts",paraId:1,tocIndex:0},{value:" \u6587\u4EF6\u914D\u7F6E\u4E3B\u9898\u6837\u5F0F",paraId:1,tocIndex:0},{value:`export default {
  theme: {
    token: {
      colorPrimary: '#00b96b',
      borderRadius: 2,
      colorBgContainer: '#f6ffed',
    },
  },
};
`,paraId:2,tocIndex:0},{value:"\u5728 ",paraId:3,tocIndex:0},{value:"src/wrapper/theme-wrapper.tsx",paraId:3,tocIndex:0},{value:" \u6587\u4EF6\u914D\u7F6E\u4E3B\u9898\u6837\u5F0F",paraId:3,tocIndex:0},{value:`import { ConfigProvider } from 'antd';
import React from 'react';
import { Outlet } from 'umi';

const App: React.FC = () => (
  <ConfigProvider
    theme={{
      token: {
        colorPrimary: '#00b96b',
        borderRadius: 2,
        colorBgContainer: '#f6ffed',
      },
    }}
  >
    <Outlet />
  </ConfigProvider>
);

export default App;
`,paraId:4,tocIndex:0},{value:"\u5177\u4F53\u4E3B\u9898\u5B9A\u5236\u65B9\u6848\u8BF7\u53C2\u8003 ",paraId:5,tocIndex:0},{value:"\u5B9A\u5236\u4E3B\u9898",paraId:5,tocIndex:0}]},10364:function(t,n,e){e.r(n),e.d(n,{texts:function(){return a}});var o=e(77284);const a=[{value:"\u5982\u679C\u4F60\u60F3\u5728\u73B0\u6709\u7684 Vue \u9879\u76EE\u4E2D\u96C6\u6210 SecretPad \u524D\u7AEF\uFF0C\u8FD9\u91CC\u4F1A\u7ED9\u4F60\u4E00\u4E9B\u5EFA\u8BAE\u3002",paraId:0,tocIndex:0},{value:"\u8FD9\u91CC\u63A8\u8350\u5229\u7528 ",paraId:1,tocIndex:1},{value:"qiankun",paraId:1,tocIndex:1},{value:" \u5FAE\u524D\u7AEF\u6846\u67B6\u8FDB\u884C\u73B0\u6709 Vue \u9879\u76EE\u7684\u6539\u9020",paraId:1,tocIndex:1},{value:"\u5F97\u76CA\u4E8E SecretPad \u6A21\u5757\u7684\u9AD8\u5185\u805A\u3001\u4F4E\u8026\u5408\u7684\u8BBE\u8BA1\uFF0C\u5C06 SecretPad \u7684 React \u6A21\u5757\u8FC1\u79FB\u81F3 Vue \u4EC5\u9700\u8981\u5C11\u91CF\u7684\u5DE5\u4F5C",paraId:2,tocIndex:2},{value:"\u4F8B\u5982\u5982\u4E0B\u7684\u4E00\u4E2A\u6A21\u5757\uFF1A",paraId:3,tocIndex:2},{value:`export const DemoComponent = () => {
  const viewInstance = useModel(DemoModel);
  return (
    <div>
      {viewInstance.demoText}
      <button onClick={viewInstance.changeDemoText}>changeDemoText</button>
    </div>
  );
};

export class DemoModel extends Model {
  demoText = 'initialText';

  changeDemoText = () => {
    this.demoText = 'changed text';
  };
}
`,paraId:4,tocIndex:2},{value:"\u9996\u5148\u6211\u4EEC\u5148\u770B\u4E0B",paraId:5,tocIndex:2},{value:"DemoModel",paraId:5,tocIndex:2},{value:"\u7EE7\u627F\u7684 Model \u57FA\u7C7B\u505A\u4E86\u4EC0\u4E48",paraId:5,tocIndex:2},{value:"src/util/valtio-helper.ts",paraId:6,tocIndex:2},{value:`import { proxy } from 'valtio';

class Model {
  constructor() {
    return proxy(this);
  }

  onViewMount() {
    return;
  }

  onViewUnMount() {
    return;
  }
}
`,paraId:7,tocIndex:2},{value:"\u53EF\u4EE5\u770B\u5230\uFF0C\u5728 DemoModel \u5B9E\u4F8B\u5316\u7684\u65F6\u5019\uFF0C\u901A\u8FC7 valtio \u7684 proxy \u5C31\u81EA\u52A8\u62E5\u6709\u4E86\u54CD\u5E94\u5F0F\u7684\u80FD\u529B\u3002",paraId:8,tocIndex:2},{value:"\u6240\u4EE5\u6211\u4EEC\u7528\u4E00\u884C\u4EE3\u7801\uFF0C\u5C31\u80FD\u5C06\u6240\u6709\u7684 service \u548C viewModel \u8FC1\u79FB\u81F3 Vue",paraId:9,tocIndex:2},{value:"\u6211\u4EEC\u5BF9",paraId:10,tocIndex:2},{value:"src/util/valtio-helper.ts",paraId:10,tocIndex:2},{value:"\u505A\u5982\u4E0B\u4FEE\u6539",paraId:10,tocIndex:2},{value:`import { reactive } from 'vue';

class Model {
  constructor() {
    return reactive(this);
  }

  onViewMount() {
    return;
  }

  onViewUnMount() {
    return;
  }
}
`,paraId:11,tocIndex:2},{value:"\u628A",paraId:12,tocIndex:2},{value:"import {proxy} from 'valtio;",paraId:12,tocIndex:2},{value:" \u4FEE\u6539\u4E3A ",paraId:12,tocIndex:2},{value:"import { reactive } from 'vue';",paraId:12,tocIndex:2},{value:"\uFF0C\u7136\u540E\u6240\u6709\u7684\u975E UI \u4EE3\u7801\u5C31\u80FD\u590D\u7528\u4E86\u3002",paraId:12,tocIndex:2},{value:"\u63A5\u4E0B\u6765\uFF0C\u770B\u770B\u600E\u4E48\u548C Vue \u505A\u7ED3\u5408\u3002",paraId:13,tocIndex:2},{value:"demo.vue",paraId:14,tocIndex:2},{value:`<script setup>
  import { getModel } from '@/util/valtio-helper';

  // \u8FD9\u91CC\u53EF\u4EE5\u628ADemoModel\u5355\u72EC\u653E\u5230\u4E00\u4E2A\u6587\u4EF6\uFF0C\u4F8B\u5982demo.vm.ts
  class DemoModel extends Model {
    demoText = 'initialText';

    changeDemoText = () => {
      this.demoText = 'changed text';
    };
  }

  // \u901A\u8FC7getModel\u5F15\u5165\u540E\uFF0C\u793A\u4F8B\u5316\u7684DemoModel\u5C31\u81EA\u52A8\u62E5\u6709\u4E86vue\u7684\u54CD\u5E94\u5F0F\u80FD\u529B
  const viewInstance = getModel(DemoModel);
<\/script>

// \u8FD9\u91CC\u53EA\u9700\u8981\u628Areact\u7684\u5199\u6CD5\u6539\u4E3Avue\u7684\u6A21\u677F\u5199\u6CD5\u5C31\u597D\u4E86\uFF0C\u5927\u90E8\u5206\u4EE3\u7801\u90FD\u80FD\u76F4\u63A5\u590D\u7528
<template>
  <div>
    {{ viewInstance.demoText }}
    <button @click="viewInstance.changeDemoText">changeDemoText</button>
  </div>
</template>
<style></style>
`,paraId:15,tocIndex:2},{value:"\u8FD9\u6837\u5C31\u5B8C\u6210\u4E86\u6240\u6709\u4E00\u4E2A\u6A21\u5757\u7684\u8FC1\u79FB\uFF0C\u662F\u4E0D\u662F\u8D85\u7EA7\u7B80\u5355\u5462\uFF1F",paraId:16,tocIndex:2}]}}]);
