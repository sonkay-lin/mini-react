import { Key, Props, ReactElementType, Ref } from 'shared/ReactTypes';
import { Flags, NoFlags } from './fiberFlags';
import { Container } from 'hostConfig';
import { FunctionComponent, HostComponent, WorkTag } from './workTags';

export class FiberNode {
	tag: WorkTag;
	key: Key;
  // 保存更新是的props属性
	pendingProps: Props;
  // 保存更新后的props属性
	memoizedProps: Props | null;
  // 用于保存组件的状态值
	memoizedState: any;
	/**
   * stateNode 是指向原生dom 连接虚拟 DOM 和实际 DOM 的桥梁
   * 在递归的归的过程中，生成的原生dom存放在stateNode中
   * 然后在commitRoot方法中将子节点加到stateNode中
   */ 
	stateNode: any;
	type: any;
	ref: Ref;
  // parent父节点
	return: FiberNode | null;
  // 兄弟节点
	sibling: FiberNode | null;
  // 子节点
	child: FiberNode | null;
  // 当前节点在兄弟节点中所处的索引
	index: number;

	/**
   * alternate 起到双缓冲的作用 用来存放上一次渲染时的 Fiber 节点的引用
	 * 如果当前为current则指向workInProgess
	 * 如果当前为workInProgess则指向current
	 */
	alternate: FiberNode | null;
  // flags属性用来判断当前节点是否需要更新和协调操作
	flags: Flags;
  // 用于标记child属性中(子节点)是否需要更新和协调操作
	subtreeFlags: Flags;

	updateQueue: unknown;
	constructor(tag: WorkTag, pendingProps: Props, key: Key) {
		this.tag = tag;
		this.key = key;
		// 对于HostComponent是div 来说保存了div DOM
		this.stateNode = null;
		this.type = null;

		// 构成树状结构
		// 表示节点之间的关系(指向父fiberNode)
		this.return = null;
		this.sibling = null;
		this.child = null;
		// 表示同级下的索引 eg: <ul> <li>index=0<li> <li>index=1<li> </ul>
		this.index = 0;
		this.ref = null;

		// 作为工作单元
		this.pendingProps = pendingProps;
		this.memoizedProps = null;
		this.memoizedState = null;
		this.updateQueue = null;

		this.alternate = null;
		// 副作用
		this.flags = NoFlags;
		this.subtreeFlags = NoFlags;
	}
}

export class FiberRootNode {
	// 挂载根节点的容器，在不同环境中，对应的container不同 我们称它为宿主环境
	container: Container;
  // 指向当前正在进行渲染和协调更新的 Fiber 节点
	current: FiberNode;
	// 保存整个流程更新完后的fiberNode
	finishedWork: FiberNode | null;
	constructor(container: Container, hostRootFiber: FiberNode) {
		this.container = container;
		this.current = hostRootFiber;
		// 将根节点赋值为当前的fiberRootNode
		hostRootFiber.stateNode = this;
		this.finishedWork = null;
	}
}

export const createWorkInProgress = (current: FiberNode, pendingProps: Props): FiberNode => {
	let wip = current.alternate;
	if (wip === null) {
		// mount
		wip = new FiberNode(current.tag, pendingProps, current.key);
		wip.stateNode = current.stateNode;
    // 将正在更新的节点的alternate赋值为旧节点current
		wip.alternate = current;
    // 将旧节点的alternate赋值为正在更新的节点wip
		current.alternate = wip;
	} else {
		// update
		wip.pendingProps = pendingProps;
		wip.flags = NoFlags;
		wip.subtreeFlags = NoFlags;
	}
	wip.type = current.type;
	wip.updateQueue = current.updateQueue;
	wip.child = current.child;
	wip.memoizedProps = current.memoizedProps;
	wip.memoizedState = current.memoizedState;
	return wip;
};

export function createFiberFromElement(element: ReactElementType): FiberNode {
	const { type, key, props } = element;
	let fiberTag: WorkTag = FunctionComponent;

	if (typeof type === 'string') {
		// 对于<div>来说type: 'div'
		fiberTag = HostComponent;
	} else if (typeof type !== 'function' && __DEV__) {
		console.warn('未定义的type类型', element);
	}
	const fiber = new FiberNode(fiberTag, props, key);
	fiber.type = type;
	return fiber;
}
