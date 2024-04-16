import dotenv from 'dotenv';
import { defineConfig } from 'umi';

import { routes } from './routes';

let proxyOptions;
try {
  const config = dotenv.config().parsed;
  if (!config || !config?.PROXY_URL) {
    throw new Error();
  }
  proxyOptions = {
    proxy: {
      '/api': {
        target: config?.PROXY_URL,
        changeOrigin: true,
      },
    },
  };
} catch (e) {
  console.warn('如果在本地开发，需要做api代理，可以手动在platform目录下增加.env文件');
  console.warn('文件内容为：');
  console.warn(`
      PROXY_URL = http(s)://xxxxxx
  `);
}

export default defineConfig({
  routes,
  npmClient: 'pnpm',
  // https: {},
  svgr: {},
  title: '隐语开放平台',
  favicons: ['/favicon.ico'],
  extraBabelPlugins: [
    'babel-plugin-transform-typescript-metadata',
    'babel-plugin-parameter-decorator',
  ],
  mfsu: false,
  codeSplitting: {
    jsStrategy: 'granularChunks',
  },
  // oneApi: {
  //   apps: [
  //     {
  //       name: 'secretpad', // 后端应用名
  //       tag: 'release/0.6.0b0_cml', // 分支 tag
  //       source: 'ZAPPINFO', // 应用来源，默认 ZAPPINFO，其他来源可在官网的应用信息中查看
  //     },
  //   ],
  //   typescript: true, // 每个接口的类型定义，自动生成，默认 false
  // },
  esbuildMinifyIIFE: true,
  ...proxyOptions,
});
