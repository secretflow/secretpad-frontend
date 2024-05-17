import { Model } from '@/util/valtio-helper';

export class DefaultRedoUndoService<T> extends Model {
  undoStack: T[] = [];
  redoStack: T[] = [];

  public init = () => {
    this.undoStack = [];
    this.redoStack = [];
  };

  // 记录
  public record = (snapshot: T) => {
    this.undoStack.push(snapshot);

    if (this.redoStack.length > 0) {
      this.redoStack = [];
    }

    return snapshot;
  };

  // 撤销
  public undo = () => {
    if (this.undoStack.length <= 0) {
      return;
    }

    const curr = this.undoStack.pop();
    this.redoStack.push(curr!);

    if (this.undoStack.length <= 0) {
      return [];
    }

    return this.undoStack[this.undoStack.length - 1];
  };

  // redo
  public redo = () => {
    if (this.redoStack.length <= 0) {
      return;
    }

    const curr = this.redoStack.pop();
    this.undoStack.push(curr!);

    return this.undoStack[this.undoStack.length - 1];
  };

  // 重做（重新来过）
  public reset = () => {
    this.undoStack = [];
    this.redoStack = [];

    return;
  };
}
