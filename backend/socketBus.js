import { EventEmitter } from "events";

let io = null;
const bus = new EventEmitter();

export function setIO(i) {
  io = i;
}

export function getIO() {
  return io;
}

// Internal kernel bus (server-side only)
export function emitInternal(event, payload) {
  bus.emit(event, payload);
}

export function onInternal(event, handler) {
  bus.on(event, handler);
}
