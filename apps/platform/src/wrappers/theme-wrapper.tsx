import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import React from 'react';
import { Outlet } from 'umi';

import platformConfig from '@/platform.config';

const App: React.FC = () => (
  <ConfigProvider theme={platformConfig.theme} locale={zhCN}>
    <Outlet />
  </ConfigProvider>
);

export default App;
