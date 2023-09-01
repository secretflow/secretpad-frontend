---
nav: 文档
group: 后端联调
order: 2
mobile: false
---

# 网络请求

平台使用[umi-request](https://github.com/umijs/umi-request)做为网络请求的前端库。

在`src/app.ts`内可以对请求库做配置、拦截等操作。

```ts
import { history } from 'umi';
import request, { extend } from 'umi-request';

request.interceptors.request.use((url, options) => {
  return {
    url: `${url}`,
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
```
