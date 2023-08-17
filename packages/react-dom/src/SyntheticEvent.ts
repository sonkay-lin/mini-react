import { Container } from 'hostConfig';
import { Props } from 'shared/ReactTypes';

// react-dom 相关的事件系统
export const elementPropsKey = '_props';
const validEventTypeList = ['click'];
type EventCallback = (e: Event) => void;
interface SyntheticEvent extends Event {
	__stopPropagation: boolean;
}
interface Paths {
	capture: EventCallback[];
	bubble: EventCallback[];
}

export interface DOMElement extends Element {
	[elementPropsKey]: Props;
}

export function updateFiberProps(node: DOMElement, props: Props) {
	node[elementPropsKey] = props;
}

export function initEvent(container: Container, eventType: string) {
	if (!validEventTypeList.includes(eventType)) {
		console.warn('当前不支持', eventType, '事件');
		return;
	}
	if (__DEV__) {
		console.log('初始化事件', eventType);
	}
	container.addEventListener(eventType, (e) => {
		dispatchEvent(container, eventType, e);
	});
}

function dispatchEvent(container: Container, eventType: string, e: Event) {
	const targetElement = e.target;
	if (targetElement === null) {
		console.warn('事件不存在', e);
		return;
	}
	// 1. 收集沿途的事件
	const { bubble, capture } = collectPaths(targetElement as DOMElement, container, eventType);
	// 2. 构造合成事件
	const se = createSyntheticEvent(e);
	// 3. 遍历capture
	triggerEventFlow(capture, se);
	if (!se.__stopPropagation) {
		// 没有阻止事件才遍历冒泡
		// 4. 遍历bubble
		triggerEventFlow(bubble, se);
	}
}

function collectPaths(targetElement: DOMElement, container: Container, eventType: string) {
	const paths: Paths = {
		capture: [],
		bubble: []
	};

	while (targetElement && targetElement !== container) {
		// 收集
		const elementProps = targetElement[elementPropsKey];
		if (elementProps) {
			const callbackNameList = getEventCallbackNameFromEventType(eventType);
			if (callbackNameList) {
				callbackNameList.forEach((callbackName, i) => {
					const eventCallback = elementProps[callbackName];
					if (eventCallback) {
						if (i === 0) {
							// 捕获的事件
							paths.capture.unshift(eventCallback);
						} else {
							// 冒泡的事件
							paths.bubble.push(eventCallback);
						}
					}
				});
			}
		}
		targetElement = targetElement.parentNode as DOMElement;
	}

	return paths;
}

// 创建合成事件
function createSyntheticEvent(e: Event) {
	const syntheticEvent = e as SyntheticEvent;
	syntheticEvent.__stopPropagation = false;
	// 原始的stopPropagation
	// stopPropagation() 方法阻止捕获和冒泡阶段中当前事件的进一步传播
	const originStopPropagation = e.stopPropagation;
	// 合成事件下的stopPropagation方法
	syntheticEvent.stopPropagation = () => {
		syntheticEvent.__stopPropagation = true;
		if (originStopPropagation) {
			originStopPropagation();
		}
	};
	return syntheticEvent;
}

function triggerEventFlow(paths: EventCallback[], se: SyntheticEvent) {
	for (let i = 0; i < paths.length; i++) {
		const callback = paths[i];
		callback.call(null, se);
		if (se.__stopPropagation) {
			// 阻止事件继续传播
			break;
		}
	}
}

// 获取事件回调名
function getEventCallbackNameFromEventType(eventType: string): string[] | undefined {
	return {
		click: ['onClickCapture', 'onClick']
	}[eventType];
}
