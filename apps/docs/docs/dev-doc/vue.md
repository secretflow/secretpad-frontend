---
nav: 文档
group:
  title: 迁移至vue框架
  order: 6
order: 1
mobile: false
---

# 集成到 Vue 项目

如果你想在现有的 Vue 项目中集成 SecretPad 前端，这里会给你一些建议。

## 场景一：SecretPad 平台或者某个页面直接集成

这里推荐利用 [qiankun](https://qiankun.umijs.org/zh/guide) 微前端框架进行现有 Vue 项目的改造

## 场景二：将 SecretPad 某个组件抽出来，放到 Vue 项目里面运行

得益于 SecretPad 模块的高内聚、低耦合的设计，将 SecretPad 的 React 模块迁移至 Vue 仅需要少量的工作

例如如下的一个模块：

```tsx | pure
export const DemoComponent = () => {
  const viewInstance = useModel(DemoModel);
  return (
    <div>
      {viewInstance.demoText}
      <button onClick={viewInstance.changeDemoText}>changeDemoText</button>
    </div>
  );
};

export class DemoModel extends Model {
  demoText = 'initialText';

  changeDemoText = () => {
    this.demoText = 'changed text';
  };
}
```

首先我们先看下`DemoModel`继承的 Model 基类做了什么

`src/util/valtio-helper.ts`

```ts
import { proxy } from 'valtio';

class Model {
  constructor() {
    return proxy(this);
  }

  onViewMount() {
    return;
  }

  onViewUnMount() {
    return;
  }
```

可以看到，在 DemoModel 实例化的时候，通过 valtio 的 proxy 就自动拥有了响应式的能力。

所以我们用一行代码，就能将所有的 service 和 viewModel 迁移至 Vue

我们对`src/util/valtio-helper.ts`做如下修改

```ts
import { reactive } from 'vue';

class Model {
  constructor() {
    return reactive(this);
  }

  onViewMount() {
    return;
  }

  onViewUnMount() {
    return;
  }
```

把`import {proxy} from 'valtio;` 修改为 `import { reactive } from 'vue';`，然后所有的非 UI 代码就能复用了。

接下来，看看怎么和 Vue 做结合。

`demo.vue`

```html
<script setup>
  import { getModel } from '@/util/valtio-helper';

  // 这里可以把DemoModel单独放到一个文件，例如demo.vm.ts
  class DemoModel extends Model {
    demoText = 'initialText';

    changeDemoText = () => {
      this.demoText = 'changed text';
    };
  }

  // 通过getModel引入后，示例化的DemoModel就自动拥有了vue的响应式能力
  const viewInstance = getModel(DemoModel);
</script>

// 这里只需要把react的写法改为vue的模板写法就好了，大部分代码都能直接复用
<template>
  <div>
    {{ viewInstance.demoText }}
    <button @click="viewInstance.changeDemoText">changeDemoText</button>
  </div>
</template>
<style></style>
```

这样就完成了所有一个模块的迁移，是不是超级简单呢？
