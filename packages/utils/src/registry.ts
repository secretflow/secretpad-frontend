export class Registry<T> {
  data: Set<T> = new Set();

  register(instance: T) {
    if (!this.data.has(instance)) {
      this.data.add(instance);
    }
  }

  unRegister(instance: T) {
    if (this.data.has(instance)) {
      this.data.delete(instance);
    }
  }

  getData = (): T[] => {
    return [...this.data];
  };
}

export function createRegistry<T>() {
  return new Registry<T>();
}
