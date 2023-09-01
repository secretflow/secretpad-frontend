type EventHandle<T> = (data: T) => void;

export class Emitter<T> {
  eventHandlers: EventHandle<T>[] = [];

  on = (handler: EventHandle<T>) => {
    this.eventHandlers.push(handler);
  };

  fire = (data: T) => {
    this.eventHandlers.forEach((evt) => {
      evt(data);
    });
  };

  dispose() {
    this.eventHandlers = [];
  }
}
