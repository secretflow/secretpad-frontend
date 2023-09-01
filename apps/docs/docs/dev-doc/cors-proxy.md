---
nav: 文档
group: 后端联调
order: 1
mobile: false
---

# 跨域代理

在前后端分离开发的时候，在本地调试代码会遇到跨域的问题。

可以通过 umi 自带的 proxy 功能进行跨域代理。

更多配置请参考 [umi 代理](https://umijs.org/docs/guides/proxy)

`config/config.ts`

```ts
import { defineConfig } from 'umi';

import { routes } from './routes';

export default defineConfig({
  proxy: {
    '/api': {
      target: 'http://开发服务地址',
      changeOrigin: true,
    },
});
```
