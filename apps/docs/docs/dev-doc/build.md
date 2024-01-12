---
nav: 文档
group:
  title: 部署
  order: 5
order:
mobile: false
---

# 构建与前后端集成

当完成二开或者功能更新后，需要将项目重新构建并放在后端项目中一同部署。

## 平台构建

```bash
$ pnpm build
```

构建产物会在 `dist` 目录下生成。

## 部署

如果是与 [SecretPad](https://github.com/secretflow/secretpad/tree/main) 一同部署，需要先将构建产物放在 SecretPad 项目中，之后执行 SecretPad 镜像构建脚本。

在 SecretPad 下新建 `/secretpad-web/src/main/resources/static` 目录，将 `dist` 目录下的产物放在该目录中（如果已有该目录则进行文件替换），之后运行 SecretPad 的 `bash ./scripts/build.sh` 命令重新构建镜像（注意不是 `make build` 命令，`make build` 会拉取官方 Release 的前端产物构建镜像）。
