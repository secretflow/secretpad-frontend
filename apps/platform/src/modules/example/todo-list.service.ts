import type { TodoItem } from './types';

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
