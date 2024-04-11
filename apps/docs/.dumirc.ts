import { defineConfig } from 'dumi';

export default defineConfig({
  publicPath: '/secretpad-doc/',
  base: '/secretpad-doc/',
  themeConfig: {
    hd: { rules: [] },
    rtl: true,
    name: 'SecretPad前端开发',
    logo: 'https://avatars.githubusercontent.com/u/103737651?s=48&v=4',
    footer: `Open-source MIT Licensed | Copyright © 2023-present
<br />
Powered by SecretPad`,
    prefersColor: { default: 'auto' },
    socialLinks: {
      github: 'https://github.com/secretflow/secretpad-frontend',
    },
  },
});
