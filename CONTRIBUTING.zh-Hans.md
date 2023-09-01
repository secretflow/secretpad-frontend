[English (US)](CONTRIBUTING.md) | 简体中文

# 贡献指南

## 协作

### 提交信息

我们使用
[Angular 的提交规范](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#commit-message-format)。

标题的格式是 `type: subject`:

- `type` 一个标签，表明这是一个什么提交（涉及什么样的变化）
- `subject` 提交内容的一句话描述
  - 使用英文的祈使句（这个提交会做什么）；首字母小写；不使用句号
- （我们暂时不使用 `scope`）

常用的 `type`:

- `fix` 这是一个修复缺陷的提交
- `feat` 这是一个添加新功能的提交
- `refactor` 这是一个对现有功能进行重构的提交
- `docs` 这个提交会更新文档（README/注释/...）
- `ci` 这个提交会对 CI 造成变化（改变了 ESLint 规则/升级了测试工具/更新了 GitHub
  Actions...）
- `chore` 其它不满足以上描述的变化（比如常规的依赖更新）

**如果你发现你的提交同时满足多个标签，你的提交需要被拆分成多个。**

示例：

```
feat: add ahooks
ci: update tooling config
refactor: remove useless ide-scql
docs: make issues/PR templates bilingual
```

### 来源分支

分支命名采用和提交信息相似的规范。格式是 `type/subject`，其中 `subject` 使用
`kebab-case` （全小写，使用 - 作为连字符），**分支名不需要加入你的名字。**
