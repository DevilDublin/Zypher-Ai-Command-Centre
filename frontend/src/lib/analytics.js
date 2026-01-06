import { socket } from "./socket";

let listeners = [];

let state = {
  total: 0,
  processed: 0,
  remaining: 0,
};

socket.on("campaign:analytics", (data) => {
  state = { ...state, ...data };
  listeners.forEach((fn) => fn(state));
});

export function subscribeAnalytics(fn) {
  listeners.push(fn);
  fn(state);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}
