export const routes = [
  {
    path: '/',
    wrappers: ['@/wrappers/theme-wrapper', '@/wrappers/login-auth'],
    component: '@/modules/layout/layout.view',
    routes: [
      { path: '/', component: 'new-home' },
      { path: '/home', component: 'new-home' },
      { path: '/dag', component: 'dag' },
      { path: '/node', component: 'new-node', wrappers: ['@/wrappers/node-auth'] },
      { path: '/record', component: 'record' },
      { path: '/my-node', component: 'my-node', wrappers: ['@/wrappers/node-auth'] },
    ],
  },
  {
    path: '/guide',
    wrappers: ['@/wrappers/theme-wrapper', '@/wrappers/login-auth'],
    component: 'guide',
  },
  { path: '/login', wrappers: ['@/wrappers/theme-wrapper'], component: 'login' },
];
