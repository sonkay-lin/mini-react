import { appendInitialChild, createInstance, createTextInstance } from 'hostConfig';
import { FiberNode } from './fiber';
import { NoFlags } from './fiberFlags';
import { HostComponent, HostRoot, HostText } from './workTags';

// 构建离屏的dom树
export const completeWork = (wip: FiberNode) => {
	const newProps = wip.pendingProps;
	const current = wip.alternate;

	switch (wip.tag) {
		case HostComponent:
      // 处理dom
			if (current !== null && wip.stateNode) {
				// update
			} else {
				// mount
				// 1.构建DOM
				const instance = createInstance(wip.type, newProps);
				// 2.将DOM插入到DOM树中
				appendAllChildren(instance, wip);
				//
				wip.stateNode = instance;
			}
      bubbleProperties(wip)
			return null;
		case HostText:
      // 处理文本
			if (current !== null && wip.stateNode) {
				// update
			} else {
				// mount
				// 1.构建DOM
				const instance = createTextInstance(newProps.content);
				wip.stateNode = instance;
			}
      bubbleProperties(wip)
			return null;
		case HostRoot:
      bubbleProperties(wip)
			return null;
		default:
			if (__DEV__) {
				console.warn('未处理的completeWork情况', wip);
			}
			break;
	}
  return null;
};

function appendAllChildren(parent: FiberNode, wip: FiberNode) {
	let node = wip.child;

	while (node !== null) {
		if (node?.tag === HostComponent || node?.tag === HostText) {
			appendInitialChild(parent, node?.stateNode);
		} else if (node.child !== null) {
			// 子节点存在，则继续往下递归
			node.child.return = node;
			node = node.child;
			continue;
		}
		// 终止条件
		if (node === wip) {
			return;
		}

		// 递归的归
		while (node.sibling === null) {
			if (node.return === null || node.return === wip) {
				return;
			}
			node = node?.return;
		}
		node.sibling.return = node.return;
		node = node.sibling;
	}
}

// completeWork性能优化策略
// flags分布在不同的fiberNode中，如何快速找到它们
// 利用completeWork向上遍历（归）的流程，将子fiberNode的flags冒泡到父fiberNode
function bubbleProperties(wip: FiberNode) {
  let subtreeFlags = NoFlags
  let child = wip.child

  while(child !== null) {
    subtreeFlags |= child.subtreeFlags
    subtreeFlags |= child.flags
    child.return = wip
    child = child.sibling
  }
  wip.subtreeFlags |= subtreeFlags
}