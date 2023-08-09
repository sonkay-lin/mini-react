import { FiberNode } from './fiber';

let currentlyRenderingFiber: FiberNode | null = null

// 渲染function component
export function renderWithHooks(wip: FiberNode) {
  currentlyRenderingFiber = wip
  
	const Component = wip.type;
	const props = wip.pendingProps;
	const children = Component(props);

  currentlyRenderingFiber = null
	return children;
}
