---
nav: 文档
group: 页面及模块开发
order: 3
mobile: false
---

# 新增模块

## 什么是模块(module)

模块是由 UI 组件(UI Component + UI 状态 + 样式) + 模块服务组成的

## 模块的开发范式

我们使用了`valtio`进行组件状态的管理，并且基于`valtio`我们封装了我们的开发范式。

以简单的`TodoList`为例，看看一个模块的结构

```bash
└── src
    ├── modules
      ├── demoModule
        └── index.ts  // 模块入口
        └── demo.service.ts // 模块提供的服务
        └── demo.view.tsx // UI组件
        └── index.less // 样式
        └── types.ts // 类型定义


```

### UI 组件的开发范式

类似于 MVVM 的概念，一个 UI 组件分为了 view + viewModel

<code src="../../../platform/src/modules/example/todo-list.view.tsx"></code>

`src/modules/example/todo-list.view.tsx`

```tsx | pure
import { Button, Checkbox, List, Card } from 'antd';

import { getModel, useModel, Model } from '../../util/valtio-helper';

import { TodoListService } from './todo-list.service';
import type { TodoItem } from './types';

// 定义一个view
const TodoListComponent = () => {
  // 通过 useModel 方法把组件状态引入组件内
  const viewInstance = useModel(TodoListView);

  // 当viewInstance.list有变化时，会自动重新渲染组件
  return (
    <div>
      <Card
        title="TODO List"
        extra={
          <Button
            type="link"
            onClick={() =>
              viewInstance.addItem({
                title: 'new item' + viewInstance.list.length,
                description: 'desc',
              })
            }
          >
            + Add
          </Button>
        }
      >
        <List
          itemLayout="horizontal"
          dataSource={viewInstance.list}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Checkbox
                    checked={item.isFinished}
                    onChange={(e) => {
                      viewInstance.checkItem(item, e.target.checked);
                    }}
                  />
                }
                title={item.title}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

// 定义view对应的viewModel，只要集成了Model类，则所有的属性都是响应式的
export default TodoListComponent;
class TodoListView extends Model {
  // 可以通过getModel获取本模块或者其他模块的服务
  todoListService = getModel(TodoListService);

  // 所有的属性都是响应式的，属性的值变化时，会自动触发组件的更新
  list: TodoItem[] = [];

  // 组件挂载时会自动调用该方法
  onViewMount() {
    this.list = this.todoListService.todoList;
  }

  // 组件销毁时时会自动调用该方法
  onViewUnmount() {
    return;
  }

  checkItem(item: TodoItem, checked: boolean) {
    this.todoListService.changeStatus(item, checked);
  }

  addItem(item: Omit<TodoItem, 'isFinished'>) {
    this.todoListService.add(item);
  }
}
```

### 模块的服务

`服务` 表示和 UI 无关的相关状态及逻辑的处理

示例中，`Todo项管理` 提供的服务如下所示：

1. todoList 表示所有 Todo 项
2. add() 方法新建项目
3. changeStatus() 方法更新项目完成情况

这样，其他模块(例如授权管理、结果管理等等)均可以方便地通过 `getModel` 或者 `useModel`(React 组件内使用) 方法引用到，Todo 项管理模块提供的相关服务了。

`src/modules/example/todo-list.service.ts`

```ts
/**
 * This is the service for a to-do list. There are list of todo items. It allows to add
 * new items and change the status (if it's finished).
 */
export class TodoListService {
  /**
   * Todo list
   */
  todoList: TodoItem[] = [];

  /**
   * Add new todo item to the list.
   *
   * @param item the item to be added
   * @throws error when the title of item is duplicate
   */
  add(item: Omit<TodoItem, 'isFinished'>) {
    if (this.todoList.find((i) => i.title === item.title)) {
      throw new Error('This item is already there.');
    }
    this.todoList.push({
      ...item,
      isFinished: false,
    });
  }

  /**
   * Change the status of the item in the list
   *
   * @param item the item to be changed
   * @param isFinished the status
   */
  changeStatus(item: TodoItem, isFinished: boolean) {
    const i = this.todoList.find((todo) => todo.title === item.title);
    if (i) i.isFinished = isFinished;
  }
}
```
