import { Dispatcher, resolveDispatcher } from "./src/currentDispatcher";
import { jsxDEV } from "./src/jsx";
import currentDispatcher from "./src/currentDispatcher";

export const useState: Dispatcher['useState'] = (initalState) => {
  const dispatcher = resolveDispatcher()

  return dispatcher.useState(initalState)
}

// 数据共享层
export const _DATA_SHARED_LAYER = {
  currentDispatcher
}

export default {
  version: '1.0.0',
  createElement: jsxDEV
}