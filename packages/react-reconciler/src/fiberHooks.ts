import { Dispatch, Dispatcher } from 'react/src/currentDispatcher';
import internals from 'shared/internals';
import { Action } from 'shared/ReactTypes';
import { FiberNode } from './fiber';
import {
	createUpdate,
	createUpdateQueue,
	enqueueUpdate,
	processUpdateQueue,
	UpdateQueue
} from './updateQueue';
import { scheduleUpdateOnFiber } from './workLoop';

// 正在渲染的fiber
let currentlyRenderingFiber: FiberNode | null = null;
// 正在执行的hook
let workInProgressHook: Hook | null = null;

let currentHook: Hook | null = null;

interface Hook {
	memoizedState: any;
	updateQueue: unknown;
	next: Hook | null;
}

// 数据共享层
const { currentDispatcher } = internals;

// 渲染function component
export function renderWithHooks(wip: FiberNode) {
	currentlyRenderingFiber = wip;
	// 重置 memoizedState保存hooks链表
	wip.memoizedState = null;

	const current = wip.alternate;

	if (current !== null) {
		// update
		currentDispatcher.current = HooksDispatcherOnUpdate;
	} else {
		// mount
		currentDispatcher.current = HooksDispatcherOnMount;
	}

	const Component = wip.type;
	const props = wip.pendingProps;
	const children = Component(props);

	currentlyRenderingFiber = null;
	workInProgressHook = null;
	currentHook = null;
	return children;
}
// 用于在组件挂载时触发 Hooks 的初始化机制
const HooksDispatcherOnMount: Dispatcher = {
	useState: mountState
};
// 组件更新时触发 Hooks 的更新机制
const HooksDispatcherOnUpdate: Dispatcher = {
	useState: updateState
};

function mountState<State>(initalState: (() => State) | State): [State, Dispatch<State>] {
	const hook = mountWorkInProgressHook();
	let memoizedState;
	if (initalState instanceof Function) {
		memoizedState = initalState();
	} else {
		memoizedState = initalState;
	}
	const queue = createUpdateQueue<State>();
	hook.updateQueue = queue;
	hook.memoizedState = memoizedState;

	// @ts-ignore
	const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue);
	queue.dispatch = dispatch;
	return [memoizedState, dispatch];
}

function updateState<State>(): [State, Dispatch<State>] {
	// 找到当前useState对应的hook数据
	const hook = updateWorkInProgressHook();
	// 计算state的逻辑
	const queue = hook.updateQueue as UpdateQueue<State>;
	const pending = queue.shared.pending;
	if (pending !== null) {
		const { memoizedState } = processUpdateQueue(hook.memoizedState, pending);
		hook.memoizedState = memoizedState;
	}

	return [hook.memoizedState, queue.dispatch as Dispatch<State>];
}

function dispatchSetState<State>(
	fiber: FiberNode,
	updateQueue: UpdateQueue<State>,
	action: Action<State>
) {
	// 更新流程
	const update = createUpdate(action);
	enqueueUpdate(updateQueue, update);
	scheduleUpdateOnFiber(fiber);
}
// 用于在组件首次渲染时创建和初始化 Hook 状态的方法。它会在组件的初始渲染阶段被调用，用于为每个 Hook 创建一个初始的 Hook 节点。
function mountWorkInProgressHook(): Hook {
	const hook: Hook = {
		memoizedState: null,
		updateQueue: null,
		next: null
	};
	if (workInProgressHook === null) {
		// mount时的第一个hook
		if (currentlyRenderingFiber === null) {
			throw new Error('请在函数组件内调用hook');
		} else {
			workInProgressHook = hook;
			currentlyRenderingFiber.memoizedState = workInProgressHook;
		}
	} else {
		// mount时后续的hook
		workInProgressHook.next = hook;
		workInProgressHook = hook;
	}
	return workInProgressHook;
}
// 用于更新组件函数组件中的 Hook 状态的方法。它用于在渲染过程中更新工作单元的 Hook 状态，以便在组件重新渲染时保持状态的一致性。
function updateWorkInProgressHook(): Hook {
	let nextCurrentHook: Hook | null;
	if (currentHook === null) {
		// 这是这个FC update时的第一个hook
		const current = currentlyRenderingFiber?.alternate;
		if (current !== null) {
			nextCurrentHook = current?.memoizedState;
		} else {
			nextCurrentHook = null;
		}
	} else {
		// 这个FC update时 后续的Hook
		nextCurrentHook = currentHook.next;
	}

	if (nextCurrentHook === null) {
		// hook在if条件下执行，抛出异常
		throw new Error(`组件${currentlyRenderingFiber?.type}本次执行时比上次执行多`);
	}

	currentHook = nextCurrentHook as Hook;
	const newHook: Hook = {
		memoizedState: currentHook?.memoizedState,
		updateQueue: currentHook?.updateQueue,
		next: null
	};
	if (workInProgressHook === null) {
		// mount时的第一个hook
		if (currentlyRenderingFiber === null) {
			throw new Error('请在函数组件内调用hook');
		} else {
			workInProgressHook = newHook;
			currentlyRenderingFiber.memoizedState = workInProgressHook;
		}
	} else {
		// mount时后续的hook
		workInProgressHook.next = newHook;
		workInProgressHook = newHook;
	}
	return workInProgressHook;
}
