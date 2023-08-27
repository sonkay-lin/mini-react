// 什么是lane -> update 的优先级

import { FiberRootNode } from './fiber';

export type Lane = number;
export type Lanes = number;

export const SyncLane = 0b0001;
export const NoLane = 0b0000;
export const NoLanes = 0b0000;

export function mergeLanes(laneA: Lane, laneB: Lane): Lanes {
	return laneA | laneB;
}

export function requestUpdateLane() {
	return SyncLane;
}

// 获取优先级最高的lane
export function getHightPriorityLane(lane: Lane): Lane {
	return lane & -lane;
}

export function markRootFinised(root: FiberRootNode, lane: Lane) {
	root.pendingLanes &= ~lane;
}
