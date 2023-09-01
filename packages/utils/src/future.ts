type FutureStatus = PromiseSettledResult<unknown>['status'] | 'pending';

/**
 * [Future](https://docs.python.org/3/library/asyncio-future.html#future-object)-like interface
 */
export class Future<T = void> implements Promise<T> {
  protected readonly awaitable: Promise<T>;

  protected setResult!: (result: T) => void;
  protected setException!: (reason: unknown) => void;

  protected _status: FutureStatus = 'pending';

  constructor() {
    this.awaitable = new Promise((resolve, reject) => {
      this.setResult = resolve;
      this.setException = reject;
    });
    this.then = this.awaitable.then.bind(this.awaitable);
    this.catch = this.awaitable.catch.bind(this.awaitable);
    this.finally = this.awaitable.finally.bind(this.awaitable);
  }

  done = () => this._status !== 'pending';

  get status() {
    return this._status;
  }

  protected set status(s: FutureStatus) {
    if (this.done()) {
      return;
    }
    this._status = s;
  }

  fulfill = (value: T) => {
    this.setResult(value);
    this.status = 'fulfilled';
  };

  reject = (reason?: unknown) => {
    this.setException(reason);
    this.status = 'rejected';
  };

  then: Promise<T>['then'];
  catch: Promise<T>['catch'];
  finally: Promise<T>['finally'];

  get [Symbol.toStringTag]() {
    return `[Future ${this._status}]`;
  }
}
