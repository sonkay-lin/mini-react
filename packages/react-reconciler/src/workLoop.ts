import { beginWork } from './beginWork';
import { commitMutationEffects } from './commitWork';
import { completeWork } from './completeWork';
import { createWorkInProgress, FiberNode, FiberRootNode } from './fiber';
import { MutationMask, NoFlags } from './fiberFlags';
import { HostRoot } from './workTags';

// 指向当前正在更新的节点,因为js是单线程的
let workInProgress: FiberNode | null = null;

function prepareFreshStack(root: FiberRootNode) {
	workInProgress = createWorkInProgress(root.current, {});
}

export function scheduleUpdateOnFiber(fiber: FiberNode) {
	// 拿到根节点
	const root = markUpdateFromFiberToRoot(fiber);
	// 渲染根节点
	renderRoot(root);
}

// 链式调用拿到根节点
function markUpdateFromFiberToRoot(fiber: FiberNode) {
	let node = fiber;
	let parent = node.return;
	while (parent !== null) {
		node = parent;
		parent = node.return;
	}
	if (node.tag === HostRoot) {
		return node.stateNode;
	}
	return null;
}

// render包含 beginWork 和 compeleteWork 阶段
function renderRoot(root: FiberRootNode) {
	// 初始化, 将workInProgress赋值为根节点
	prepareFreshStack(root);
	do {
		try {
			// 递归构建fiber树
			workLoop();
			break;
		} catch (error) {
			if (__DEV__) {
				console.warn('workLoop发生错误', error);
			}
			workInProgress = null;
		}
	} while (true);
	// 更新完成的workInProgress并且带有标记的树
	const finishedWork = root.current.alternate;
	root.finishedWork = finishedWork;
	// wip fiberNode树树中的flags
	commitRoot(root);
}

// 将已经完成更新的组件树渲染到实际的 DOM 中 
function commitRoot(root: FiberRootNode) {
  // commit 阶段有3个子阶段
	const finishedWork = root.finishedWork;
	if (finishedWork === null) {
		return;
	}
	if (__DEV__) {
		console.warn('commit阶段开始', finishedWork);
	}
	root.finishedWork = null;
	// 判断是否存在3个子阶段需要执行操作
	// 子节点中是否需要更新的操作
	const subtreeHasEffect = (finishedWork.subtreeFlags & MutationMask) !== NoFlags;
	// 根节点中是否需要更新的操作
	const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;
	if (subtreeHasEffect || rootHasEffect) {
		// beforMutation
		// mutation
    commitMutationEffects(finishedWork)
    root.current = finishedWork
		// layout
	} else {
    root.current = finishedWork
	}
}

function workLoop() {
	while (workInProgress !== null) {
		performUnitOfWork(workInProgress);
	}
}

function performUnitOfWork(fiber: FiberNode) {
	const next = beginWork(fiber);
	fiber.memoizedProps = fiber.pendingProps;

	if (next === null) {
		// 如果递归完了，就去兄弟节点查找
		completeUnitOfWork(fiber);
	} else {
		workInProgress = next;
	}
}

function completeUnitOfWork(fiber: FiberNode) {
	let node: FiberNode | null = fiber;

	do {
		completeWork(node);
		const sibling = node.sibling;
		if (sibling !== null) {
			workInProgress = sibling;
			return;
		}
		// 如果没有兄弟节点，就返回父节点
		node = node.return;
		workInProgress = node;
	} while (node !== null);
}
