export default class AsyncWorker {
  worker: Worker;
  promiseHooks: {
    resolve: (...args) => void;
    reject: (...args) => void;
  } = null;
  constructor(path) {
    this.worker = new Worker(path);
    this.worker.onmessage = (event) => {
      if (this.promiseHooks) {
        this.promiseHooks.resolve(event.data);
        this.promiseHooks = null;
      }
    };
    this.worker.onerror = (event) => {
      if (this.promiseHooks) {
        this.promiseHooks.reject(event);
        this.promiseHooks = null;
      }
    };
  }

  async execute(data) {
    if (this.promiseHooks) {
      this.worker.terminate();
      this.promiseHooks.reject("Worker restarted");
    }
    this.worker.postMessage(data);
    return new Promise((resolve, reject) => {
      this.promiseHooks = { resolve, reject };
    });
  }
}
