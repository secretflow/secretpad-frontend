---
nav: 文档
group:
  title: 微前端集成
  order: 6
order: 1
mobile: false
---

# qiankun

支持通过 [qiankun](https://qiankun.umijs.org/zh/guide) 进行集成, 可快速将其配置为 [qiankun](https://qiankun.umijs.org/zh/guide) 的子应用。

只需要在 `platform/config.ts` 中开启如下配置即可

```ts
export default defineConfig({
  plugins: ['@umijs/plugins/dist/qiankun'],
  qiankun: {
    slave: {},
  },
});
```

如果你的主应用项目是基于 `Umi` 开发的，可以开启以下配置接入子应用, 具体可参考 [UmiJS 文档](https://umijs.org/docs/max/micro-frontend)

```ts
export default defineConfig({
  qiankun: {
    master: {
      apps: [
        {
          name: 'secretpad',
          entry: '//localhost:8009', // 子应用启动的服务
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
```

在你的主应用项目中，访问 `/secretpad/*` 路由即可看到平台被成功接入。

如果你的主应用不是基于 `Umi` 开发的, 接入子应用请参考 [qiankun 文档](https://qiankun.umijs.org/zh/guide)
