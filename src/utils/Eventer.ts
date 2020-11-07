export default class Eventer {
    events: {
      [key: string]: TrackedEvent;
    } = {};
  
    ensureEvent(key): TrackedEvent {
      return this.events[key] || (this.events[key] = { subscriptions: [] });
    }
    on = (key, cb) => {
      if (typeof cb !== "function") throw new Error("You must pass a function when you subscribe");
      this.ensureEvent(key).subscriptions.push(cb);
    };
    off = (key, handler) => {
      let event = this.events[key];
      if (event) {
        event.subscriptions = event.subscriptions.filter(s => s !== handler);
      }
    };
    emit = (key, ...args) => {
      this.ensureEvent(key).subscriptions.forEach((s, i) => setTimeout(() => s.apply(null, args), 0));
    };
  }
  
  export interface TrackedEvent {
    subscriptions: Function[];
  }
  