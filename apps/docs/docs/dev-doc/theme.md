---
nav: 文档
group:
  title: 平台配置
  order: 2
order: 1
mobile: false
---

# 主题配置

平台采用 antd 组件库，主题采用 antd 的主题方案。

1. 可以在 `src/platform.config.ts` 文件配置主题样式

```js
export default {
  theme: {
    token: {
      colorPrimary: '#00b96b',
      borderRadius: 2,
      colorBgContainer: '#f6ffed',
    },
  },
};
```

2. 在 `src/wrapper/theme-wrapper.tsx` 文件配置主题样式

```tsx | pure
import { ConfigProvider } from 'antd';
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
```

具体主题定制方案请参考 [定制主题](https://ant.design/docs/react/customize-theme-cn)
