---
nav: 文档
group: 页面及模块开发
order: 2
mobile: false
---

# 新增页面

根据 umi 的约定式路由，平台所有页面都管理在 `src/pages`目录下

1. 在 `src/pages` 下新建一个 `xxx.tsx` 文件
2. 在`config/routes.ts`文件中，为新增的页面文件声明路由

   例如：
   我们在`src/pages`目录中新增了一个`new-page.tsx`文件。
   则可以如下声明路由：

```js
export const routes = [
  {
    path: '/',
    wrappers: ['@/wrappers/theme-wrapper', '@/wrappers/login-auth'],
    component: '@/modules/layout/layout.view',
    routes: [
      { path: '/', component: 'home' },
      { path: '/home', component: 'home' },
      { path: '/new-page', component: 'new-page' }, // 这是我们新增的页面
    ],
  },
];
```
