---
nav: 文档
group: 页面及模块开发
order: 5
mobile: false
---

# 权限校验

以登录校验举例

在首次进入平台的时候，判断用户是否从未登录过，如果是则跳转到登录界面。所以需要对所有页面做权限校验。

那么我们就可以利用 umi 的 wrapper 功能进行权限控制。如下：

`src/wrappers/login-auth.tsx`

```tsx | pure
import { Navigate, Outlet } from 'umi';

// 在这里控制是不是第一次进入平台
const BeginnerAuth = (props: any) => {
  const neverLogined = localStorage.getItem('neverLogined');
  if (!neverLogined) {
    localStorage.setItem('neverLogined', 'true');
    return <Navigate to="/login" />;
  }
  return <Outlet />;
};

export default BeginnerAuth;
```

在`config/route.ts`里面配置上我们写好的 wrapper

```js
export const routes = [
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
```

如果非首次进入平台，我们通过拦截 request 的响应进行登录判断。
在 `app.ts`内:

```ts
import { message } from 'antd';
import { history } from 'umi';
import request, { extend } from 'umi-request';

request.interceptors.response.use(async (response, options) => {
  const { status } = await response.clone().json();
  // 错误码202011603是未登录
  if (status.code === 202011603) {
    history.push('/login');
  }
  return response;
});
```
