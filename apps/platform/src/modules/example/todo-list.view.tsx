import { Button, Checkbox, List, Card } from 'antd';

import { getModel, useModel, Model } from '../../util/valtio-helper';

import { TodoListService } from './todo-list.service';
import type { TodoItem } from './types';

const TodoListComponent = () => {
  const viewInstance = useModel(TodoListView);
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

export default TodoListComponent;
class TodoListView extends Model {
  todoListService = getModel(TodoListService);
  list: TodoItem[] = [];

  onViewMount() {
    this.list = this.todoListService.todoList;
  }

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
