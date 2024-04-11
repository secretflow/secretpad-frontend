---
nav: 文档
group:
  title: 后端联调
  order: 4
order: 3
mobile: false
---

# openAPI

平台后端带有 swagger 服务，部署后默认访问路径为 `${server_url}/swagger_ui.html`

![swagger](/secretpad-frontend/swagger.jpg)

点击上图箭头所示位置，得到 swagger.json 的地址。将地址配置到`config/openapi.config.js`的 SWAGGER_JSON_PATH 变量

在 `apps/platform` 目录运行

```bash
$ pnpm openapi
```

即可自动生成 api 请求的相关代码

`config/openapi.config.js`

```js
const { generateService } = require('@umijs/openapi');
const fs = require('fs');
const path = require('path');

// 这里替换为本地服务的swagger.json的地址
const SWAGGER_JSON_PATH = 'https://petstore.swagger.io/v2/swagger.json';

const DIR_PATH = path.resolve(__dirname, '../', 'src', 'services');
const SUB_DIR_NAME = 'secretpad_openapi';

generateService({
  schemaPath: SWAGGER_JSON_PATH,
  serversPath: DIR_PATH,
  projectName: SUB_DIR_NAME,

  requestLibPath: "import request from 'umi-request'",
}).then(() => {
  const not_rename_files = ['index.ts', 'typings.d.ts'];

  const files_dirs = path.resolve(DIR_PATH, SUB_DIR_NAME);

  const generatedFiles = fs.readdirSync(files_dirs);

  generatedFiles.forEach((fileName) => {
    if (not_rename_files.indexOf(fileName) < 0) {
      fs.renameSync(
        path.resolve(files_dirs, fileName),
        path.resolve(
          files_dirs,
          fileName.charAt(0).toUpperCase() + fileName.slice(1),
        ),
      );
    }
  });
});
```
