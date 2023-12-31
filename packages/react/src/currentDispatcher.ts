// 当前使用的hooks的集合

import { Action } from 'shared/ReactTypes';

export interface Dispatcher {
	useState: <T>(initalState: (() => T) | T) => [T, Dispatch<T>];
}

export type Dispatch<State> = (action: Action<State>) => void;

const currentDispatcher: { current: Dispatcher | null } = {
	current: null
};

export const resolveDispatcher = (): Dispatcher => {
	const dispatcher = currentDispatcher.current;

	if (dispatcher === null) {
		throw new Error('hooks 只能在函数组件中执行');
	}

	return dispatcher;
};

export default currentDispatcher;
