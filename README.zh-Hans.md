[English (US)](README.md) | 简体中文

# 隐语平台

## 开发

请确保有安装 [pnpm](https://pnpm.io/installation) 和
[Nx](https://turbo.build/repo/docs/installing)

```bash
npm -g install pnpm nx
npm -g exec pnpm setup
```

### 首次运行

```bash
pnpm bootstrap
```

> 这会 `pnpm install` 安装依赖，然后 `nx run-many --target=setup` 初始化所有包。

### 启动开发服务器

```bash
pnpm dev
```

默认在 http://localhost:8000 启动

### 代码格式化

```bash
pnpm fix
# 运行 ESLint/Stylelint/Prettier 并且尝试自动修正问题
```

### 检查及测试

```bash
pnpm lint
pnpm test
```

### 构建

```bash
pnpm build
```

构建产物可以通过 `pnpm serve` 命令进行预览。

### 对单个 package 进行操作

[https://pnpm.io/filtering](https://pnpm.io/filtering)

使用 package 的名称（`package.json` 中的 `"name"` 字段）或者 **相对路径**（必须以 `./`
开头）来指定要操作的 package.

```bash
pnpm --filter <package> <command> [...]

pnpm --filter web add react react-dom
pnpm --filter ./apps/web add react react-dom
# 将 react 和 react-dom 作为 dependencies 加到名为 web 的 package 中，其路径为 ./apps/web

pnpm --filter "@scope/*" run clean
pnpm --filter "./packages/*" run clean
# 使用 glob 来选择多个 package，表达式必须使用双引号包裹
```

#### 安装新依赖

[https://pnpm.io/cli/add](https://pnpm.io/cli/add)

使用以下命令：

`add` 安装普通依赖 `dependencies`

```bash
pnpm --filter <package> add [dependency ...]
# pnpm --filter web add react react-dom
```

`add -D` 安装开发依赖 `devDependencies`

```bash
pnpm --filter <package> add -D [dependency ...]
# pnpm --filter web add -D jest
```

`add --save-peer` 安装同伴依赖 `peerDependencies`

```bash
pnpm --filter <package> add --save-peer [dependency ...]
# pnpm --filter ui add --save-peer react "monaco-editor@^0.31.0"
```

💡 将内部 package 作为依赖，请使用与上面相同的命令并在命令末尾加上 `--workspace`

```bash
pnpm --filter <package> add [--save-dev|--save-peer] [dependency ...] --workspace
# pnpm --filter web add -D eslint-config-project --workspace
```

贡献指南见 [CONTRIBUTING.md](CONTRIBUTING.zh-Hans.md).
