export const routes = [
  {
    path: '/',
    wrappers: ['@/wrappers/theme-wrapper', '@/wrappers/login-auth'],
    component: '@/modules/layout/layout.view',
    routes: [
      { path: '/', component: 'new-home', wrappers: ['@/wrappers/center-auth'] },
      { path: '/home', component: 'new-home', wrappers: ['@/wrappers/center-auth'] },
      {
        path: '/dag',
        component: 'dag',
        wrappers: ['@/wrappers/p2p-center-auth', '@/wrappers/component-wrapper'],
      },
      {
        path: '/record',
        component: 'record',
        wrappers: ['@/wrappers/p2p-center-auth', '@/wrappers/component-wrapper'],
      },
      {
        path: '/model-submission',
        component: 'model-submission',
        wrappers: ['@/wrappers/p2p-center-auth', '@/wrappers/component-wrapper'],
      },
      {
        path: '/node',
        component: 'new-node',
        wrappers: ['@/wrappers/edge-auth', '@/wrappers/component-wrapper'],
      },
      {
        path: '/my-node',
        component: 'my-node',
        wrappers: ['@/wrappers/basic-node-auth', '@/wrappers/p2p-edge-center-auth'],
      },
      {
        path: '/message',
        component: 'message',
        wrappers: [
          '@/wrappers/basic-node-auth',
          '@/wrappers/p2p-edge-center-auth',
          '@/wrappers/component-wrapper',
        ],
      },
      {
        path: '/edge',
        component: 'edge',
        wrappers: ['@/wrappers/basic-node-auth', '@/wrappers/p2p-login-auth'],
      },
      { path: '/*', redirect: '/login' },
    ],
  },
  {
    path: '/',
    wrappers: [
      '@/wrappers/theme-wrapper',
      '@/wrappers/login-auth',
      '@/wrappers/guide-auth',
    ],
    component: '@/modules/layout/layout.view',
    routes: [{ path: '/guide', component: 'guide' }],
  },
  {
    path: '/login',
    wrappers: ['@/wrappers/theme-wrapper', '@/wrappers/login-wrapper'],
    component: 'login',
  },
];
